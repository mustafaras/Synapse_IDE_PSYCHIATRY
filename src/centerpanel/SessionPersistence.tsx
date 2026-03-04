import React from "react";
import { debounce, loadPersist, savePersist, PERSIST_VERSION } from "./lib/persist";
import { useNoteStore } from "../stores/useNoteStore";
import { useCalcStore } from "../stores/useCalcStore";
import { useFlowStore } from "../stores/useFlowStore";
import { usePersistMeta } from "../stores/usePersistMeta";
import { useAccessStore } from "../stores/useAccessStore";


const SessionPersistence: React.FC = () => {
  const meta = usePersistMeta();


  React.useEffect(() => {
    const blob = loadPersist();
    if (!blob) { meta.markLoaded(); return; }


    if (blob.note && typeof blob.note === "object") {
      const { summary, plan, refs, outcome, vitals } = blob.note;
      useNoteStore.setState((s) => ({
        ...s,
        summary: summary ?? s.summary,
        plan: plan ?? s.plan,
        refs: refs ?? s.refs,
        outcome: outcome ?? s.outcome,
        vitals: vitals ?? s.vitals,
      }) as any);
    }


    if (blob.calc && typeof blob.calc === "object") {
      const { scores, total } = blob.calc as any;
      useCalcStore.setState((s) => ({ ...s, scores: scores ?? s.scores, total: total ?? s.total }));
    }


    if (blob.flow && typeof blob.flow === "object") {
      const allow = [
        "step","eligibilityAt","baselineAt","doseAt","reassessAt","completedAt",
        "eligible","contraindications","baselineBFCRS","baselineNotes",
        "doseMg","route","responseMinutes","postBFCRS","effect","adverse","outcomeText"
      ] as const;
      const patch: any = {};
      allow.forEach(k => { if (k in (blob.flow as any)) (patch as any)[k] = (blob.flow as any)[k]; });
      useFlowStore.setState(patch);
    }


    try {
      const anyBlob: any = blob as any;
      if (anyBlob.access) {
        const { mode, role } = anyBlob.access as { mode?: string; role?: string };
        if (mode === "edit" || mode === "readonly" || mode === "locked") useAccessStore.setState({ mode });
        if (role === "clinician" || role === "viewer" || role === "admin") useAccessStore.setState({ role });
      }
    } catch {}

    if (blob.name) meta.setName(blob.name);
    meta.markLoaded(blob.savedAt);

  }, []);


  const scheduleSave = React.useRef(
    debounce(() => {
      const blob = {
        ver: PERSIST_VERSION,
        name: usePersistMeta.getState().sessionName,
        savedAt: Date.now(),
        note: {
          summary: useNoteStore.getState().summary,
          plan: useNoteStore.getState().plan,
          refs: useNoteStore.getState().refs,
          outcome: useNoteStore.getState().outcome,
          vitals: useNoteStore.getState().vitals,
        },
        calc: {
          scores: useCalcStore.getState().scores,
          total: useCalcStore.getState().total,
        },
        flow: (() => {
          const s = useFlowStore.getState();
          return {
            step: s.step,
            eligibilityAt: s.eligibilityAt, baselineAt: s.baselineAt, doseAt: s.doseAt, reassessAt: s.reassessAt, completedAt: s.completedAt,
            eligible: s.eligible, contraindications: s.contraindications,
            baselineBFCRS: s.baselineBFCRS, baselineNotes: s.baselineNotes,
            doseMg: s.doseMg, route: s.route,
            responseMinutes: s.responseMinutes, postBFCRS: s.postBFCRS, effect: s.effect, adverse: s.adverse,
            outcomeText: s.outcomeText,
          } as any;
        })(),
        access: { mode: useAccessStore.getState().mode, role: useAccessStore.getState().role },
      } as const;
      savePersist(blob as any);
      meta.markSaved((blob as any).savedAt);
    }, 750)
  ).current;


  React.useEffect(() => {
    const un1 = useNoteStore.subscribe(scheduleSave);
    const un2 = useCalcStore.subscribe(scheduleSave);
    const un3 = useFlowStore.subscribe(scheduleSave);
    return () => { un1(); un2(); un3(); };
  }, [scheduleSave]);

  return null;
};

export default SessionPersistence;
