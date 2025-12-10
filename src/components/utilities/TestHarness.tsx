import React, { useCallback, useMemo, useState } from 'react';

type TestResult = {
  name: string;
  ok: boolean;
  error?: string;
  durationMs: number;
};

export const TestHarness: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);



  const TESTS_ENABLED = (import.meta as any)?.env?.VITE_EMBEDDED_TESTS === '1';

  const tests = useMemo(() => {
    if (!TESTS_ENABLED) return [] as Array<{ name: string; fn: () => Promise<void> }>;

    return [
      {
        name: 'AiAssistantConfig helpers',

        fn: async () => {
          const aliasPath: string = '@/tests/aiAssistantConfig.test.ts';
          const relPath: string = '../../tests/aiAssistantConfig.test.ts';
          try {
            const mod: any = await import( (aliasPath as any));
            await mod?.runAiAssistantConfigTests?.();
          } catch (e1) {
            try {
              const modRel: any = await import( (relPath as any));
              await modRel?.runAiAssistantConfigTests?.();
            } catch (e2) {
              const combined = new Error(
                'Failed to load AiAssistantConfig test module via alias and relative paths.'
              );
              (combined as any).cause = { aliasError: e1, relativeError: e2 };
              throw combined;
            }
          }
        },
      },
    ];
  }, [TESTS_ENABLED]);

  const runAll = useCallback(async () => {
    setRunning(true);
    const out: TestResult[] = [];
    for (const t of tests) {
      const start = performance.now();
      try {

        await t.fn();
        out.push({ name: t.name, ok: true, durationMs: performance.now() - start });
      } catch (err: any) {
        out.push({
          name: t.name,
          ok: false,
          error: err?.stack || String(err),
          durationMs: performance.now() - start,
        });
      }
    }
    setResults(out);
    setRunning(false);
  }, [tests]);


  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const envAuto = (import.meta as any)?.env?.VITE_AUTORUN === '1';
      if (sp.has('tests') && (sp.get('autorun') === '1' || sp.get('auto') === '1')) {
        runAll();
      } else if (envAuto) {
        runAll();
      }
    } catch {}
  }, [runAll]);

  const passCount = results?.filter(r => r.ok).length ?? 0;
  const failCount = results?.filter(r => !r.ok).length ?? 0;

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 9999,
        background: 'var(--glass-background, rgba(20,20,20,0.6))',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
        borderRadius: 12,
        padding: 12,
        width: 360,
        color: 'var(--color-text, #fff)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
      }}
      aria-live="polite"
    >
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
      >
        <strong>Test Harness</strong>
        <button
          onClick={runAll}
          disabled={running}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid var(--color-border, rgba(255,255,255,0.15))',
            background: running ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.15)',
            color: '#fff',
            cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          {running ? 'Running…' : 'Run tests'}
        </button>
      </div>

      {results ? <div style={{ marginTop: 8, fontSize: 12 }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: failCount ? '#f87171' : '#34d399' }}>
              {passCount} passed, {failCount} failed
            </span>
          </div>
          <ul
            style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 240, overflow: 'auto' }}
          >
            {results.map(r => (
              <li
                key={r.name}
                style={{ padding: '6px 0', borderTop: '1px dashed rgba(255,255,255,0.1)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span>{r.name}</span>
                  <span style={{ color: r.ok ? '#34d399' : '#f87171' }}>
                    {r.ok ? 'PASS' : 'FAIL'} · {r.durationMs.toFixed(1)}ms
                  </span>
                </div>
                {!r.ok && (
                  <pre
                    style={{
                      marginTop: 6,
                      whiteSpace: 'pre-wrap',
                      background: 'rgba(0,0,0,0.3)',
                      padding: 8,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {r.error}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        </div> : null}

      <div style={{ marginTop: 8, opacity: 0.8, fontSize: 11 }}>
        Tip: add <code>?tests=1&autorun=1</code> to the URL to auto-run.
      </div>
    </div>
  );
};

export default TestHarness;
