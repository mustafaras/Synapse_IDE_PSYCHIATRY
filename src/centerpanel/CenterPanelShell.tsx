import React, { useEffect, useState } from "react";
import styles from "./styles/centerpanel.module.css";
import a11y from "./styles/a11y.module.css";
import "./styles/tokens.css";

import { MAIN_SCROLL_ROOT_ID } from "./sections";
import SessionPersistence from "./SessionPersistence";
import { usePersistMeta } from "../stores/usePersistMeta";

import { useAccessStore } from "../stores/useAccessStore";

import ToolsPatientList from "./Tools/ToolsPatientList";
import ToolsActionPanel from "./Tools/ToolsActionPanel";
import { RegistryLeft, RegistryMain } from "./registry-ui/Registry.tsx";
import { ensureSeed, RegistryProvider } from "./registry/state";
import NewPatientPage from "./registry-ui/NewPatientPage";
import GuideView from "./Guide/GuideView";
import GuideViewV2 from "./Guide/GuideViewV2";
import DraftSnapshotCard from "./rail/DraftSnapshotCard";
import railStyles from "./rail/rail.module.css";
import { useNewPatientDraftStore } from "../stores/useNewPatientDraftStore";
import Note, { NoteRail } from "./tabs/Note";
import OutlineRail from "./Guide/OutlineRail";
import OutlineRailV2 from "./Guide/OutlineRailV2";
import { isGuideV2Enabled } from "./Guide/featureFlags";
import FlowHost from "./Flows/FlowHost";
import FlowsRail from "./Flows/FlowsRail";
import type { FlowId } from "./Flows/flowTypes";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

import TopHeader from "./components/TopHeader";
import { TimerButton } from "./components/TimerButton";
import { TimerModal } from "./components/TimerModal";
import { useTimerModalStore } from "../stores/useTimerModalStore";
import { TimerProvider, useTimer } from "./state/useTimerEngine.tsx";


export interface CenterPanelShellProps {
	title?: string;
	subtitle?: string;
	outlineSlot?: React.ReactNode;
	mainSlot?: React.ReactNode;

	footnoteLeft?: React.ReactNode;
	footerLeft?: React.ReactNode;
	footerRight?: React.ReactNode;
	noteSlot?: React.ReactNode;
	flowsSlot?: React.ReactNode;
	toolsSlot?: React.ReactNode;
}

type Tab = "Registry" | "New Patient" | "Guide" | "Note" | "Flows" | "Tools";

const TABS: Tab[] = ["Registry", "New Patient", "Guide", "Note", "Flows", "Tools"];

