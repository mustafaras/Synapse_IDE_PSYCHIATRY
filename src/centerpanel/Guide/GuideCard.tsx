

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy } from "lucide-react";
import styles from "../styles/guides.module.css";
import type { MicroGuide, GuideSectionKey } from "./guideTypes";
import { citeLine } from "./evidence";
import GuideMacros from "./GuideMacros";
import type { Slot } from "./GuideCommandBar";


export type InsertFn = (slot: "summary"|"plan"|"vitals"|"refs", text: string) => void;

type SectionDef = {
  key: GuideSectionKey;
  title: string;
  text?: string;
  defaultSlot: "summary"|"plan"|"vitals"|"refs";
};

const GuideCard: React.FC<{
  g: MicroGuide;
  onInsert: InsertFn;
  density?: "compact" | "comfortable";
  parentSlot?: Slot;
  onQuickInsertFromParent?: (text: string) => void;
}> = ({ g, density = "compact" }) => {

  const [openKey, setOpenKey] = useState<GuideSectionKey | null>("abstract");
  const slots = g.slotMap ?? {};
  const isCompact = density === "compact";

  const sections: SectionDef[] = useMemo(() => ([
    { key: "abstract" as GuideSectionKey,   title: "Abstract",      text: g.abstract,    defaultSlot: (slots.abstract   ?? "summary") as any },
    { key: "criteria" as GuideSectionKey,   title: "Key criteria",  text: g.criteria,    defaultSlot: (slots.criteria   ?? "summary") as any },
    { key: "redFlags" as GuideSectionKey,   title: "Red flags",     text: g.redFlags,    defaultSlot: (slots.redFlags   ?? "vitals")  as any },
    { key: "monitoring" as GuideSectionKey, title: "Monitoring",    text: g.monitoring,  defaultSlot: (slots.monitoring ?? "vitals")  as any },
  { key: "differential" as GuideSectionKey, title: "Differential diagnosis", text: (g as any).differential, defaultSlot: ((slots as any).differential ?? "summary") as any },
  { key: "riskStrat" as GuideSectionKey,    title: "Risk stratification",   text: (g as any).riskStrat ?? (g as any).risk, defaultSlot: (((slots as any).riskStrat ?? (slots as any).risk) ?? "vitals") as any },
    { key: "communication" as GuideSectionKey,title: "Communication/consent", text: (g as any).communication, defaultSlot: ((slots as any).communication ?? "plan") as any },
    { key: "coordination" as GuideSectionKey, title: "Care coordination",      text: (g as any).coordination, defaultSlot: ((slots as any).coordination ?? "plan") as any },
    { key: "followUp" as GuideSectionKey,     title: "Follow-up",             text: (g as any).followUp,     defaultSlot: ((slots as any).followUp ?? "plan") as any },
    { key: "tools" as GuideSectionKey,        title: "Tools/scales",          text: (g as any).tools,        defaultSlot: ((slots as any).tools ?? "summary") as any },
    { key: "escalation" as GuideSectionKey,   title: "When to escalate",      text: (g as any).escalation,   defaultSlot: ((slots as any).escalation ?? "plan") as any },
    { key: "docPhrases" as GuideSectionKey, title: "Documentation phrases", text: g.docPhrases, defaultSlot: (slots.docPhrases ?? "plan") as any    },
    { key: "references" as GuideSectionKey, title: "References",    text: g.references,  defaultSlot: (slots.references ?? "refs") as any    },
  ].filter(s => !!s.text)), [g, slots]);

  const anchors = useRef<Record<GuideSectionKey, HTMLElement | null>>({} as any);


  useEffect(() => {
    const onToggleAll = (e: Event) => {
      const detail = (e as CustomEvent).detail as { open?: boolean } | undefined;
      if (!detail) return;
      setOpenKey(detail.open ? "abstract" : null);
    };
    window.addEventListener('guide:setOpenAll', onToggleAll as EventListener);
    return () => window.removeEventListener('guide:setOpenAll', onToggleAll as EventListener);
  }, []);


  function Section({ s }: { s: SectionDef }) {
    const rb = (g.meta as any)?.[s.key] as | { evidence?: string } | undefined;
    const isOpen = openKey === s.key;
    const isRefs = s.key === ("references" as GuideSectionKey);
    return (
      <>
        <div className={styles.secHead}>
          <div className={styles.secTitle}>
            <button
              className={`${styles["iconBtn--ghost"]} ${styles.chev}`}
              data-open={isOpen}
              onClick={() => setOpenKey(isOpen ? null : s.key)}
              aria-expanded={isOpen}
              aria-controls={`${g.id}-${s.key}`}
              title={isOpen ? "Collapse" : "Expand"}
            >
              ›
            </button>
            {s.title}
            {rb?.evidence && (
              <span className={styles.badge} data-g={rb.evidence as any}>
                Evid {rb.evidence}
              </span>
            )}
          </div>
          <div className={styles.secIcons}>
            <button
              className={styles["iconBtn--ghost"]}
              onClick={() => navigator.clipboard.writeText(s.text ?? "")}
              aria-label="Copy section"
              title="Copy section"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div id={`${g.id}-${s.key}`} className={styles.secBody}>
          <div
            className={`${styles.block} ${
              isCompact && !isOpen ? `${styles.clamp} ${styles["clamp-3"]}` : ""
            }`}
          >
            {isRefs && (g.meta?.references?.citations?.length ?? 0) > 0 ? (
              <div>
                {g.meta!.references!.citations!.map((c) => (
                  <div key={c.key}>• {citeLine(c)}</div>
                ))}
              </div>
            ) : (
              <>{s.text}</>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <article className={styles.card} aria-label={g.title} data-guide-id={g.id} data-guide-cat={g.category}>
      {}
      <div className={styles.cardToolbarHead}>
        <div>
          <div className={styles.cardTitle} data-guide-title>
            {g.title}
          </div>
          <div className={styles.cardMeta}>
            {g.category} • Updated {new Date(g.updated).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className={styles.macro}>
        <GuideMacros
          blocks={sections.map((s) => s.text ?? "")}
          onCopy={(t) => navigator.clipboard.writeText(t)}
        />
      </div>

      {}
      <div className={styles.cardToolbarSticky}>
        {}
        <div className={styles.banner}>
          Documentation support (non-directive). Use with clinical judgment and local policy.
        </div>
      </div>

      {}

      {}
      {sections.map((s) => {

        const toneClass: string = (
          {
            abstract: styles.accentLow,
            criteria: styles.accentMod,
            redFlags: styles.accentCritical,
            monitoring: styles.accentHigh,
            differential: styles.accentMod,
            riskStrat: styles.accentHigh,
            communication: styles.accentLow,
            coordination: styles.accentLow,
            followUp: styles.accentMod,
            tools: styles.accentLow,
            escalation: styles.accentCritical,
            docPhrases: styles.accentMod,
            references: styles.accentLow,
          } as Record<GuideSectionKey, string>
        )[s.key];
        return (
          <section
            key={s.key}
            id={`${g.id}-${s.key}`}
            ref={(el) => {
              anchors.current[s.key] = el;
            }}
            aria-labelledby={`${g.id}-${s.key}-title`}
            className={`${styles.secWrap} ${toneClass ?? ""}`}
          >
            <Section s={s} />
          </section>
        );
      })}
    </article>
  );
};

export default GuideCard;


