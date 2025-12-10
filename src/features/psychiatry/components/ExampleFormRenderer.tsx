
import React from 'react';
import type { ExampleField, ExampleForm } from '../content/section8.index';

type Props = { form: ExampleForm };

const Field: React.FC<{ f: ExampleField }> = ({ f }) => {
  if (f.type === 'scale') {
    const sc = f as Extract<ExampleField, { type: 'scale' }>;
    const descId = `${sc.id}_desc`;
    const options = Array.from({ length: sc.max - sc.min + 1 }).map((_, i) => {
      const val = sc.min + i; const label = sc.anchors[i] ?? String(val);
      const id = `${sc.id}_${val}`;
      return (
        <label key={id} style={{ marginRight: 8 }}>
          <input type="radio" name={sc.id} id={id} value={String(val)} required={!!sc.required} /> {label}
        </label>
      );
    });
    return (
      <fieldset>
        <legend>{sc.label}</legend>
        <div id={descId} className="muted">{sc.anchors[0]} … {sc.anchors[sc.anchors.length - 1]}</div>
        <div role="group" aria-describedby={descId}>{options}</div>
      </fieldset>
    );
  }
  if (f.type === 'radio' || f.type === 'checkbox') {
    const name = f.type === 'radio' ? f.id : `${f.id}[]`;
    return (
      <fieldset>
        <legend>{f.label}</legend>
        <div className="choices">
          {(f.options || []).map((opt, idx) => {
            const id = `${f.id}_${idx}`;
            return (
              <label key={id} style={{ marginRight: 8 }}>
                <input type={f.type} name={name} id={id} value={opt} required={!!f.required} /> {opt}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }
  if (f.type === 'select') {
    return (
      <div className="field">
        <label htmlFor={f.id}>{f.label}</label>
        <select id={f.id} name={f.id} required={!!f.required}>
          {(f.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    );
  }
  if (f.type === 'number' || f.type === 'text') {
    return (
      <div className="field">
        <label htmlFor={f.id}>{f.label}</label>
        <input id={f.id} name={f.id} type={f.type} required={!!f.required} />
      </div>
    );
  }
  const lbl = (f as { label?: string }).label ?? f.id;
  return <div className="field"><label>{lbl}</label></div>;
};

const ExampleFormRenderer: React.FC<Props> = ({ form }) => {
  return (
    <section className="example-form" aria-label={String(form.title)} aria-describedby={form.instructions ? 'ex-instructions' : undefined}>
      <h2 className="sr-only">{String(form.title)}</h2>
      {form.instructions && <p id="ex-instructions" className="muted">{String(form.instructions)}</p>}
      <div className="form-grid">
        {form.fields.map(f => <Field key={f.id} f={f} />)}
      </div>
      {form.scoring && (
        <aside className="muted" aria-live="polite"><strong>Scoring:</strong> {String(form.scoring.details)}</aside>
      )}
      {form.requiresLicense && (
        <aside className="muted" role="note">This demo uses paraphrased items; use official wording and scoring for clinical deployment.</aside>
      )}
    </section>
  );
};

export default ExampleFormRenderer;
