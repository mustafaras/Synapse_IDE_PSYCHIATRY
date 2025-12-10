import React from "react";
import styles from "../styles/centerpanel.module.css";

type Tone = "ok" | "warn" | "bad" | "idle";

export type StatusSegment = {
	label: string;
	value: number;
	tone?: Tone;
	tooltip?: string;
};

export type StatusRailMode = "segmented" | "progress";

export interface StatusRailProps {
	mode: StatusRailMode;
	segments?: StatusSegment[];
	progress?: number;
	ariaLabel?: string;
}

function clamp01(n: number) {
	if (Number.isNaN(n)) return 0;
	return Math.max(0, Math.min(1, n));
}

function normalizePercent(n: number) {

	if (n <= 1) return clamp01(n) * 100;
	return clamp01(n / 100) * 100;
}

const toneClass: Record<Tone, string> = {
	ok: styles.railSegOk,
	warn: styles.railSegWarn,
	bad: styles.railSegBad,
	idle: styles.railSegIdle,
};

export const StatusRail: React.FC<StatusRailProps> = ({ mode, segments, progress, ariaLabel }) => {
	if (mode === "segmented") {
		const segs = (segments ?? []).map((s) => ({
			label: s.label,
			value: normalizePercent(s.value),
			tone: s.tone ?? "idle",
			tooltip: s.tooltip ?? `${s.label}: ${normalizePercent(s.value).toFixed(0)}%`,
		}));
		const total = segs.reduce((a, b) => a + b.value, 0);
		const scale = total > 0 ? 100 / total : 1;
		return (
			<div className={styles.statusRail} data-testid="status-rail">
				<div className={styles.railBar} role="list" aria-label={ariaLabel ?? "Status segments"}>
					<div className={styles.railSegments}>
						{segs.map((s, i) => (
							<div
								key={i}
								role="listitem"
								className={[styles.railSeg, toneClass[s.tone!]].join(" ")}
								style={{ width: `${s.value * scale}%` }}
								title={s.tooltip}
								aria-label={`${s.label} ${Math.round(s.value * scale)}%`}
							/>
						))}
					</div>
				</div>
			</div>
		);
	}


	const p = normalizePercent(progress ?? 0);
	return (
		<div className={styles.statusRail} data-testid="status-rail">
			<div
				className={styles.railBar}
				role="meter"
				aria-label={ariaLabel ?? "Overall progress"}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(p)}
			>
				<div className={styles.railIndicator} style={{ width: `${p}%` }} />
			</div>
		</div>
	);
};

export default StatusRail;

