

import styles from "../styles/guides.module.css";

export type Slot = "summary" | "plan" | "vitals" | "refs";

export default function GuideCommandBar({

  search,
  setSearch,
  sort,
  setSort,
  density,
  setDensity,
  searchInputRef,
  count,
  contextLine,
}: {
  category: string;
  setCategory: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  sort: "updated" | "alpha";
  setSort: (v: "updated" | "alpha") => void;
  density: "compact" | "comfortable";
  setDensity: (v: "compact" | "comfortable") => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  count?: number;

  contextLine?: string | undefined;
}) {
  return (
    <div className={styles.commandBar}>
      <div className={styles.titleTiny} aria-live="polite" aria-atomic>
        Guides {typeof count === "number" && (
          <span className={styles.railHeaderCount} title="Visible guides count">{count}</span>
        )}
      </div>
      {contextLine && (
        <div className={`${styles.meta} ${styles.metaTiny} ${styles.metaMuted}`} aria-live="polite" aria-atomic>
          {contextLine}
        </div>
      )}

      <div className={styles.controls} aria-label="Filters">
        <span className={styles.labelTiny} aria-hidden>Search</span>
        <input
          ref={searchInputRef}
          className={styles.input}
          type="search"
          placeholder="Search (press / to focus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search guides"
        />
        <div className={styles.seg} role="group" aria-label="Sort">
          <button data-active={sort === "updated"} onClick={() => setSort("updated")}>
            Updated
          </button>
          <button data-active={sort === "alpha"} onClick={() => setSort("alpha")}>
            A–Z
          </button>
        </div>
        <div className={styles.seg} role="group" aria-label="Density">
          <button data-active={density === "compact"} onClick={() => setDensity("compact")}>
            Compact
          </button>
          <button data-active={density === "comfortable"} onClick={() => setDensity("comfortable")}>
            Comfort
          </button>
        </div>
      </div>
    </div>
  );
}