const CenterPanelShell: React.FC<CenterPanelShellProps> = ({
	footerLeft,
	footerRight,
}) => {
	const defaultTab: Tab = "Registry";
	const [activeTab, setActiveTab] = useState<Tab>(() => defaultTab);
	const [activeFlowId, setActiveFlowId] = useState<FlowId>("bfcrs");

	const [activeReviewRun, setActiveReviewRun] = useState<{ encounterId: string; runIndex: number } | null>(null);
	const sessionName = usePersistMeta(s => s.sessionName);


	const isTimerOpen = useTimerModalStore(s => s.isOpen);
	const openTimer = useTimerModalStore(s => s.open);
	const closeTimer = useTimerModalStore(s => s.close);
	const toggleTimer = useTimerModalStore(s => s.toggle);


	useEffect(() => {
		try { console.warn("[Timer] isOpen:", isTimerOpen); } catch {}
	}, [isTimerOpen]);


	useEffect(() => {
	  const onKeyDown = (e: KeyboardEvent) => {
	    const isT = (e.key === "t" || e.key === "T");
	    if (isT && e.shiftKey && (e.ctrlKey || e.metaKey)) {
	      e.preventDefault();
	      e.stopPropagation();
					toggleTimer();
	    }
	  };
	  window.addEventListener("keydown", onKeyDown, { capture: true });
	  return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
		}, [toggleTimer]);


	const [nowTs, setNowTs] = useState<number>(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setNowTs(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);


	useEffect(() => { try { ensureSeed(); } catch {} }, []);


	useEffect(() => {
			const onKey = (e: KeyboardEvent) => {
			if (e.altKey || e.metaKey || e.ctrlKey) return;
			const idx = Number(e.key);
				if (Number.isFinite(idx) && idx >= 1 && idx <= TABS.length) setActiveTab(TABS[idx - 1]);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);


	const mode = useAccessStore(s => s.mode);


	const draftActive = useNewPatientDraftStore(s => s.newPatientDraftActive);


	const showFooter = false;

		const reduceMotion = usePrefersReducedMotion();


		return (
			<TimerProvider>
				<section className={styles.shell} data-access-mode={mode} aria-label="Center panel area" data-reduce-motion={reduceMotion ? true : undefined}>
		<a href={`#${MAIN_SCROLL_ROOT_ID}`} className={a11y.skipLink}>Skip to main content</a>

	            {}
	            <RegistryProvider>
						<TopHeader
	            	    tabs={TABS}
	            	    activeTab={activeTab}
	            	    onTabChange={(t: string) => setActiveTab(t as Tab)}
	            	    sessionLabel={(sessionName || "session")}
	            	    nowTs={nowTs}
	            		>
							<HeaderTimerButton onOpen={openTimer} />
	            	</TopHeader>

	{}

			{}
					<SessionPersistence />
					<div className={`${styles.body} ${styles.bodyNoRightDock}`}>
						{activeTab === "Registry" ? (
							<>
								<nav
									key={activeTab}
									className={`${styles.outline} noPrint ${styles.panelEnter}`}
									aria-label="Left navigation"
									data-testid="cp-outline"
								>
									<RegistryLeft />
								</nav>
								<main id={MAIN_SCROLL_ROOT_ID} className={styles.main} role="main" data-testid="cp-main">
									<section
										key={activeTab}
										className={styles.panelEnter}
										id={`panel-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
										role="tabpanel"
										aria-labelledby={`tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
									>
										<RegistryMain />
									</section>
								</main>
							</>
						) : activeTab === "New Patient" ? (
							<>
								<nav
									key={activeTab}
									className={`${styles.outline} noPrint ${styles.panelEnter}`}
									aria-label="Left navigation"
									data-testid="cp-outline"
								>
									{draftActive ? (
										<aside className={railStyles.leftRailRoot}>
											<DraftSnapshotCard />
										</aside>
									) : (
										<div />
									)}
								</nav>
								<main id={MAIN_SCROLL_ROOT_ID} className={styles.main} role="main" data-testid="cp-main">
									<section
										key={activeTab}
										className={styles.panelEnter}
										id={`panel-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
										role="tabpanel"
										aria-labelledby={`tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
									>
										<NewPatientPage />
									</section>
								</main>
							</>
						) : activeTab === "Guide" ? (
							<>
								<nav
									key={activeTab}
									className={`${styles.outline} noPrint ${styles.panelEnter}`}
									aria-label="Left navigation"
									data-testid="cp-outline"
								>
									{isGuideV2Enabled() ? <OutlineRailV2 /> : <OutlineRail />}
								</nav>
								<main id={MAIN_SCROLL_ROOT_ID} className={styles.main} role="main" data-testid="cp-main">
									<section
										key={activeTab}
										className={styles.panelEnter}
										id={`panel-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
										role="tabpanel"
										aria-labelledby={`tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
									>
										{isGuideV2Enabled() ? <GuideViewV2 /> : <GuideView />}
									</section>
								</main>
							</>
						) : activeTab === "Tools" ? (
							<>
								<nav
									key={activeTab}
									className={`${styles.outline} ${styles.outlineTight} noPrint ${styles.panelEnter}`}
									aria-label="Left navigation"
									data-testid="cp-outline"
								>
									<aside className={`${railStyles.leftRailRoot} ${railStyles.toolsRailPad5}`}>
										<ToolsPatientList />
									</aside>
								</nav>
								<main id={MAIN_SCROLL_ROOT_ID} className={styles.main} role="main" data-testid="cp-main">
									<section
										key={activeTab}
										className={styles.panelEnter}
										id={`panel-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
										role="tabpanel"
										aria-labelledby={`tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
									>
										<ToolsActionPanel />
									</section>
								</main>
							</>
						) : activeTab === "Note" ? (
							<>
								<nav
									key={activeTab}
									className={`${styles.outline} noPrint ${styles.panelEnter}`}
									aria-label="Note left rail"
									data-testid="cp-outline"
								>
									<NoteRail />
								</nav>
								<main id={MAIN_SCROLL_ROOT_ID} className={styles.main} role="main" data-testid="cp-main">
									<section
										key={activeTab}
										className={styles.panelEnter}
										id={`panel-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
										role="tabpanel"
										aria-labelledby={`tab-${activeTab.toLowerCase().replace(/\s+/g, '-')}`}
									>
										<Note />
									</section>
								</main>
							</>
						) : activeTab === "Flows" ? (
							<>
								<nav
									key={activeTab}
									className={`${styles.outline} noPrint ${styles.panelEnter}`}
									aria-label="Flows left rail"
									data-testid="cp-outline"
								>
									<FlowsRail
										activeFlowId={activeFlowId}
										onSelectFlow={(fid) => {
											setActiveFlowId(fid);
											if (fid !== "review") setActiveReviewRun(null);
										}}
										onOpenReviewRun={(encounterId, runIndex) => {
											setActiveReviewRun({ encounterId, runIndex });
											setActiveFlowId("review");
										}}
									/>
								</nav>
								<main id={MAIN_SCROLL_ROOT_ID} className={styles.main} role="main" data-testid="cp-main">
									<section key={activeTab} className={styles.panelEnter} id="panel-flows" role="tabpanel" aria-labelledby="tab-flows">
										<FlowHost activeFlowId={activeFlowId} activeReviewRun={activeReviewRun} />
									</section>
								</main>
							</>
						) : (
							<>
								<nav
									key={activeTab}
									className={`${styles.outline} ${styles.panelEnter}`}
									aria-label="Left navigation"
									data-testid="cp-outline"
								>
									<div />
								</nav>
								<main id={MAIN_SCROLL_ROOT_ID} className={styles.main} role="main" data-testid="cp-main">
									<section id="panel-fallback" role="tabpanel" aria-labelledby="tab-fallback">
										<div />
									</section>
								</main>
							</>
						)}

						{}
					</div>
	            {}
	            {isTimerOpen ? <TimerModal open={isTimerOpen} onClose={closeTimer} skin="np" /> : null}
	            </RegistryProvider>

				{}
				{showFooter && (
					<footer className={styles.footer} role="contentinfo">
						<div>{footerLeft ?? <span />}</div>
						<div>{footerRight ?? <span />}</div>
					</footer>
				)}
		</section>
		</TimerProvider>
	);
};

export default CenterPanelShell;

function HeaderTimerButton({ onOpen }: { onOpen: () => void }) {
	const { t } = useTimer();
	const running = t.phase === "running";
	return <TimerButton onOpen={onOpen} running={running} />;
}
