import styles from "../styles/registry.module.css";
import { useRegistry } from "../registry/state";
import type { RiskLevel, Tag } from "../registry/types";

const RISK: RiskLevel[] = [1, 2, 3, 4, 5];
const TAGS: Tag[] = ["SUD", "Bipolar", "FEP", "Elderly", "PostPartum", "Trauma", "Custom"];

export default function CohortFilters() {
  const { state, actions } = useRegistry();

  const activeRisk = state.filter.risk ?? [];
  const activeTags = state.filter.tags ?? [];
  const search = state.filter.search ?? "";

  const toggleRisk = (lvl: RiskLevel) => {
    const set = new Set(activeRisk);
    if (set.has(lvl)) set.delete(lvl); else set.add(lvl);
    actions.setFilter({ risk: Array.from(set).sort() as RiskLevel[] });
  };

  const toggleTag = (t: Tag) => {
    const set = new Set(activeTags);
    if (set.has(t)) set.delete(t); else set.add(t);
    actions.setFilter({ tags: Array.from(set) as Tag[] });
  };

  return (
    <nav className={styles.leftRail} aria-label="Registry filters">
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Cohorts</div>
        <div className={styles.pills}>
          {["All", "Inpatients", "Outpatients", "Today", "Mine"].map((c) => {
            const isActive = state.filter.cohorts?.includes(c as any);
            return (
              <button
                key={c}
                className={styles.pill}
                data-active={isActive}
                onClick={() =>
                  actions.setFilter({
                    cohorts: [c as any],
                  })
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Risk</div>
        <div className={styles.pills}>
          {RISK.map((lvl) => (
            <button
              key={lvl}
              className={`${styles.pill} ${styles["risk" + lvl as keyof typeof styles] || ""}`}
              data-active={activeRisk.includes(lvl)}
              onClick={() => toggleRisk(lvl)}
            >
              Grade {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Status</div>
        <div className={styles.pills}>
          {[
            ["Overdue", "overdue"],
            ["Active flow", "activeFlow"],
            ["New results", "newResults"],
          ].map(([label, key]) => {
            const active = Boolean((state.filter.status as any)?.[key]);
            return (
              <button
                key={key}
                className={styles.pill}
                data-active={active}
                onClick={() =>
                  actions.setFilter({
                    status: { ...(state.filter.status ?? {}), [key]: !active } as any,
                  })
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Tags</div>
        <div className={styles.pills}>
          {TAGS.map((t) => (
            <button
              key={t}
              className={styles.pill}
              data-active={activeTags.includes(t)}
              onClick={() => toggleTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Search</div>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Name / MRN"
          value={search}
          onChange={(e) => actions.setFilter({ search: (e.target as HTMLInputElement).value })}
          aria-label="Search patients"
        />
      </div>
    </nav>
  );
}
