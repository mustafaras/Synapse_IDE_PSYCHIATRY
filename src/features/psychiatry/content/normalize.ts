



import * as rp from '../rightPanelUtils';
import type { NormalizedBlock, RPBundle } from '../rightPanelTypes';

export function dedupeByText(values: string[]): string[] { return rp.uniqByText(values || []); }
export function stripPlaceholders(value: string): string { return rp.stripPlaceholders(value || ''); }



type NormalizedBlockWithQ = NormalizedBlock & { examples: Array<{ id: string; label: string; html: string; question?: string }> };

export function normalizeBundle(bundle: RPBundle): NormalizedBlockWithQ {
	const base = rp.normalizeBundle(bundle);

	const examples = (base.examples || []).map(ex => {
		const q = (ex as unknown as { question?: string }).question;
		const question = q && q.trim().length > 0 ? q : inferQuestionFromHtml(ex.html || '');
		return { ...ex, question };
	});
	return { ...(base as NormalizedBlock), examples };
}

function inferQuestionFromHtml(html: string): string {

	const h = (html || '').toLowerCase();
	if (/phq-?9/.test(h)) return 'Would you like to complete the PHQ‑9 for the past 14 days?';
	if (/gad-?7/.test(h)) return 'Would you like to complete the GAD‑7 for the past 14 days?';
	if (/pcl-?5/.test(h)) return 'Would you like to complete the PCL‑5 for the past month?';
	if (/audit-?c/.test(h)) return 'Would you like to complete the AUDIT‑C alcohol screen?';
	if (/(audit[^c]|\baudit\b)/.test(h)) return 'Would you like to complete the AUDIT alcohol screen?';
	if (/isi\b/.test(h)) return 'Would you like to complete the Insomnia Severity Index (past 2 weeks)?';
	if (/oci-?r/.test(h)) return 'Would you like to complete the OCI‑R for the past month?';
	if (/k10\b/.test(h)) return 'Would you like to complete the K10 for the past 30 days?';
	if (/phq-?15/.test(h)) return 'Would you like to complete the PHQ‑15 for the past month?';
	if (/ede-?q/.test(h)) return 'Would you like to complete the EDE‑Q (monthly) worksheet now?';
	if (/psqi\b|pittsburgh\s+sleep\s+quality/.test(h)) return 'Would you like to complete the PSQI (past month) worksheet?';
	if (/assist\b/.test(h)) return 'Shall we complete the WHO ASSIST interview now?';
	if (/\basrs\b|asrs\s*v1\.1/.test(h)) return 'Would you like to complete the ASRS v1.1 Part A screener?';
	if (/vanderbilt\b/.test(h)) return 'Shall we collect Vanderbilt Parent/Teacher ratings?';
	if (/snap\s*-?iv\b/.test(h)) return 'Would you like to complete the SNAP‑IV ratings?';
	if (/c\s*-?ssrs\b/.test(h)) return 'Let’s perform the C‑SSRS screen now.';
	if (/sleep.*diary/.test(h)) return 'Would you like to fill out a daily sleep diary entry?';
	if (/mood.*diary/.test(h)) return 'Would you like to record today’s mood in the diary?';
	if (/drsp/.test(h)) return 'Would you like to complete the DRSP (daily) chart?';
	return 'Open the interactive form?';
}

