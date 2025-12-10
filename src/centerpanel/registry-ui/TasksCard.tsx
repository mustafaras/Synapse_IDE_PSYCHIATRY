import styles from "./newPatient.module.css";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import TaskListEditor from "./TaskListEditor.tsx";
import { TASK_CATEGORY_OPTIONS, type TaskCategoryOption } from "./taskCategories.ts";
import { buildFollowupTasks } from "./consultantAiHelpers";

export default function TasksCard() {
  const taskDraft = useNewPatientDraftStore((s) => s.taskDraft);
  const setTaskDraftField = useNewPatientDraftStore((s) => s.setTaskDraftField);
  const commitTaskDraft = useNewPatientDraftStore((s) => s.commitTaskDraft);
  const tasks = useNewPatientDraftStore((s) => s.tasks);
  const addTaskFromAI = useNewPatientDraftStore((s) => s.addTaskFromAI);
  const encounter = useNewPatientDraftStore((s) => s.encounter);
  const suicideRisk = useNewPatientDraftStore((s) => s.suicideRisk);
  const violenceRisk = useNewPatientDraftStore((s) => s.violenceRisk);

  const taskCount = tasks?.length || 0;

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          Tasks &amp; follow-up {taskCount > 0 ? <span className={styles.countBadge}>{taskCount}</span> : null}
        </div>
        <div className={styles.cardSub}>Track and action safety/legal/follow-up tasks.</div>
      </header>

      <div className={styles.cardBody}>
        {}
        {(() => {
          const showSafetyAdvisory = (suicideRisk === 'active-plan' || suicideRisk === 'imminent') && !(tasks || []).some(t => (t.category || '').toLowerCase() === 'safety');
          const showLegalAdvisory = (encounter.legalStatus === 'involuntary') && !(tasks || []).some(t => (t.category || '').toLowerCase() === 'legal');
          return (
            <>
              {showSafetyAdvisory ? (
                <div className={styles.advisory}>
                  Consider adding a Safety task (e.g., caregiver lethal-means check, 2-hour SI reassessment).
                </div>
              ) : null}
              {showLegalAdvisory ? (
                <div className={styles.advisory}>
                  Consider a Legal task for involuntary paperwork.
                </div>
              ) : null}
            </>
          );
        })()}

        {}
        <div className={styles.rowGrid}>
          {}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="task-text">Task</label>
            <input
              id="task-text"
              className={styles.fieldInput}
              value={taskDraft?.text || ""}
              onChange={(e) => setTaskDraftField("text", (e.target as HTMLInputElement).value)}
              placeholder="Call caregiver to lock meds and confirm no firearm access"
            />
          </div>

          {}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="task-cat">Category</label>
            <select
              id="task-cat"
              className={styles.fieldSelect}
              value={taskDraft?.category || ""}
              onChange={(e) => setTaskDraftField("category", (e.target as HTMLSelectElement).value)}
            >
              <option value="">Select...</option>
              {TASK_CATEGORY_OPTIONS.map((opt: TaskCategoryOption) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="task-due">Due</label>
            <input
              id="task-due"
              className={styles.fieldInput}
              value={taskDraft?.due || ""}
              onChange={(e) => setTaskDraftField("due", (e.target as HTMLInputElement).value)}
              placeholder="2025-10-29 22:00"
            />
          </div>

          {}
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel} aria-hidden="true">&nbsp;</div>
            <button className={styles.btnPrimary} onClick={commitTaskDraft}>
              {taskDraft?.editIndex === null ? "Add task" : "Save task"}
            </button>
          </div>
        </div>

        {}
        <div className={styles.aiBlock} aria-label="AI Follow-up task suggestions">
          <div className={styles.aiBlockHeader}>Follow-up tasks</div>
          <div className={styles.aiBlockSub}>Structured safety / legal / follow-up actions</div>
          {(() => {
            const suggestions = buildFollowupTasks(
              { legalStatus: encounter.legalStatus },
              { suicideRisk, violenceRisk }
            );
            if (!suggestions || suggestions.length === 0) {
              return <div className={styles.aiBlockText}>Task suggestions will appear once safety / legal status is defined.</div>;
            }
            return suggestions.map((t, idx) => (
              <div key={`${t.category}-${idx}`}>
                <div className={styles.aiBlockText}>{t.text} <span className={styles.aiBlockMeta}>[{t.category}{t.dueHint ? `, due ${t.dueHint}` : ''}]</span></div>
                <button className={styles.btnPrimary} onClick={() => addTaskFromAI(t.text, t.category, t.dueHint)}>Add task</button>
              </div>
            ));
          })()}
        </div>

        {}
        <TaskListEditor />
      </div>
    </section>
  );
}
