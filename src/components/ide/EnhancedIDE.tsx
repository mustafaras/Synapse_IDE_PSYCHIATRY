
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useAppStore, useLayoutActions } from '../../stores/appStore';
import {
  useActiveTab,
  useDirtyTabs,
  useEditorStore,
  useTabActions,
} from '../../stores/editorStore';
import { useFileExplorerStore, useFileOperations } from '../../stores/fileExplorerStore';
const MonacoEditor = React.lazy(() =>
  import('../editor/MonacoEditor').then(m => ({ default: m.MonacoEditor }))
);
import { AiAssistant } from '../ai/index';
import { SynapseCoreAIPanel } from '../ai/panel/SynapseCoreAIPanel';
import { flags } from '../../config/flags';
import { FileExplorer } from '../file-explorer/FileExplorer';
import NewFileModal from '../file-explorer/NewFileModal';
import { SYNAPSE_COLORS, withAlpha } from '../../ui/theme/synapseTheme';
import { Terminal } from '../terminal/components/Terminal';
import { Folder, Plus } from 'lucide-react';
import { BEGINNER_ASSISTANT_ENABLED } from '../../features/beginnerAssistant';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import IdeThemeScope from './IdeThemeScope';
import '@/ui/theme/ideProScope.css';
import { GlobalSearch } from './GlobalSearch';
import { registerCommands } from '../../services/commandRegistry';
import {
  applyPlan,
  dryRunPlan,
  getActiveProjectId,
  getLastPlan,
  loadThread,
  notify,
  recordTelemetry,
  refreshProjectBrief,
  telemetryVerbose,
} from '../ai/index';
import { buildApplyPlan } from '@/utils/ai/apply/buildApplyPlan';
import { executeApplyPlan } from '@/utils/ai/apply/executeApplyPlan';
import { insertIntoActive as editorInsertIntoActive } from '@/services/editorBridge';
import { terminalInfo } from '../terminal/terminalLogBus';
import { triggerTask } from '../../services/tasksBridge';
import { subscribeEditorBridge } from '@/services/editor/bridge';
import { reportError } from '@/lib/error-bus';


