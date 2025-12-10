



import type { RPBundle, RPKey } from '../rightPanelTypes';
import { buildPsychBundleForKey } from '../rightPanelUtils';
import { assertContentPack, normalizeInstrumentId, packToBundle, SECTION8_CONTENT } from './section8.index';


function normalizeId(id: string): string {
	const raw = (id || '').toLowerCase().trim();
	const map: Record<string, string> = {
		'phq-9': 'phq9', 'gad-7': 'gad7', 'pcl-5': 'pcl5', 'audit-c': 'auditc',
		'sleep-diary-lite': 'daily-sleep-lite', 'sleep-lite': 'daily-sleep-lite',
		'edeq': 'ede-q', 'ede q': 'ede-q', 'ghq12': 'ghq-12', 'oci': 'oci-r', 'ocir': 'oci-r',
		'asrs v1.1': 'asrs', 'asrs-v1.1': 'asrs', 'snap iv': 'snap-iv', 'who assist': 'assist',
		'c ssrs': 'c-ssrs', 'c ssrs screening': 'c-ssrs', 'pittsburgh sleep quality index': 'psqi'
	};
	return map[raw] || raw;
}



export const S8_MAP: Record<string, { leafId: string; subleafId: string }> = {

	'daily-mood': { leafId: 'psychometrics-daily', subleafId: 'Daily Mood Diary' },
	'daily-sleep-lite': { leafId: 'psychometrics-daily', subleafId: 'Sleep Diary — Lite' },
	'drsp': { leafId: 'psychometrics-daily', subleafId: 'DRSP' },

	'phq9': { leafId: 'psychometrics-biweekly', subleafId: 'PHQ-9' },
	'gad7': { leafId: 'psychometrics-biweekly', subleafId: 'GAD-7' },
	'isi': { leafId: 'psychometrics-biweekly', subleafId: 'ISI' },

	'pcl5': { leafId: 'psychometrics-monthly', subleafId: 'PCL-5' },
	'oci-r': { leafId: 'psychometrics-monthly', subleafId: 'OCI-R' },
	'phq15': { leafId: 'psychometrics-monthly', subleafId: 'PHQ-15' },
	'k10': { leafId: 'psychometrics-monthly', subleafId: 'K10' },
	'ghq-12': { leafId: 'psychometrics-monthly', subleafId: 'GHQ-12' },
	'ede-q': { leafId: 'psychometrics-monthly', subleafId: 'EDE-Q' },
	'psqi': { leafId: 'psychometrics-monthly', subleafId: 'PSQI' },

	'audit': { leafId: 'psychometrics-monthly', subleafId: 'AUDIT' },
	'auditc': { leafId: 'psychometrics-monthly', subleafId: 'AUDIT-C' },
	'dast10': { leafId: 'psychometrics-monthly', subleafId: 'DAST-10' },
	'assist': { leafId: 'psychometrics-monthly', subleafId: 'ASSIST' },

	'asrs': { leafId: 'psychometrics-monthly', subleafId: 'ASRS v1.1 (Part A)' },
	'vanderbilt': { leafId: 'psychometrics-monthly', subleafId: 'Vanderbilt (Parent/Teacher)' },
	'snap-iv': { leafId: 'psychometrics-monthly', subleafId: 'SNAP-IV' },
	'c-ssrs': { leafId: 'psychometrics-monthly', subleafId: 'C-SSRS' },
};

export function resolveSection8RPKey(title: string, subtype?: string): RPKey | null {
	const normTitle = (title || '').toLowerCase();
	const tryIds: string[] = [];
	if (subtype) tryIds.push(subtype);
	const hints: Array<[RegExp, string]> = [
		[/phq\s*-?9/, 'phq9'], [/gad\s*-?7/, 'gad7'], [/pcl\s*-?5/, 'pcl5'], [/audit\s*-?c\b/, 'auditc'], [/\baudit\b/, 'audit'], [/dast\s*-?10/, 'dast10'], [/isi\b/, 'isi'], [/k10\b/, 'k10'], [/phq\s*-?15\b/, 'phq15'], [/oci\s*-?r\b/, 'oci-r'], [/\by-?bocs\b/, 'y-bocs'], [/ede\s*-?q\b/, 'ede-q'], [/ghq\s*-?12\b/, 'ghq-12'], [/psqi\b|pittsburgh\s+sleep\s+quality/, 'psqi'], [/assist\b/, 'assist'], [/\basrs\b|asrs\s*v1\.1/, 'asrs'], [/snap\s*-?iv\b/, 'snap-iv'], [/vanderbilt\b/, 'vanderbilt'], [/c\s*-?ssrs\b/, 'c-ssrs'], [/daily\s+mood|mood\s+diary/, 'daily-mood'], [/sleep\s+diary/, 'daily-sleep-lite'], [/drsp\b/, 'drsp']
	];
	for (const [re, id] of hints) if (re.test(normTitle)) tryIds.push(id);
	for (const raw of tryIds) {
		const id = normalizeId(raw);
		const meta = S8_MAP[id];
		if (meta) return { sectionId: 'psychometrics', leafId: meta.leafId, subleafId: meta.subleafId, itemId: id };
	}
	return null;
}

