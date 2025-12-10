

import React, { useEffect, useState } from "react";
import panel from "../styles/guides.panel.module.css";
import note from "../styles/note.module.css";
import GuideView from "./GuideView";


const GuideViewV2: React.FC = () => {
  const [sort, setSort] = useState<"updated"|"alpha">("updated");
  const [density, setDensity] = useState<"compact"|"comfortable">("compact");


  useEffect(() => {
    const onSetSort = (e: Event) => {
      const d = (e as CustomEvent).detail as { sort?: 'updated'|'alpha' } | undefined;
      if (d?.sort) setSort(d.sort);
    };
    const onSetDensity = (e: Event) => {
      const d = (e as CustomEvent).detail as { density?: 'compact'|'comfortable' } | undefined;
      if (d?.density) setDensity(d.density);
    };
    window.addEventListener('guide:setSort', onSetSort as EventListener);
    window.addEventListener('guide:setDensity', onSetDensity as EventListener);
    return () => {
      window.removeEventListener('guide:setSort', onSetSort as EventListener);
      window.removeEventListener('guide:setDensity', onSetDensity as EventListener);
    };
  }, []);

  return (
    <div className={panel.root}>
      <div className={`${panel.headerBar} ${panel.headerChrome}`} role="region" aria-label="Guides header">
        <div className={note.cardHeader}>
          <div className={note.cardTitle}>
            Guides
            <span className={note.cardSub}>V2</span>
          </div>
          <div className={panel.headTools}>
            <button
              className={`${note.microBtn ?? note.btnSm ?? ''}`}
              data-active={sort === 'updated'}
              onClick={()=>{
                setSort('updated');
                window.dispatchEvent(new CustomEvent('guide:setSort',{ detail:{ sort:'updated' }}));
              }}
            >Updated</button>
            <button
              className={`${note.microBtn ?? note.btnSm ?? ''}`}
              data-active={sort === 'alpha'}
              onClick={()=>{
                setSort('alpha');
                window.dispatchEvent(new CustomEvent('guide:setSort',{ detail:{ sort:'alpha' }}));
              }}
            >A–Z</button>
            <span className={panel.headDivider} aria-hidden="true" />
            <button
              className={`${note.microBtn ?? note.btnSm ?? ''}`}
              data-active={density === 'compact'}
              onClick={()=>{
                setDensity('compact');
                document.documentElement.dataset['guideDensity']='compact';
                window.dispatchEvent(new CustomEvent('guide:setDensity',{ detail:{ density:'compact' }}));
              }}
            >Compact</button>
            <button
              className={`${note.microBtn ?? note.btnSm ?? ''}`}
              data-active={density === 'comfortable'}
              onClick={()=>{
                setDensity('comfortable');
                document.documentElement.dataset['guideDensity']='comfortable';
                window.dispatchEvent(new CustomEvent('guide:setDensity',{ detail:{ density:'comfortable' }}));
              }}
            >Comfort</button>
          </div>
        </div>
      </div>
      <div className={panel.content}>
        <GuideView />
      </div>
    </div>
  );
};

export default GuideViewV2;
