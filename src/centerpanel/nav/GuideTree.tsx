import React from "react";
import treeCss from "../styles/navtree.module.css";
import { MAIN_SCROLL_ROOT_ID, SECTIONS, anchorId, anchorSubId, type Section, type Subsection } from "../sections.ts";
import { useScrollSpy, smoothScrollTo } from "../hooks/useScrollSpy.ts";

const GuideTree: React.FC<{ anchorPrefix?: string }> = ({ anchorPrefix = "cp-sec" }) => {

  const allIds = React.useMemo(() => {
    const ids: string[] = [];
    for (const s of SECTIONS) {
      ids.push(anchorId(s.id, anchorPrefix));
      (s.children || []).forEach(ch => ids.push(anchorSubId(s.id, ch.id, anchorPrefix)));
    }
    return ids;
  }, [anchorPrefix]);

  const activeAnchor = useScrollSpy(allIds, MAIN_SCROLL_ROOT_ID);
  const activeMap = React.useMemo(() => {

    if (!activeAnchor) return {} as { sec?: string; sub?: string };
    const [, secWithMaybeSub] = activeAnchor.split("--");
    const [sec, sub] = secWithMaybeSub.split("__");
    return { sec, sub } as { sec?: string; sub?: string };
  }, [activeAnchor]);

  const onSelectSection = (secId: string) => smoothScrollTo(anchorId(secId, anchorPrefix), MAIN_SCROLL_ROOT_ID);
  const onSelectSub = (secId: string, subId: string) =>
    smoothScrollTo(anchorSubId(secId, subId, anchorPrefix), MAIN_SCROLL_ROOT_ID);

  return (
    <nav aria-label="Guide navigation">
      <ul className={treeCss.list}>
  {SECTIONS.map((s: Section) => {
          const isActiveSec = activeMap.sec === s.id && !activeMap.sub;
          return (
            <li key={s.id}>
              <button
                className={`${treeCss.item} ${isActiveSec ? treeCss.active : ""}`}
                onClick={() => onSelectSection(s.id)}
                aria-current={isActiveSec ? "true" : undefined}
              >
                {s.title}
              </button>
              {!!s.children?.length && (
                <ul className={treeCss.childList}>
                  {s.children.map((ch: Subsection) => {
                    const activeSub = activeMap.sec === s.id && activeMap.sub === ch.id;
                    return (
                      <li key={ch.id}>
                        <button
                          className={`${treeCss.item} ${activeSub ? treeCss.active : ""}`}
                          style={{ paddingLeft: 22 }}
                          onClick={() => onSelectSub(s.id, ch.id)}
                          aria-current={activeSub ? "true" : undefined}
                        >
                          {ch.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default GuideTree;
