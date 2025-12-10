import styles from "./newPatient.module.css";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";

function categoryMeta(cat: string) {
  switch (cat) {
    case "safety":
      return { label: "Safety", className: styles.taskBadgeSafety };
    case "followup":
      return { label: "Follow-up", className: styles.taskBadgeFollowup };
    case "monitoring":
      return { label: "Monitoring", className: styles.taskBadgeMonitoring };
    case "legal":
      return { label: "Legal", className: styles.taskBadgeLegal };
    default:
      return { label: "Other", className: styles.taskBadgeUncat };
  }
}

export default function TaskListEditor() {
  const tasks = useNewPatientDraftStore((s) => s.tasks);
  const startEditTask = useNewPatientDraftStore((s) => s.startEditTask);
  const removeTask = useNewPatientDraftStore((s) => s.removeTask);

  if (!tasks || tasks.length === 0) {
    return <div className={styles.taskListEmpty}>No tasks added</div>;
  }


  const sorted = [...tasks].sort((a, b) => {
    const ad = (a.due || "").trim();
    const bd = (b.due || "").trim();
    if (ad === "" && bd !== "") return 1;
    if (ad !== "" && bd === "") return -1;
    return ad.localeCompare(bd);
  });

  return (
    <div className={styles.taskListWrapper}>
      {sorted.map((t, idx) => {
        const meta = categoryMeta(t.category || "");
        return (
          <div key={idx} className={styles.taskRow}>
            {}
            <div className={styles.taskRowMain}>
              <span className={`${styles.taskBadge} ${meta.className}`}>
                {meta.label}
              </span>
              <span className={styles.taskText}>{t.text || "—"}</span>
            </div>

            {}
            <div className={styles.taskRowMeta}>
              <span className={styles.taskDue}>{t.due ? t.due : "no due"}</span>

              <button
                className={styles.btnSecondary}
                onClick={() => startEditTask(idx)}
                title="Edit task"
              >
                Edit
              </button>

              <button
                className={styles.btnSecondary}
                onClick={() => removeTask(idx)}
                title="Remove task"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