export const EnhancedIDE: React.FC = () => {
  console.warn('EnhancedIDE render');

  const layout = useAppStore(s => s.layout);
  const isLoading = useAppStore(s => s.isLoading);
  const { toggleSidebar, toggleTerminal, toggleAiChat } = useLayoutActions();
  useEffect(() => {

    try {
      if (typeof window !== 'undefined') {
        (window as any).e2e = (window as any).e2e || {};
        (window as any).e2e.toggleAI = () => { try { toggleAiChat(); } catch {} };
        (window as any).e2e.setAiChatVisible = (v: boolean) => {
          try { useAppStore.getState().updateLayout({ aiChatVisible: !!v }); } catch {}
        };
        (window as any).e2e.openAssistant = async () => {
          try {
            useAppStore.getState().updateLayout({ aiChatVisible: true });

            await new Promise(r => setTimeout(r, 0));
          } catch {}
        };
      }
    } catch {}
  }, [toggleAiChat]);


  const tabs = useEditorStore(s => s.tabs);
  const activeTabId = useEditorStore(s => s.activeTabId);
  const { openTab, closeTab, setActiveTab, moveTab, closeOtherTabs, pinTab, unpinTab } =
    useTabActions();

  const closeTabsToRight = useEditorStore(s => s.closeTabsToRight);
  const activeTab = useActiveTab();
  const dirtyTabs = useDirtyTabs();


  const { addFile: addFileNode, clearFiles } = useFileOperations();


  const { closeAllTabs } = useTabActions();


  const [aiAssistantWidth, setAiAssistantWidth] = useState(layout.aiAssistantWidth || 500);

  const [sidebarPreviewWidth, setSidebarPreviewWidth] = useState<number | null>(null);
  const MIN_SIDEBAR = 220;
  const MAX_SIDEBAR = 600;
  const DEFAULT_SIDEBAR = 375;
  const MIN_EDITOR_WIDTH = 680;

  useEffect(() => {

    if (layout.aiAssistantWidth && layout.aiAssistantWidth !== aiAssistantWidth) {
      setAiAssistantWidth(layout.aiAssistantWidth);
    }
  }, [layout.aiAssistantWidth, aiAssistantWidth]);


  useEffect(() => {
    registerCommands([
      { id: 'file.new', label: 'New File', shortcut: 'Ctrl+N', run: () => setShowNewFileModal(true) },
      { id: 'view.toggleSidebar', label: 'Toggle Sidebar', run: toggleSidebar },
      { id: 'view.toggleTerminal', label: 'Toggle Terminal', run: toggleTerminal },
    ]);
  }, [toggleSidebar, toggleTerminal]);


  useEffect(() => {
    return subscribeEditorBridge((e) => {
      if (e.type !== 'editor:openTab') return;
      try {
        const { filename, code, language } = e.payload;
        const fileNode = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: filename.includes('/') ? filename.substring(filename.lastIndexOf('/')+1) : filename,
          type: 'file' as const,
          path: filename.startsWith('/') ? filename.slice(1) : filename,
          content: code,
          language: language || 'plaintext',
          lastModified: new Date(),
          size: code.length,
        };
    addFileNode(fileNode as any, '/');
  openTab(fileNode as any);
      } catch (err: any) {
        reportError({ source: 'ui', code: 'unknown', message: String(err?.message || err) });
      }
    });
  }, [openTab, addFileNode]);


  useEffect(() => {
    if (!layout.sidebarCollapsed && layout.sidebarWidth !== 375) {

      if (layout.sidebarWidth === 300) {
        try {
          useAppStore.getState().setSidebarWidth(375);
        } catch {}
      }
    }
  }, [layout.sidebarWidth, layout.sidebarCollapsed]);


  useEffect(() => {
    if (
      layout.terminalHeight === 40 ||
      layout.terminalHeight === 56 ||
      layout.terminalHeight === 84
    ) {
      try {
        useAppStore.getState().setTerminalHeight(320);
      } catch {}
    }
  }, [layout.terminalHeight]);


  const handleTabClick = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
    },
    [setActiveTab]
  );


  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const handleNewFile = () => setShowNewFileModal(true);


  const handleReorderTabs = useCallback(
    (from: number, to: number) => {
      try {
        moveTab(from, to);
      } catch (e) {
        console.warn('Tab reorder failed', e);
      }
    },
    [moveTab]
  );
  const [isCmdOpen, setCmdOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const handleOpenCommandPalette = useCallback(() => setCmdOpen(true), []);
  const handleGlobalSearch = useCallback(() => setSearchOpen(true), []);

  const { saveDirtyTabs } = useTabActions();
  const handleSaveAll = useCallback(() => {
    const count = dirtyTabs.length;
    if (count === 0) {
      terminalInfo('No changes to save.');
      return;
    }
    saveDirtyTabs();
    terminalInfo(`Saved ${count} tab${count > 1 ? 's' : ''}.`, 'build');
  }, [dirtyTabs, saveDirtyTabs]);

  const handleRun = useCallback(() => {
    triggerTask('run');
  }, []);
  const handleBuild = useCallback(() => {
    triggerTask('build');
  }, []);


  useEffect(() => {
    registerCommands([
      { id: 'file.saveAll', label: 'Save All', shortcut: 'Ctrl+Shift+S', run: handleSaveAll },
      { id: 'task.run', label: 'Run Dev Server', run: handleRun },
      { id: 'task.build', label: 'Build Project', run: handleBuild },
      {
        id: 'ai.dev.runGoldenTasksMock',
        label: 'AI (Dev) → Run Golden Tasks (Mock Provider)',
        run: async () => {
          try {

            notify('success', 'Golden tasks finished. See console table.');
          } catch {
            notify('error', 'Golden tasks failed.');
          }
        },
      },
      {
        id: 'ai.plan.dryRunLast',
        label: 'AI → Dry-Run Last File Plan',
        shortcut: 'Alt+Shift+D',
        run: async () => {
          try {
            const plan = getLastPlan?.();
            if (!plan) {
              notify('info', 'No cached file plan. Ask AI to propose a plan first.');
              return;
            }
            await dryRunPlan(plan);
          } catch {
            notify('error', 'Dry-run failed.');
          }
        },
      },
      {
        id: 'ai.plan.applyLast',
        label: 'AI → Apply Last File Plan',
        shortcut: 'Alt+Shift+A',
        run: async () => {
          try {
            const plan = getLastPlan?.();
            if (plan) {
              await applyPlan(plan);
              return;
            }

            const fe = useFileExplorerStore.getState();
            const ed = useEditorStore.getState();
            const existing = new Set<string>();
            const walk = (nodes: any[]) => { for (const n of nodes) { if (n.type === 'file') existing.add(n.path); if (n.children) walk(n.children); } };
            walk(fe.files);
            const projectId = getActiveProjectId();
            const thread: any = await (loadThread as unknown as (id: string) => any)(projectId as any);
            const lastAi = [...thread.messages].reverse().find(m => m.role === 'assistant' && (m.content?.trim()?.length || 0) > 0);
            if (!lastAi) {
              notify('info', 'No cached file plan or assistant message to parse.');
              return;
            }

            const lastMode = (lastAi as any)?.mode as ('beginner'|'pro'|undefined);
            const planBuilt = buildApplyPlan({
              rawAssistantText: lastAi.content,
              selectedLanguageId: 'typescript',
              mode: (lastMode as any) || ('beginner' as const),
              defaultDir: 'src',
              existingPaths: existing,
            });
            const api = {
              fileExists: (path: string) => !!fe.getFileByPath(path),
              readFile: (path: string) => fe.getFileByPath(path)?.content ?? null,
              createFile: (path: string, content: string, monacoLang: string) => {
                const name = path.includes('/') ? path.slice(path.lastIndexOf('/') + 1) : path;
                const fileNode = {
                  id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  name,
                  type: 'file' as const,
                  path,
                  content,
                  language: monacoLang,
                  lastModified: new Date(),
                  size: content.length,
                };
                const parent = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '/';
                useFileExplorerStore.getState().addFile(fileNode as any, parent || '/');
                useEditorStore.getState().openTab(fileNode as any);
              },
              replaceFile: (path: string, content: string, monacoLang: string) => {
                const node = fe.getFileByPath(path);
                if (!node) return;
                useFileExplorerStore.getState().updateFile(node.id, { content, language: monacoLang });
                const tab = ed.tabs.find(t => t.path === path);
                if (tab) {
                  useEditorStore.getState().updateTabContent(tab.id, content);
                }
              },
              insertIntoActive: (content: string, monacoLang: string) => {


                void editorInsertIntoActive({ code: content, language: monacoLang as any });
              },
              setActiveTab: (path: string) => {
                const tab = ed.tabs.find(t => t.path === path);
                if (tab) useEditorStore.getState().setActiveTab(tab.id);
              },
              pushUndoSnapshot: (path: string, prevContent: string) => {
                const tab = ed.tabs.find(t => t.path === path);
                const tabId = tab?.id ?? ed.activeTabId;
                if (!tabId) return;
                const cursor = tab?.cursorPosition || { line: 1, column: 1 };
                useEditorStore.getState().addToHistory(tabId, prevContent, cursor);
              },
            } as any;
            executeApplyPlan(planBuilt, api, { preferInsertIntoActive: ((lastMode as any) || 'beginner') === 'beginner', focusEditorAfter: true });
            notify('success', 'Applied plan from last assistant message.');
          } catch {
            notify('error', 'Apply failed.');
          }
        },
      },
  {
        id: 'ai.refreshProjectBrief',
        label: 'AI → Refresh Project Brief',
        shortcut: 'Alt+Shift+B',
        run: async () => {
          try {
            const fe = useFileExplorerStore.getState();
            const ed = useEditorStore.getState();
            const listFiles = async () => {

              const out: string[] = [];
              const walk = (nodes: any[]) => {
                for (const n of nodes) {
                  if (n.type === 'file') out.push(n.path);
                  if (n.children) walk(n.children);
                }
              };
              walk(fe.files);
              return out;
            };
            const getFileText = async (path: string) => fe.getFileByPath(path)?.content ?? null;
            const getActiveFile = () => {
              const id = ed.activeTabId;
              if (!id) return null;
              const tab = ed.tabs.find(t => t.id === id);
              return tab ? { path: tab.path, content: tab.content } : null;
            };
            const getRecentEdited = () => {
              try {
                const pairs = Object.entries(ed.history);
                const scored: Array<{ path: string; ts: number }> = [];
                for (const [tabId, h] of pairs) {
                  const tab = ed.tabs.find(t => t.id === tabId);
                  if (!tab) continue;
                  const last = h.undo.length ? h.undo[h.undo.length - 1] : null;
                  const tsVal = last?.timestamp as unknown as (Date | string | number | undefined);
                  const ts = tsVal ? new Date(tsVal as any).getTime() : 0;
                  scored.push({ path: tab.path, ts });
                }
                scored.sort((a, b) => b.ts - a.ts);
                const seen = new Set<string>();
                const out: string[] = [];
                for (const s of scored) {
                  if (!seen.has(s.path)) {
                    seen.add(s.path);
                    out.push(s.path);
                  }
                }
                return out;
              } catch {
                return [] as string[];
              }
            };
            await (refreshProjectBrief as unknown as (opts: any) => Promise<void> | void)({ listFiles, getFileText, getActiveFile, getRecentEdited });
  recordTelemetry({ type: 'code/insert', bytes: 0 });
    if (telemetryVerbose()) console.warn('📌 Project Brief pinned to context.');
          } catch (e) {
            console.warn('Refresh Project Brief failed', e);
          }
        },
      },
    ]);
  }, [handleSaveAll, handleRun, handleBuild]);


  useEffect(() => {
    type RunSel = (action: 'improve' | 'explain' | 'commentize') => void;
    const runSel: RunSel = action => {
      try {
        (window as unknown as { synapseRunAiOnSelection?: RunSel }).synapseRunAiOnSelection?.(action);
      } catch (e) {
        console.warn('AI selection action failed', e);
      }
    };
    registerCommands([
      { id: 'ai.improveSelection', label: 'AI: Improve Selection', shortcut: 'Ctrl+Alt+I', run: () => runSel('improve') },
      { id: 'ai.explainSelection', label: 'AI: Explain Selection', shortcut: 'Ctrl+Alt+E', run: () => runSel('explain') },
      { id: 'ai.addBeginnerComments', label: 'AI: Add Beginner Comments', shortcut: 'Ctrl+Alt+C', run: () => runSel('commentize') },
    ]);
  }, []);


  const handleClearWorkspace = () => {
    if (confirm('Tüm dosyalar ve açık sekmeler temizlenecek. Devam etmek istiyor musunuz?')) {
      clearFiles();
      closeAllTabs();
    }
  };


  const handleOpenProject = async () => {
    try {

      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker({
          mode: 'read',
        });

        await loadDirectoryContents(directoryHandle, '/');
      } else {

        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;

        input.onchange = async event => {
          const files = (event.target as HTMLInputElement).files;
          if (files) {
            await loadFilesFromInput(files);
          }
        };

        input.click();
      }
    } catch (error) {
      console.error('Error opening project:', error);

      alert('Error opening project. Please try again or check browser permissions.');
    }
  };


  const loadDirectoryContents = async (dirHandle: any, basePath: string) => {
    try {

      if (basePath === '/') {
        clearFiles();
      }

      for await (const [name, handle] of dirHandle.entries()) {
        const fullPath = basePath === '/' ? `/${name}` : `${basePath}/${name}`;

        if (handle.kind === 'file') {

          const file = await handle.getFile();
          const language = getLanguageFromExtension(name);
          const content = await file.text();

          const fileData = {
            id: `file-${Date.now()}-${Math.random()}`,
            name,
            type: 'file' as const,
            path: fullPath,
            content,
            language,
            lastModified: new Date(file.lastModified),
            size: file.size,
          };

          addFileNode(fileData);
        } else if (handle.kind === 'directory') {

          const folderData = {
            id: `folder-${Date.now()}-${Math.random()}`,
            name,
            type: 'folder' as const,
            path: fullPath,
            content: '',
            language: '',
            lastModified: new Date(),
            size: 0,
          };

          addFileNode(folderData);


          await loadDirectoryContents(handle, fullPath);
        }
      }
    } catch (error) {
      console.error('Error loading directory contents:', error);
    }
  };


  const loadFilesFromInput = async (files: FileList) => {
    try {

      clearFiles();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const language = getLanguageFromExtension(file.name);
        const content = await file.text();

        const fileData = {
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: 'file' as const,
          path: `/${file.webkitRelativePath || file.name}`,
          content,
          language,
          lastModified: new Date(file.lastModified),
          size: file.size,
        };

  addFileNode(fileData);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };


  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sql: 'sql',
      sh: 'shell',
      bash: 'shell',
      zsh: 'shell',
      ps1: 'powershell',
      dockerfile: 'dockerfile',
      vue: 'vue',
      svelte: 'svelte',
      r: 'r',
      matlab: 'matlab',
      m: 'matlab',
    };

    return languageMap[ext || ''] || 'plaintext';
  };


  const LANGUAGE_EXT_MAP: Record<string, string> = {
    react: '.tsx',
    javascript: '.js',
    typescript: '.ts',
    jsx: '.jsx',
    tsx: '.tsx',
    html: '.html',
    css: '.css',
    scss: '.scss',
    vue: '.vue',
    svelte: '.svelte',
    angular: '.ts',
    python: '.py',
    java: '.java',
    csharp: '.cs',
    cpp: '.cpp',
    c: '.c',
    go: '.go',
    rust: '.rs',
    php: '.php',
    ruby: '.rb',
    kotlin: '.kt',
    scala: '.scala',
    nodejs: '.js',
    json: '.json',
    yaml: '.yml',
    toml: '.toml',
    ini: '.ini',
    xml: '.xml',
    markdown: '.md',
    sql: '.sql',
    bash: '.sh',
    powershell: '.ps1',
    dockerfile: '.dockerfile',
    terraform: '.tf',
    haskell: '.hs',
    erlang: '.erl',
    elixir: '.ex',
    clojure: '.clj',
    assembly: '.asm',
    plain: '.txt',
    plaintext: '.txt',
  };

  const ensureExtension = (name: string, language?: string): string => {
    const ext = language ? LANGUAGE_EXT_MAP[language] || '' : '';
    if (!ext) return name;

    return name.replace(/\.[^/.]+$/, '') + ext;
  };


  return (
    <IdeThemeScope enabled>
      {isLoading ? (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-primary)',
            color: '#ffffff',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2>Loading Enhanced IDE...</h2>
            <p style={{ opacity: 0.7, marginTop: '10px' }}>Initializing state management...</p>
          </div>
        </div>
  ) : (
  <>
  <style>
        {`
          @keyframes synapseGradientShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @keyframes synapseGlitch {
            0%, 90%, 100% {
              transform: translate(0px, 0px) skew(0deg);
              filter: drop-shadow(0 3px 10px rgba(0, 0, 0, 0.15));
            }
            91% {
              transform: translate(-2px, 0px) skew(-1deg);
              filter: drop-shadow(0 3px 10px rgba(245, 158, 11, 0.3))
                      drop-shadow(2px 0px 0px rgba(255, 0, 100, 0.4))
                      drop-shadow(-2px 0px 0px rgba(0, 255, 255, 0.4));
            }
            92% {
              transform: translate(2px, 1px) skew(1deg);
              filter: drop-shadow(0 3px 10px rgba(245, 158, 11, 0.3))
                      drop-shadow(2px 0px 0px rgba(255, 0, 100, 0.4))
                      drop-shadow(-2px 0px 0px rgba(0, 255, 255, 0.4));
            }
            93% {
              transform: translate(-1px, -1px) skew(-0.5deg);
              filter: drop-shadow(0 3px 10px rgba(245, 158, 11, 0.3))
                      drop-shadow(1px 0px 0px rgba(255, 0, 100, 0.6))
                      drop-shadow(-1px 0px 0px rgba(0, 255, 255, 0.6));
            }
            94% {
              transform: translate(1px, 0px) skew(0.5deg);
              filter: drop-shadow(0 3px 10px rgba(245, 158, 11, 0.3))
                      drop-shadow(1px 0px 0px rgba(255, 0, 100, 0.4))
                      drop-shadow(-1px 0px 0px rgba(0, 255, 255, 0.4));
            }
            95% {
              transform: translate(0px, 0px) skew(0deg);
              filter: drop-shadow(0 3px 10px rgba(0, 0, 0, 0.15));
            }
          }


          @keyframes unifiedGoldFlow { 0%{background-position:0% 0%;} 50%{background-position:100% 0%;} 100%{background-position:0% 0%;} }
          @keyframes unifiedGoldPulse { 0%,100%{opacity:1; filter:brightness(1);} 40%{opacity:.9; filter:brightness(1.08);} 60%{opacity:.95; filter:brightness(1.12);} }
          @keyframes unifiedGoldGlimmer { 0%{opacity:.45; transform:translateX(-4%);} 30%{opacity:.85;} 55%{opacity:.5;} 70%{opacity:.8;} 100%{opacity:.45; transform:translateX(4%);} }
          [data-global-gold-bar]{position:fixed;top:0;left:0;right:0;height:2px;z-index:999999;pointer-events:none;}
          [data-global-gold-bar]::before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,#062f3a 0%,#0b5870 12%,#00A6D7 28%,#5fd6f5 44%,#38b4dc 60%,#1d8fb4 76%,#0b5870 88%,#062f3a 100%);background-size:280% 100%;animation:unifiedGoldFlow 7s linear infinite, unifiedGoldPulse 5s ease-in-out infinite;box-shadow:0 0 4px rgba(0,166,215,0.55),0 0 8px rgba(95,214,245,0.20),0 0 2px rgba(255,255,255,0.15) inset;}
          [data-global-gold-bar]::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 50%,rgba(95,214,245,0.50),rgba(95,214,245,0) 55%),radial-gradient(circle at 68% 50%,rgba(0,166,215,0.40),rgba(0,166,215,0) 60%),linear-gradient(90deg,rgba(255,255,255,0.18),rgba(255,255,255,0) 35%,rgba(255,255,255,0.28) 50%,rgba(255,255,255,0) 65%,rgba(255,255,255,0.18));mix-blend-mode:screen;filter:blur(2.5px) brightness(1.15);animation: unifiedGoldGlimmer 9s cubic-bezier(.55,.1,.45,.9) infinite;}
          @media (prefers-reduced-motion:reduce){[data-global-gold-bar]::before,[data-global-gold-bar]::after{animation:none!important;background-position:0 0;}}
        `}
      </style>
    <div
        data-beginner-assistant-enabled={BEGINNER_ASSISTANT_ENABLED}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
      background: 'var(--color-bg-primary)',
          color: '#ffffff',
          fontFamily: 'Inter, system-ui, sans-serif',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div data-global-gold-bar aria-hidden="true" />
        {(() => {

          const rightGutter = layout.aiChatVisible
            ? (layout.aiAssistantWidth ?? aiAssistantWidth)
            : (flags.synapseCoreAI ? 400 : 0);
          return (
            <Header
              aiAssistantRightGutter={rightGutter}
              onNewFile={handleNewFile}
              onClearAll={handleClearWorkspace}
              onToggleSidebar={toggleSidebar}
              onToggleTerminal={toggleTerminal}
              onToggleAI={toggleAiChat}
              aiActive={layout.aiChatVisible}
              sidebarActive={!layout.sidebarCollapsed}
              terminalActive={layout.terminalVisible}
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={handleTabClick}
              onTabClose={closeTab}
              onReorder={handleReorderTabs}
              onOpenCommandPalette={handleOpenCommandPalette}
              onGlobalSearch={handleGlobalSearch}
              onCloseOthers={id => closeOtherTabs(id)}
              onCloseRight={id => closeTabsToRight(id)}
              onTogglePin={id => {
                const t = tabs.find(x => x.id === id);
                if (!t) return;
                (t.isPinned ? unpinTab : pinTab)(id);
              }}
              dirtyCount={dirtyTabs.length}
              onSaveAll={handleSaveAll}
              onRun={handleRun}
              onBuild={handleBuild}
            />
          );
        })()}

        {}
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            height: layout.terminalVisible
              ? `calc(100vh - 60px - ${layout.terminalHeight + 22}px)`
              : 'calc(100vh - 60px)',
            position: 'relative',
            marginRight: layout.aiChatVisible
              ? `${aiAssistantWidth}px`
              : (flags.synapseCoreAI ? '400px' : '0px'),
            transition: 'margin-right 0.3s ease, height 0.25s cubic-bezier(.4,0,.2,1)',
          }}
        >
          {}
          {!layout.sidebarCollapsed && (
            <div style={{ display: 'flex', position: 'relative' }}>
              <FileExplorer sidebarWidth={layout.sidebarWidth} />
              <div
                onMouseDown={e => {
                  const startX = e.clientX;
                  const startWidth = layout.sidebarWidth;
                  setSidebarPreviewWidth(startWidth);
                  const onMove = (mv: MouseEvent) => {
                    const delta = mv.clientX - startX;
                    let newW = startWidth + delta;

                    newW = Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, newW));

                    const available =
                      window.innerWidth - (layout.aiAssistantWidth || aiAssistantWidth);
                    if (available - newW < MIN_EDITOR_WIDTH) {
                      newW = Math.max(MIN_SIDEBAR, available - MIN_EDITOR_WIDTH);
                    }
                    setSidebarPreviewWidth(newW);
                    useAppStore.getState().setSidebarWidth(newW);
                  };
                  const onUp = () => {
                    setSidebarPreviewWidth(null);
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                }}
                onDoubleClick={() => {
                  useAppStore.getState().setSidebarWidth(DEFAULT_SIDEBAR);
                  setSidebarPreviewWidth(null);
                }}
                style={{
                  width: 6,
                  cursor: 'col-resize',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '2px 0 4px -2px rgba(0,0,0,0.45)',
                  position: 'relative',
                  zIndex: 8,
                  userSelect: 'none',
                }}
              >
                {}
                {sidebarPreviewWidth !== null && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: -2,
                      transform: 'translateX(100%)',
                      background: 'rgba(0,0,0,0.75)',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#EAD7A1',
                      border: '1px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Math.round(sidebarPreviewWidth)}px
                  </div>
                )}
              </div>
            </div>
          )}
          {}

          {}
          <div
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: '#0a0a0a',
              position: 'relative',
            }}
          >
            {}

            {}
            {activeTab ? (
              <div
                style={{
                  flex: 1,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Suspense
                  fallback={<div style={{ padding: 8, color: '#888' }}>Loading editor…</div>}
                >
                  <MonacoEditor
                    tabId={activeTab.id}
                    content={activeTab.content}
                    language={activeTab.language}
                    onChange={() => {

                    }}
                  />
                </Suspense>
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  background:
                    'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.02) 0%, rgba(0, 0, 0, 0.05) 70%)',
                  backdropFilter: 'blur(1px)',
                  transform: 'translateY(-150px)',
                }}
              >
                {}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '32px',
                    zIndex: 10,
                    position: 'relative',
                  }}
                >
                  {}
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {}
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        background: `linear-gradient(135deg, ${withAlpha(SYNAPSE_COLORS.bgSecondary, 0.95)}, ${withAlpha(SYNAPSE_COLORS.bgDark, 0.92)})`,
                        backdropFilter: 'blur(20px)',
                        border: `2px solid ${withAlpha(SYNAPSE_COLORS.goldPrimary, 0.55)}`,
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${SYNAPSE_COLORS.softShadow}, inset 0 1px 0 ${withAlpha('#FFFFFF', 0.08)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {}
                      <div
                        style={{
                          color: SYNAPSE_COLORS.textAccent,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg
                          viewBox="0 0 48 48"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          width="56"
                          height="56"
                        >
                          {}
                          <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9" />
                          <circle cx="36" cy="12" r="4" fill="currentColor" opacity="0.9" />
                          <circle cx="12" cy="36" r="4" fill="currentColor" opacity="0.9" />
                          <circle cx="36" cy="36" r="4" fill="currentColor" opacity="0.9" />
                          <circle cx="24" cy="24" r="5" fill="currentColor" />

                          {}
                          <path
                            d="M16 14L20 22"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.8"
                          />
                          <path
                            d="M32 14L28 22"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.8"
                          />
                          <path
                            d="M16 34L20 26"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.8"
                          />
                          <path
                            d="M32 34L28 26"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.8"
                          />
                          <path
                            d="M16 16L32 32"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.4"
                          />
                          <path
                            d="M32 16L16 32"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.4"
                          />

                          {}
                          <circle
                            cx="24"
                            cy="24"
                            r="12"
                            stroke="currentColor"
                            strokeWidth="1"
                            fill="none"
                            opacity="0.3"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="18"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            fill="none"
                            opacity="0.2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {}
                  <div
                    style={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      maxWidth: '420px',
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '32px',
                        fontWeight: '700',
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        color: SYNAPSE_COLORS.textAccent,
                        letterSpacing: '0.5px',
                        lineHeight: '1.2',
                      }}
                    >
                      Welcome to Synapse
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '16px',
                        color: SYNAPSE_COLORS.textSecondary,
                        fontWeight: '400',
                        lineHeight: '1.6',
                        letterSpacing: '0.2px',
                      }}
                    >
                      Intelligent Coding Workspace for Everyone
                      <br />
                      <span
                        style={{
                          color: withAlpha(SYNAPSE_COLORS.textSecondary, 0.7),
                          fontSize: '14px',
                        }}
                      >
                        Create a new file or open an existing project to start coding
                      </span>
                    </p>
                  </div>

                  {}
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                    }}
                  >
                    {}
                    <button
                      onClick={handleNewFile}
                      style={{
                        background: `linear-gradient(135deg, ${SYNAPSE_COLORS.goldPrimary}, ${SYNAPSE_COLORS.goldSecondary})`,
                        border: `2px solid ${withAlpha(SYNAPSE_COLORS.goldPrimary, 0.8)}`,
                        color: '#000',
                        padding: '16px 32px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '700',
                        fontFamily: '"JetBrains Mono", monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 4px 16px ${withAlpha(SYNAPSE_COLORS.goldPrimary, 0.3)}`,
                        letterSpacing: '0.5px',
                        transform: 'translateY(0)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = `0 6px 20px ${withAlpha(SYNAPSE_COLORS.goldPrimary, 0.4)}`;
                        e.currentTarget.style.background = `linear-gradient(135deg, ${SYNAPSE_COLORS.goldPrimary}, ${SYNAPSE_COLORS.goldPrimary})`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = `0 4px 16px ${withAlpha(SYNAPSE_COLORS.goldPrimary, 0.3)}`;
                        e.currentTarget.style.background = `linear-gradient(135deg, ${SYNAPSE_COLORS.goldPrimary}, ${SYNAPSE_COLORS.goldSecondary})`;
                      }}
                      onMouseDown={e => {
                        e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                      }}
                      onMouseUp={e => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      }}
                    >
                      <Plus size={20} strokeWidth={2.5} />
                      Create New File
                    </button>

                    {}
                    <button
                      onClick={handleOpenProject}
                      style={{
                        background: `linear-gradient(135deg, ${SYNAPSE_COLORS.bgOverlay}, ${withAlpha('#FFFFFF', 0.05)})`,
                        border: `2px solid ${SYNAPSE_COLORS.border}`,
                        color: SYNAPSE_COLORS.textPrimary,
                        padding: '16px 24px',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 4px 16px ${SYNAPSE_COLORS.softShadow}`,
                        letterSpacing: '0.3px',
                        backdropFilter: 'blur(10px)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.background = `linear-gradient(135deg, ${withAlpha('#FFFFFF', 0.12)}, ${withAlpha('#FFFFFF', 0.08)})`;
                        e.currentTarget.style.borderColor = `${SYNAPSE_COLORS.borderHighlight}`;
                        e.currentTarget.style.boxShadow = `0 6px 20px ${SYNAPSE_COLORS.softShadow}`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.background = `linear-gradient(135deg, ${SYNAPSE_COLORS.bgOverlay}, ${withAlpha('#FFFFFF', 0.05)})`;
                        e.currentTarget.style.borderColor = `${SYNAPSE_COLORS.border}`;
                        e.currentTarget.style.boxShadow = `0 4px 16px ${SYNAPSE_COLORS.softShadow}`;
                      }}
                    >
                      <Folder size={16} />
                      Open Project
                    </button>
                  </div>

                  {}
                  <div
                    style={{
                      display: 'flex',
                      gap: '24px',
                      marginTop: '16px',
                      opacity: 0.6,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: withAlpha(SYNAPSE_COLORS.textSecondary, 0.6),
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        Ctrl+N
                      </span>
                      New File
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: withAlpha(SYNAPSE_COLORS.textSecondary, 0.6),
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        Ctrl+O
                      </span>
                      Open File
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        {layout.terminalVisible ? <div style={{ transition: 'height 0.25s cubic-bezier(.4,0,.2,1)' }}>
            <Terminal
              shell="powershell"
              height={layout.terminalHeight}
              onClose={toggleTerminal}
              aiAssistantWidth={layout.aiChatVisible ? aiAssistantWidth : 0}
              fileExplorerWidth={!layout.sidebarCollapsed ? layout.sidebarWidth + 6 : 0}
              onHeightChange={h => {

                if (h < 20) return;
                const maxH = Math.min(window.innerHeight * 0.9, 600);
                const target = Math.min(maxH, h);
                try {
                  useAppStore.getState().setTerminalHeight(target);
                } catch {}
              }}
            />
          </div> : null}

        {}
        <CommandPalette
          isOpen={isCmdOpen}
          onClose={() => setCmdOpen(false)}
          commands={[
            { id: 'new-file', label: 'New File', shortcut: 'Ctrl+N', run: handleNewFile },
            { id: 'toggle-sidebar', label: 'Toggle Sidebar', shortcut: '', run: toggleSidebar },
            { id: 'toggle-terminal', label: 'Toggle Terminal', shortcut: '', run: toggleTerminal },
          ]}
        />

        {}
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />

  {}
  {layout.aiChatVisible ? <div
            style={{
              position: 'fixed',
              right: 0,
              top: 0,

              bottom: 26,

              height: layout.aiAssistantHeight ? Math.min(
                layout.aiAssistantHeight,
                Math.max(240, (typeof window !== 'undefined' ? window.innerHeight : 1080) - 26)
              ) : undefined,
              maxHeight: 'calc(100vh - 26px)',
              width: aiAssistantWidth,

              zIndex: 9998,

              paddingBottom: 4,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              paddingTop: 0,
              paddingRight: 0,
              pointerEvents: 'auto',
              isolation: 'isolate',
            }}
            data-component="ai-assistant"
            data-testid="assistant-container"
            className="ai-assistant-container"
          >
            {}
            <div
              onMouseDown={e => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = aiAssistantWidth;
                const onMove = (mv: MouseEvent) => {
                  const delta = startX - mv.clientX;
                  let newW = startWidth + delta;

                  newW = Math.max(320, Math.min(900, newW));

                  const sidebarWidth = !layout.sidebarCollapsed ? layout.sidebarWidth : 0;
                  const available = window.innerWidth - sidebarWidth;
                  const MIN_EDITOR = 560;
                  if (available - newW < MIN_EDITOR) {
                    newW = Math.max(320, available - MIN_EDITOR);
                  }
                  setAiAssistantWidth(newW);
                  try {
                    useAppStore.getState().setAiAssistantWidth(newW);
                  } catch {}
                };
                const onUp = () => {
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
              style={{
                position: 'absolute',
                left: -2,
                top: 0,
                bottom: 0,
                width: 10,
                cursor: 'col-resize',
                background:
                  'linear-gradient(180deg, rgba(0,166,215,0.15), rgba(0,166,215,0.05))',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)',
                transition: 'background 0.25s ease',
                zIndex: 10040,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background =
                  'linear-gradient(180deg, rgba(0,166,215,0.35), rgba(0,166,215,0.12))';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background =
                  'linear-gradient(180deg, rgba(0,166,215,0.15), rgba(0,166,215,0.05))';
              }}
            />
            {}
            <div
              onMouseDown={e => {
                if (!layout.terminalVisible) return;
                e.preventDefault();
                const startY = e.clientY;
                const startH = layout.aiAssistantHeight ?? 420;
                const onMove = (mv: MouseEvent) => {
                  const delta = mv.clientY - startY;
                  const newH = Math.max(240, Math.min(window.innerHeight * 0.95, startH + delta));
                  try {
                    useAppStore.getState().setAiAssistantHeight(newH);
                  } catch {}
                };
                const onUp = () => {
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
              style={{
                height: 6,
                cursor: 'row-resize',
                position: 'relative',
                background:
                  'linear-gradient(90deg, rgba(0,166,215,0.15), rgba(0,166,215,0.05))',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
              aria-label="Resize AI assistant height"
            />
      <div
              style={{
                flex: 1,
                minHeight:
                  (layout.aiAssistantHeight ?? 0) > 0 ? layout.aiAssistantHeight : undefined,

        overflow: 'hidden',
              }}
            >
              <AiAssistant width={aiAssistantWidth} />
            </div>
          </div> : null}

        {}
        {flags.synapseCoreAI && !layout.aiChatVisible ? (
          <div
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: 400,
              zIndex: 1000,
              display: 'flex',
            }}
          >
            <SynapseCoreAIPanel />
          </div>
        ) : null}
        {}
        <NewFileModal
          isOpen={showNewFileModal}
          onClose={() => setShowNewFileModal(false)}
          onCreateFile={(language?: string, templateContent?: string, fileName?: string) => {
            try {
              if (!fileName) return;
              const finalName = ensureExtension(fileName, language);
              const id = `file-${Date.now()}`;
              const path = `/${finalName}`;
              const content = templateContent || '';
              const lang = language || 'plaintext';

              addFileNode({
                id,
                name: finalName,
                type: 'file',
                path,
                content,
                language: lang,
                lastModified: new Date(),
                size: content.length,
              });

              openTab({
                id,
                name: finalName,
                content,
                language: lang,
                isDirty: false,
                type: 'file',
                path,
                lastModified: new Date(),
              });

              setActiveTab(id);
            } catch (e) {
              console.error('New file creation failed:', e);
            } finally {
              setShowNewFileModal(false);
            }
          }}
          sidebarWidth={layout.sidebarWidth}
        />
  </div>
  </>
  )}
  </IdeThemeScope>
  );
};
