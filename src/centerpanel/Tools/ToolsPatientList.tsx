import React from "react";
import lcss from "../styles/tools.left.module.css";
import tcss from "../styles/tools.module.css";
import a11y from "../styles/a11y.module.css";
import VirtualList from "./components/VirtualList";
import { useRegistry } from "../registry/state";
import type { Patient } from "../registry/types";

type Cohort = "All" | "Low" | "Moderate" | "High" | "Recent" | "Pinned";
type SortBy = "RECENT" | "RISK" | "AZ";


const LS_PINS_KEY = "tools.pinned.v1";
const LS_COHORT_KEY = "tools.cohort.v1";
const LS_SORT_KEY = "tools.sort.v1";
const LS_QUERY_KEY = "tools.search.v1";

function loadPinned(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_PINS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch { return new Set(); }
}
function savePinned(set: Set<string>) {
  try { localStorage.setItem(LS_PINS_KEY, JSON.stringify([...set])); } catch {}
}

function getAlias(p: Patient): string | undefined {
  return (p as unknown as { alias?: string }).alias;
}
function relTime(ts?: number): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h}h ago`;
  const m = Math.max(1, Math.floor(diff / 60000));
  return `${m}m ago`;
}


type QuerySpec = {
  textTerms: string[];
  risk?: "low" | "moderate" | "high";
  pinned?: boolean;
  sex?: string;
  ageOp?: ">" | "<" | ">=" | "<=" | "=";
  ageVal?: number;
  id?: string;
  sortOverride?: SortBy;
};

function parseQuery(q: string): QuerySpec {
  const res: QuerySpec = { textTerms: [] };
  const parts = q.trim().split(/\s+/).filter(Boolean);
  for (const part of parts) {
    const hasColon = part.includes(":");
    const [kRaw, vRaw] = hasColon ? part.split(":", 2) : ["", part];
    const k = kRaw.toLowerCase();
    const v = (vRaw || "").toLowerCase();
    switch (k) {
      case "r":
      case "risk":
        if (["l", "low"].includes(v)) res.risk = "low";
        else if (["m", "mid", "moderate", "mod"].includes(v)) res.risk = "moderate";
        else if (["h", "hi", "high"].includes(v)) res.risk = "high";
        break;
      case "p":
      case "pin":
      case "pinned":
        res.pinned = v === "true" || v === "1" || v === "yes" || v === "y" || v === "on" || v === "pinned" || v === "";
        break;
      case "sex":
        res.sex = v;
        break;
      case "age": {
        const m = vRaw.match(/^(>=|<=|>|<|=)?\s*(\d{1,3})$/);
        if (m) {
          res.ageOp = (m[1] as QuerySpec["ageOp"]) || ">=";
          res.ageVal = Number(m[2]);
        }
        break;
      }
      case "id":
        res.id = vRaw;
        break;
      case "s":
      case "sort":
        if (["recent", "rec"].includes(v)) res.sortOverride = "RECENT";
        else if (["risk", "r"].includes(v)) res.sortOverride = "RISK";
        else if (["az", "a", "name"].includes(v)) res.sortOverride = "AZ";
        break;
      default:
        if (part) res.textTerms.push(part.toLowerCase());
    }
  }
  return res;
}

function scorePatient(p: Patient, terms: string[], isPinned: boolean): number {
  let s = 0;
  const alias = (getAlias(p) || p.name || "").toLowerCase();
  const id = String(p.id || "").toLowerCase();
  if (isPinned) s += 5;
  for (const t of terms) {
    if (!t) continue;
    if (alias.startsWith(t)) s += 5;
    else if (alias.includes(t)) s += 3;
    if (id.startsWith(t)) s += 4;
    else if (id.includes(t)) s += 2;
  }

  s += Math.min(5, Math.max(0, (p.risk ?? 0) - 1));
  const last = p.encounters?.[0]?.when ?? 0;
  if (last) {
    const hours = (Date.now() - last) / 3600000;
    if (hours <= 24) s += 3;
    else if (hours <= 72) s += 1;
  }
  return s;
}

const ToolsPatientList: React.FC = () => {
  const { state, actions } = useRegistry();


  const [pinned, setPinned] = React.useState<Set<string>>(() => loadPinned());
  const [query, setQuery] = React.useState<string>(() => localStorage.getItem(LS_QUERY_KEY) ?? "");
  const [cohort, setCohort] = React.useState<Cohort>(() => {
    const v = localStorage.getItem(LS_COHORT_KEY) as Cohort | null;
    return (v === "All" || v === "Low" || v === "Moderate" || v === "High" || v === "Recent" || v === "Pinned") ? v : "All";
  });
  const [sortBy, setSortBy] = React.useState<SortBy>(() => {
    const v = localStorage.getItem(LS_SORT_KEY) as SortBy | null;
    return (v === "RECENT" || v === "RISK" || v === "AZ") ? v : "RECENT";
  });

  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const searchWrapRef = React.useRef<HTMLDivElement | null>(null);

  const searchTimeoutRef = React.useRef<number | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const setSearchDebounced = (v: string) => {
    if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
    setIsSearching(true);
    searchTimeoutRef.current = window.setTimeout(() => {
      setQuery(v);
      setIsSearching(false);
    }, 150);
  };
  const activeRef = React.useRef<number>(0);


  React.useEffect(() => { localStorage.setItem(LS_COHORT_KEY, cohort); }, [cohort]);
  React.useEffect(() => { localStorage.setItem(LS_SORT_KEY, sortBy); }, [sortBy]);
  React.useEffect(() => { localStorage.setItem(LS_QUERY_KEY, query); }, [query]);
  React.useEffect(() => { savePinned(pinned); }, [pinned]);

  const togglePin = React.useCallback((id: string) => {
    setPinned(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);


  const rows = React.useMemo(() => {
    let list = (state.patients ?? []) as Patient[];
    const spec = parseQuery(query);


    if (cohort === "Low") list = list.filter(p => (p.risk ?? 0) >= 1 && (p.risk ?? 0) <= 2);
    if (cohort === "Moderate") list = list.filter(p => (p.risk ?? 0) === 3);
    if (cohort === "High") list = list.filter(p => (p.risk ?? 0) >= 4);
    if (cohort === "Recent") {
      list = list
        .slice()
        .sort((a, b) => ((b.encounters?.[0]?.when ?? 0) - (a.encounters?.[0]?.when ?? 0)))
        .slice(0, 30);
    }
    if (cohort === "Pinned") {
      list = list.filter(p => pinned.has(String(p.id)));
    }


    if (spec.pinned) list = list.filter(p => pinned.has(String(p.id)));
    if (spec.risk) {
      if (spec.risk === "low") list = list.filter(p => (p.risk ?? 0) >= 1 && (p.risk ?? 0) <= 2);
      if (spec.risk === "moderate") list = list.filter(p => (p.risk ?? 0) === 3);
      if (spec.risk === "high") list = list.filter(p => (p.risk ?? 0) >= 4);
    }
    if (spec.sex) list = list.filter(p => (p.sex || "").toLowerCase().startsWith(spec.sex!));
    if (spec.ageVal !== undefined && spec.ageOp) {
      list = list.filter(p => {
        const a = p.age ?? -1;
        if (a < 0) return false;
        const v = spec.ageVal!;
        switch (spec.ageOp) {
          case ">": return a > v;
          case ">=": return a >= v;
          case "<": return a < v;
          case "<=": return a <= v;
          case "=": return a === v;
          default: return true;
        }
      });
    }
    if (spec.id) {
      const needle = spec.id.toLowerCase();
      list = list.filter(p => String(p.id || "").toLowerCase().includes(needle));
    }
    if (spec.textTerms.length) {
      list = list.filter(p => {
        const alias = (getAlias(p) || p.name || "").toLowerCase();
        const id = String(p.id || "").toLowerCase();
        return spec.textTerms.every(t => alias.includes(t) || id.includes(t));
      });
    }


    const effectiveSort = spec.sortOverride ?? sortBy;
    if (spec.textTerms.length || spec.risk || spec.pinned || spec.id || spec.sex || spec.ageVal !== undefined) {
      const withScore = list.map(p => ({ p, s: scorePatient(p, spec.textTerms, pinned.has(String(p.id))) }));
      withScore.sort((a, b) => b.s - a.s);
      list = withScore.map(x => x.p);
    } else if (effectiveSort === "RECENT") {
      list = list.slice().sort((a, b) => ((b.encounters?.[0]?.when ?? 0) - (a.encounters?.[0]?.when ?? 0)));
    } else if (effectiveSort === "RISK") {
      list = list.slice().sort((a, b) => ((b.risk ?? 0) - (a.risk ?? 0)));
    } else if (effectiveSort === "AZ") {
      list = list.slice().sort((a, b) => (((getAlias(a) || a.name || "").localeCompare((getAlias(b) || b.name || "")))));
    }

    return list;
  }, [state.patients, cohort, query, sortBy, pinned]);


  React.useEffect(() => {
    const idx = rows.findIndex(p => p.id === state.selectedPatientId);
    activeRef.current = idx >= 0 ? idx : 0;
  }, [rows, state.selectedPatientId]);


  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!wrapRef.current) return;
      const ae = (document.activeElement as HTMLElement | null);
      const inside = ae ? wrapRef.current.contains(ae) : false;
      if (!inside) return;

      const tag = ae?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || (ae as HTMLElement)?.isContentEditable === true;

      if (rows.length === 0) return;
      const idx = rows.findIndex(p => p.id === state.selectedPatientId);
      const current = idx >= 0 ? rows[idx] : rows[0];


      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if ((e.key === "e" || e.key === "E") && !typing) {
        e.preventDefault();
        if (current) {
          actions.selectPatient(current.id);
          document.dispatchEvent(new CustomEvent("tools:focus-export", { detail: { id: current.id, mode: "catalog" } }));
        }
        return;
      }

      if ((e.key === "p" || e.key === "P") && !typing) {
        e.preventDefault();
        if (current) togglePin(String(current.id));
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setQuery("");
        searchRef.current?.focus();
        return;
      }

      if (e.key.toLowerCase() === "r" && !typing) {
        e.preventDefault();
        const order: Cohort[] = ["All", "Low", "Moderate", "High", "Recent", "Pinned"];
        const i = Math.max(0, order.indexOf(cohort));
        const nextC = order[(i + 1) % order.length];
        setCohort(nextC);
        return;
      }

      if (e.key === "ArrowDown" && !typing) {
        e.preventDefault();
        const next = rows[Math.min(rows.length - 1, idx + 1)] ?? rows[0];
        actions.selectPatient(next.id);
        return;
      }
      if (e.key === "ArrowUp" && !typing) {
        e.preventDefault();
        const prev = rows[Math.max(0, idx - 1)] ?? rows[rows.length - 1];
        actions.selectPatient(prev.id);
        return;
      }
      if (e.key === "Home" && !typing) {
        e.preventDefault();
        actions.selectPatient(rows[0].id);
        return;
      }
      if (e.key === "End" && !typing) {
        e.preventDefault();
        actions.selectPatient(rows[rows.length - 1].id);
        return;
      }
      if (e.key === "PageDown" && !typing) {
        e.preventDefault();
        const step = 5;
        const next = rows[Math.min(rows.length - 1, idx + step)] ?? rows[rows.length - 1];
        actions.selectPatient(next.id);
        return;
      }
      if (e.key === "PageUp" && !typing) {
        e.preventDefault();
        const step = 5;
        const prev2 = rows[Math.max(0, idx - step)] ?? rows[0];
        actions.selectPatient(prev2.id);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [rows, state.selectedPatientId, cohort, actions, togglePin]);

  const openChart = (id: string) => {
    actions.selectPatient(id);


  };

  const exportLastSession = (id: string) => {

    document.dispatchEvent(new CustomEvent("tools:focus-export", { detail: { id, mode: "last-session" } }));
    actions.selectPatient(id);
  };

  const totalCount = (state.patients?.length ?? 0);
  const pinnedCount = (state.patients ?? []).filter(p => pinned.has(String(p.id))).length;
  const highRiskCount = (state.patients ?? []).filter(p => (p.risk ?? 0) >= 4).length;

  return (
  <div className={`${lcss.wrap}`} role="region" aria-label="Tools patient list" ref={wrapRef}>
      {}
      <div className={lcss.headerRow}>
        <div className={lcss.headerTop}>
          <div className={lcss.headerTitle}>Patients</div>
          <div className={lcss.headerStats}>
            <div className={lcss.statCard} data-type="total" title="Total patients">
              <div className={lcss.statValue}>{totalCount}</div>
              <div className={lcss.statLabel}>Total</div>
            </div>
            {highRiskCount > 0 && (
              <div className={lcss.statCard} data-type="high" title="High risk patients">
                <div className={lcss.statValue}>{highRiskCount}</div>
                <div className={lcss.statLabel}>High Risk</div>
              </div>
            )}
            {pinnedCount > 0 && (
              <div className={lcss.statCard} data-type="pinned" title="Pinned patients">
                <div className={lcss.statValue}>{pinnedCount}</div>
                <div className={lcss.statLabel}>Pinned</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
  <div className={lcss.controls} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 5px' }}>
  {}
        <div className={lcss.searchRow} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <div
            className={lcss.searchWrap}
            ref={searchWrapRef}
            style={{ flex: '1 1 auto', position: 'relative', width: '100%' }}
          >
            <input
              className={lcss.searchInput}
              value={query}
              onChange={(e) => setSearchDebounced(e.target.value)}
              placeholder="Search by name, ID, or use filters..."
              aria-label="Search patients by name or ID"
              ref={searchRef}
              id="tools-left-search"
              aria-controls="tools-patient-listbox"
              title="Search patients"
              style={{ width: '100%' }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setQuery("");
                  searchRef.current?.focus();
                }
              }}
            />
            {}
            {query ? (
              <button
                type="button"
                className={lcss.clearBtn}
                aria-label="Clear search"
                title="Clear (Esc)"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                ×
              </button>
            ) : null}
          </div>

          {}
          <div className={lcss.selectWrap} style={{ flex: '0 0 auto', minWidth: '100px' }}>
            <select
              className={`${tcss.select} ${lcss.selectNative}`}
              aria-label="Sort patients"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              title="Sort patients"
            >
              <option value="RECENT">Recent</option>
              <option value="RISK">Risk</option>
              <option value="AZ">A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {}
      <div className={lcss.chipRow} role="tablist" aria-label="Patient cohorts">
        {(["All","Low","Moderate","High","Recent","Pinned"] as Cohort[]).map(c => (
          <button
            key={c}
            className={`${lcss.chip} ${cohort === c ? lcss.chipActive : ""} ${c === "Pinned" ? lcss.chipPinned ?? "" : ""}`}
            role="tab"
            aria-selected={cohort === c}
            onClick={() => setCohort(c)}
            title={
              c === "All" ? "Show all patients" :
              c === "Low" ? "Low risk cohort" :
              c === "Moderate" ? "Moderate risk cohort" :
              c === "High" ? "High risk cohort" :
              c === "Recent" ? "Recently seen" :
              "Pinned cohort"
            }
          >
            {c === "Recent" ? "Recently seen" : c}
          </button>
        ))}
      </div>

      {}
      {rows.length > 150 ? (
        <VirtualList
          className={lcss.list}
          ariaLabel="Patient items"
          aria-busy={isSearching}
          items={rows}
          itemHeight={64}
          getKey={(p) => p.id}
          renderRow={(p) => {
            const selected = state.selectedPatientId === p.id;
            const lastWhen = p.encounters?.[0]?.when;
            const lastSeen = relTime(lastWhen);
            const isPinned = pinned.has(String(p.id));
            const veryRecent = lastWhen ? (Date.now() - lastWhen) <= 24 * 3600000 : false;
            const riskNum = (p.risk ?? 0) as number;
            const riskLabel = riskNum >= 4 ? "High" : riskNum === 3 ? "Moderate" : riskNum >= 1 ? "Low" : "";
            return (
              <div
                className={`${lcss.item} ${selected ? lcss.itemActive : ""}`}
                data-risk={riskNum}
                id={`tools-patient-${p.id}`}
              >
                <div
                  className={lcss.itemMain}
                  onClick={() => openChart(p.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openChart(p.id); } }}
                  tabIndex={0}
                  role="button"
                >
                  <div className={lcss.itemTopRow}>
                    <span className={lcss.itemName}>
                      {getAlias(p) || p.name || "Unnamed"}
                      {isPinned ? (
                        <span className={lcss.pinBadge} aria-label="Pinned" title="Pinned">★</span>
                      ) : null}
                    </span>
                    <span className={lcss.itemMeta}>#{p.id}</span>
                  </div>
                  <div className={lcss.itemSubRow}>
                    <span className={lcss.itemMeta}>
                      {p.age !== undefined ? `${p.age}y • ${p.sex || "—"}` : "—"}
                    </span>
                    <span className={lcss.itemMeta}>Last: {lastSeen}{veryRecent ? <span className={lcss.recentDot} aria-label="Seen in last 24 hours" title="Seen in last 24 hours"/> : null}</span>
                  </div>
                </div>
                <div className={lcss.itemRight}>
                  {riskNum > 0 && (
                    <span className={lcss.riskChip} data-risk={riskNum} title={`Risk: ${riskLabel}`} aria-label={`Risk: ${riskLabel}`}>
                      {riskLabel}
                    </span>
                  )}
                  <div className={lcss.actions}>
                    <button
                      className={lcss.iconBtn}
                      aria-label="Open chart"
                      title="Open chart"
                      aria-keyshortcuts="Enter"
                      onClick={(e) => { e.stopPropagation(); openChart(p.id); }}
                    >
                      ⤴
                    </button>
                    <button
                      className={lcss.iconBtn}
                      aria-label="Export last session"
                      title="Export last session"
                      aria-keyshortcuts="E"
                      onClick={(e) => { e.stopPropagation(); exportLastSession(p.id); }}
                    >
                      ⬇
                    </button>
                    <button
                      className={lcss.iconBtn}
                      aria-label="Copy ID"
                      title="Copy ID"
                      onClick={(e) => {
                        e.stopPropagation();
                        const text = String(p.id);
                        const write = navigator.clipboard?.writeText?.(text);
                        if (write && typeof write.then === "function") {
                          write.catch(() => {});
                        } else {
                          try {
                            const ta = document.createElement("textarea");
                            ta.value = text; document.body.appendChild(ta); ta.select();
                            document.execCommand("copy"); document.body.removeChild(ta);
                          } catch {}
                        }
                      }}
                    >
                      ⎘
                    </button>
                    <button
                      type="button"
                      className={`${lcss.iconBtn} ${lcss.pinBtn ?? ""} ${isPinned ? (lcss.iconBtnOn ?? "") : ""}`}
                      aria-label={isPinned ? "Unpin" : "Pin"}
                      aria-pressed={isPinned}
                      title={isPinned ? "Unpin (P)" : "Pin (P)"}
                      aria-keyshortcuts="P"
                      onClick={(e) => { e.stopPropagation(); togglePin(String(p.id)); }}
                    >
                      {isPinned ? "★" : "☆"}
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        />
      ) : (
        <ul
          className={lcss.list}
          aria-label="Patient items"
          id="tools-patient-listbox"
          aria-busy={isSearching}
          ref={listRef}
        >
          {rows.map((p) => {
            const selected = state.selectedPatientId === p.id;
            const lastWhen = p.encounters?.[0]?.when;
            const lastSeen = relTime(lastWhen);
            const isPinned = pinned.has(String(p.id));
            const veryRecent = lastWhen ? (Date.now() - lastWhen) <= 24 * 3600000 : false;
            const riskNum = (p.risk ?? 0) as number;
            const riskLabel = riskNum >= 4 ? "High" : riskNum === 3 ? "Moderate" : riskNum >= 1 ? "Low" : "";

            return (
              <li
                key={p.id}
                className={`${lcss.item} ${selected ? lcss.itemActive : ""}`}
                data-risk={riskNum}
                id={`tools-patient-${p.id}`}
              >
                <div
                  className={lcss.itemMain}
                  onClick={() => openChart(p.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openChart(p.id); } }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selected}
                >
                  <div className={lcss.itemTopRow}>
                    <span className={lcss.itemName}>
                      {getAlias(p) || p.name || "Unnamed"}
                      {isPinned ? (
                        <span className={lcss.pinBadge} aria-label="Pinned" title="Pinned">★</span>
                      ) : null}
                    </span>
                    <span className={lcss.itemMeta}>#{p.id}</span>
                  </div>
                  <div className={lcss.itemSubRow}>
                    <span className={lcss.itemMeta}>
                      {p.age !== undefined ? `${p.age}y • ${p.sex || "—"}` : "—"}
                    </span>
                    <span className={lcss.itemMeta}>Last: {lastSeen}{veryRecent ? <span className={lcss.recentDot} aria-label="Seen in last 24 hours" title="Seen in last 24 hours"/> : null}</span>
                  </div>
                </div>
                <div className={lcss.itemRight}>
                  {riskNum > 0 && (
                    <span className={lcss.riskChip} data-risk={riskNum} title={`Risk: ${riskLabel}`} aria-label={`Risk: ${riskLabel}`}>
                      {riskLabel}
                    </span>
                  )}
                  <div className={lcss.actions}>
                    <button
                      className={lcss.iconBtn}
                      aria-label="Open chart"
                      title="Open chart"
                      aria-keyshortcuts="Enter"
                      onClick={(e) => { e.stopPropagation(); openChart(p.id); }}
                    >
                      ⤴
                    </button>
                    <button
                      className={lcss.iconBtn}
                      aria-label="Export last session"
                      title="Export last session"
                      aria-keyshortcuts="E"
                      onClick={(e) => { e.stopPropagation(); exportLastSession(p.id); }}
                    >
                      ⬇
                    </button>
                    <button
                      className={lcss.iconBtn}
                      aria-label="Copy ID"
                      title="Copy ID"
                      onClick={(e) => {
                        e.stopPropagation();
                        const text = String(p.id);
                        const write = navigator.clipboard?.writeText?.(text);
                        if (write && typeof write.then === "function") {
                          write.catch(() => {});
                        } else {
                          try {
                            const ta = document.createElement("textarea");
                            ta.value = text; document.body.appendChild(ta); ta.select();
                            document.execCommand("copy"); document.body.removeChild(ta);
                          } catch {}
                        }
                      }}
                    >
                      ⎘
                    </button>
                    <button
                      type="button"
                      className={`${lcss.iconBtn} ${lcss.pinBtn ?? ""} ${isPinned ? (lcss.iconBtnOn ?? "") : ""}`}
                      aria-label={isPinned ? "Unpin" : "Pin"}
                      aria-pressed={isPinned}
                      title={isPinned ? "Unpin (P)" : "Pin (P)"}
                      aria-keyshortcuts="P"
                      onClick={(e) => { e.stopPropagation(); togglePin(String(p.id)); }}
                    >
                      {isPinned ? "★" : "☆"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {}
      <div className={a11y.srOnly} aria-live="polite" aria-atomic="true">
        {isSearching ? "Searching…" : `${rows.length} result${rows.length === 1 ? "" : "s"}`}
      </div>

      {rows.length === 0 && (
        <div className={lcss.empty}>No patients match this filter.</div>
      )}
    </div>
  );
};

export default ToolsPatientList;