export function getSection8Bundle(key: RPKey): RPBundle {
	if (!key || key.sectionId !== 'psychometrics') return { infoCards: [], exampleHtml: '', prompts: [], references: [] };
	const id = normalizeId(key.itemId || '');


	const norm = normalizeInstrumentId(id);
	if (norm && SECTION8_CONTENT[norm]) {
		const pack = SECTION8_CONTENT[norm];
		try { assertContentPack(norm, pack); } catch {  }
			const bundle = packToBundle(pack);

			if (norm === 'audit' || norm === 'auditc' || norm === 'asrs_v1_1') {
			const base = buildPsychBundleForKey({ ...key, itemId: id });
			return { ...bundle, exampleHtml: base.exampleHtml };
		}
		return bundle;
	}


	const base = buildPsychBundleForKey({ ...key, itemId: id });


	const byId: Record<string, Partial<RPBundle>> = {

		'audit': {
			prompts: [
				'Compute AUDIT total and document risk band; discuss brief intervention if positive.',
				'Confirm time frame (past 12 months) and explore readiness to change; offer resources.'
			],
			references: [
				'Babor TF, Higgins-Biddle JC, Saunders JB, Monteiro MG. AUDIT: The Alcohol Use Disorders Identification Test. WHO; 2001.'
			]
		},
		'auditc': {
			prompts: [
				'Administer AUDIT-C (3 items); apply sex-specific thresholds (e.g., ≥3 women, ≥4 men).',
				'If positive, follow with full AUDIT or brief counseling per guideline.'
			],
			references: [
				'Bush K, Kivlahan DR, McDonell MB, Fihn SD, Bradley KA. The AUDIT Alcohol Consumption Questions (AUDIT-C). Arch Intern Med. 1998.'
			]
		},
		'dast10': {
			prompts: [
				'Administer DAST-10 and classify severity (0 none, 1–2 low, 3–5 moderate, 6–8 substantial, 9–10 severe).',
				'If moderate or greater, assess functional impairment and safety; consider referral.'
			],
			references: [
				'Skinner HA. The Drug Abuse Screening Test. Addict Behav. 1982.'
			]
		},
		'assist': {
			infoCards: [
				{ title: 'Overview', body: ['WHO ASSIST — multi-substance involvement screening; structured scoring.', 'Time window varies by domain; see instrument guidance.'] },
				{ title: 'Use', body: ['Identify substance involvement and risk level.', 'Guide brief intervention and referral to treatment.'] }
			],
			prompts: [
				'Complete WHO ASSIST interview; record domain scores and risk categories.',
				'Provide feedback and brief intervention per WHO ASSIST guideline.'
			],
			references: [
				'WHO ASSIST Working Group. The Alcohol, Smoking and Substance Involvement Screening Test (ASSIST): development and validation. Addiction. 2002.'
			]
		},

		'ghq-12': {
			infoCards: [
				{ title: 'Overview', body: ['GHQ-12 — general psychological distress (last weeks).', 'Scoring modes: GHQ (0-0-1-1) or Likert (0–3).'] },
				{ title: 'Use', body: ['Population or clinical screening of current distress.', 'Follow up positives with clinical assessment.'] }
			],
			prompts: [ 'Score GHQ (0-0-1-1) and Likert (0–3); note which mode used in the chart.' ],
			references: [ 'Goldberg DP, Williams P. A user’s guide to the GHQ. NFER-Nelson; 1988.' ]
		},
		'ede-q': {
			infoCards: [
				{ title: 'Overview', body: ['EDE-Q — eating disorder psychopathology (past 28 days).', 'Use global and subscale scores.'] },
				{ title: 'Use', body: ['Baseline assessment and monitoring in eating disorder care.', 'Document weight/shape/eating concerns and impairment.'] }
			],

			prompts: [ 'Compute EDE-Q global and subscales; discuss changes since baseline.' ],
			references: [ 'Fairburn CG, Beglin SJ. Assessment of eating disorders: interview or self-report questionnaire? Int J Eat Disord. 1994.' ]
		},
		'oci-r': {
			prompts: [ 'Administer OCI‑R (past month) and review subscale patterns (washing, checking, etc.).' ],
			references: [ 'Foa EB et al. The Obsessive–Compulsive Inventory: Development and validation. Psychol Assess. 2002.' ]
		},

		'psqi': {
			infoCards: [
				{ title: 'Overview', body: ['PSQI — sleep quality over the past month.', 'Compute 7 component scores (0–3) and a global score.'] },
				{ title: 'Use', body: ['Screen and monitor subjective sleep quality; complement with ISI/sleep diary where appropriate.'] }
			],
			prompts: [
				'Compose PSQI component and global scores; interpret alongside ISI and diary metrics (e.g., sleep efficiency).',
				'Identify target domains for intervention (sleep latency, efficiency, disturbances).'
			],
			references: [
				'Buysse DJ, Reynolds CF III, Monk TH, Berman SR, Kupfer DJ. Pittsburgh Sleep Quality Index (PSQI). Psychiatry Res. 1989.'
			]
		},

		'asrs': {
			infoCards: [
				{ title: 'Overview', body: ['ASRS v1.1 Part A — adult ADHD screener (6 items).', 'Positive: ≥4 items rated 2–4 in shaded boxes (per official guidance).'] },
				{ title: 'Use', body: ['Screen adults for ADHD symptoms; follow up with full diagnostic interview.'] }
			],
			prompts: [ 'Screen with ASRS Part A; if positive, plan comprehensive ADHD assessment.' ],
			references: [ 'Kessler RC et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychol Med. 2005.' ]
		},
		'vanderbilt': {
			infoCards: [
				{ title: 'Overview', body: ['Vanderbilt ADHD scales — parent/teacher forms covering symptoms and performance.'] },
				{ title: 'Use', body: ['Pediatric ADHD evaluation; collect from multiple informants and settings.'] }
			],
			prompts: [ 'Collect Vanderbilt Parent and Teacher forms; synthesize across settings and impairment.' ],
			references: [ 'Wolraich ML et al. Vanderbilt ADHD Diagnostic Parent Rating Scale (VADPRS). Pediatrics. 2003.' ]
		},
		'snap-iv': {
			infoCards: [
				{ title: 'Overview', body: ['SNAP‑IV — ADHD/ODD symptom ratings (home/school).'] }
			],
			prompts: [ 'Administer SNAP‑IV to parent/teacher; review ADHD/ODD patterns and impairment.' ],
			references: [ 'Swanson JM et al. SNAP-IV Scale. 1992; updated versions widely used in ADHD assessment.' ]
		},
		'c-ssrs': {
			infoCards: [
				{ title: 'Overview', body: ['C‑SSRS — screening for suicidal ideation and behavior.', 'Follow institutional policy for responses.'] }
			],
			prompts: [ 'Perform C‑SSRS screen; document risk level and safety plan steps immediately.' ],
			references: [ 'Posner K et al. The Columbia–Suicide Severity Rating Scale. Am J Psychiatry. 2011.' ]
		},

		'daily-mood': {
			prompts: [ 'Ask patient to complete the daily mood entry (0–10) with notes and triggers.' ],
			references: [ 'Beck AT. Cognitive Therapy and the Emotional Disorders. 1976. (Behavioral activation and self‑monitoring.)' ]
		},
		'daily-sleep-lite': {
			prompts: [ 'Record bedtime, wake time, total sleep time, awakenings, naps, and substances daily.' ],
			references: [ 'Buysse DJ et al. Recommendations for a standardized sleep diary. J Clin Sleep Med. 2006.' ]
		},
		'drsp': {
			prompts: [ 'Complete DRSP daily (1–6) across mood/interest/energy/somatic symptoms; summarize per cycle.' ],
			references: [ 'Endicott J et al. The Daily Record of Severity of Problems (DRSP) for PMDD. Arch Womens Ment Health. 2006.' ]
		}
	};

	const override = byId[id] || {};

	const merged: RPBundle = {
		infoCards: (override.infoCards && override.infoCards.length ? override.infoCards : base.infoCards) || [],
		exampleHtml: override.exampleHtml ?? base.exampleHtml,
		prompts: Array.from(new Set([...(base.prompts || []), ...((override.prompts || []))])),
		references: Array.from(new Set([...(base.references || []), ...((override.references || []))]))
	};
	return merged;
}

