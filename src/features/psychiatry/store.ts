import { create } from 'zustand';
import { resolveSectionFilter, SECTION_INDEX } from './lib/sectionHierarchy';


export type Card = import('./lib/types').Card | {
	id: string;
	title?: string;
	sectionId?: string;

};


interface PsychCardLite { id: string; [k: string]: unknown }
let __psychLibrary: PsychCardLite[] | null = null;
export function __setPsychLibrary(lib: PsychCardLite[]) {
	__psychLibrary = lib;
}


interface NavCardLite extends PsychCardLite {
	id: string;
	title?: string;
	sectionId?: string;
	summary?: string;
	info?: string;
	tags?: string[];
}


export function parseQuery(q: string): string[] {
	return (q || '')
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean)
		.map(tok => tok.trim());
}


export interface FilterInput {
	library: NavCardLite[];
	section: string;
	tokens: string[];
	tags: Set<string>;
	favOnly: boolean;
	favorites: Set<string>;
}

export function filterCards(inp: FilterInput): NavCardLite[] {
	const { library, section, tokens, tags, favOnly, favorites } = inp;

	const allowed = resolveSectionFilter(section === 'all' ? 'all' : section);
	return library.filter(c => {
		const sid = (c.sectionId || '').toLowerCase();
		if (section !== 'all') {
			if (allowed.length) {
				if (!allowed.includes(c.sectionId as string)) return false;
			} else if (sid !== section.toLowerCase()) return false;
		}
		if (favOnly && !favorites.has(c.id)) return false;
		const ctags = Array.isArray(c.tags) ? c.tags.map(t => t.toLowerCase()) : [];
		if (tags.size && ![...tags].every(t => ctags.includes(t))) return false;
		if (!tokens.length) return true;
		const hay = `${c.title || ''} ${c.summary || ''} ${c.info || ''} ${(c.tags || []).join(' ')}`.toLowerCase();
		return tokens.every(tok => {
			if (tok.startsWith('tag:')) return ctags.includes(tok.slice(4));
			if (tok.startsWith('section:')) return sid.includes(tok.slice(8));
			if (tok === 'is:fav') return favorites.has(c.id);
			return hay.includes(tok);
		});
	});
}


function rankRecommended(cards: NavCardLite[], favorites: Set<string>, recent: string[]): NavCardLite[] {
	if (!cards.length) return cards;
	const favTags = new Set<string>();

	for (const id of favorites) {
		const c = cards.find(x => x.id === id);
		if (c && Array.isArray(c.tags)) c.tags.forEach(t => favTags.add(t.toLowerCase()));
	}
	const recIndex = new Map<string, number>();
	recent.forEach((id, idx) => recIndex.set(id, recent.length - idx));
	const scored = cards.map(c => {
		let s = 0;
		if (Array.isArray(c.tags)) for (const t of c.tags) if (favTags.has(t.toLowerCase())) s += 2;
		if ((recIndex.get(c.id) || 0) > 0) s += 1;
		return { ...c, recScore: s } as NavCardLite & { recScore: number };
	});
	scored.sort((a, b) => (b.recScore - a.recScore) || (a.title || '').localeCompare(b.title || ''));
	return scored;
}


export type NavSlice = {

	selectedSectionId: string;
	navQuery: string;
	activeTags: Set<string>;
	favOnly: boolean;
	recMode: boolean;
	recentlyViewedIds: string[];

	visibleCards: () => NavCardLite[];
	sectionCounts: () => Record<string, number>;
	getRecScore: (id: string) => number;

	navSetSection: (id: string) => void;
	navSetQuery: (q: string) => void;
	navToggleTag: (tag: string) => void;
	navToggleFavOnly: () => void;
	navToggleRecMode: () => void;
	navClearFilters: () => void;
	recordView: (cardId: string) => void;
};


const NAV_PREFIX = 'psych.nav.';
function navLoad<T>(k: string, fallback: T): T { try { const raw = localStorage.getItem(NAV_PREFIX + k); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
function navSave(k: string, v: unknown) { try { localStorage.setItem(NAV_PREFIX + k, JSON.stringify(v)); } catch {} }


interface MemoSig { key: string; cards: NavCardLite[]; counts: Record<string, number>; recScores: Map<string, number>; }
let _navMemo: MemoSig | null = null;

function buildSignature(args: { library: NavCardLite[]; section: string; q: string; tags: Set<string>; favOnly: boolean; rec: boolean; favsKey: string; recentKey: string; }): string {
	return [args.library.length, args.section, args.q, [...args.tags].sort().join(','), args.favOnly ? 1 : 0, args.rec ? 1 : 0, args.favsKey, args.recentKey].join('|');
}


export type PsychSection =
	| 'Rapid Triage'
	| 'Scales & Forms'
	| 'Safety Plan'
	| 'Psychoeducation'
	| 'Treatment & Monitoring'
	| 'Ethics & Consent'
	| 'Intake & HPI'
	| 'Risk & Safety'
	| 'Scales & Measures'
	| 'Diagnosis & Differential'
	| 'Treatment Plan'
	| 'Medications'
	| 'Psychotherapy'
	| 'Follow-up & Monitoring';

export type PsychSettings = {
	outputMode: 'html' | 'plain';
	includeSources: boolean;
	includeScoring: boolean;
	density: 'cozy' | 'compact';
    defaultPatientName?: string;
};


export type Density = 'compact' | 'comfortable';
export type UiPrefs = {
	previewOn: boolean;
	appendMode: boolean;
	density: Density;
	rightPaneWidth: number;
};

export type PsychiatryUiState = {
	uiPrefs: UiPrefs;
	setUiPref: (partial: Partial<UiPrefs>) => void;
};

const defaultUiPrefs: UiPrefs = {
	previewOn: false,
	appendMode: false,
	density: 'comfortable',
	rightPaneWidth: 460,
};


export type PromptVarValue = string | number | boolean | string[];
export type VarMap = Record<string, PromptVarValue>;

export type PsychStateV2 = {

	isOpen: boolean;
	section: PsychSection | 'All';
	query: string;

	queryDraft?: string | undefined;
	selectedCardId: string | null;
	favorites: string[];

	starredIds: Set<string>;
	recentlyUsed: string[];
	riskFlag: boolean;
	settings: PsychSettings;

	uiPrefs: UiPrefs;

	cardVars: Record<string, VarMap>;
	setCardVar: (cardId: string, key: string, value: PromptVarValue) => void;
	resetCardVars: (cardId: string) => void;
	overwriteCardVars: (cardId: string, vars: VarMap) => void;

	open: () => void;
	close: () => void;
	setSection: (s: PsychSection | 'All') => void;
	setQuery: (q: string) => void;

	setQueryDraft?: (q: string) => void;

	commitQuery?: (q: string) => void;
	selectCard: (id?: string) => void;
	setSelectedCardId: (id: string | null) => void;
	getSelectedCard: () => PsychCardLite | null;
	toggleFavorite: (id: string) => void;

	toggleStar: (id: string) => void;
	setRiskFlag: (b: boolean) => void;
	setSettings: (p: Partial<PsychSettings>) => void;
	setUiPref: (partial: Partial<UiPrefs>) => void;
    clearRisk?: () => void;
};


type LegacyPsychState = object;


const PERSIST_KEY = 'psychiatry.v2';
function loadV2(): Partial<PsychStateV2> {
	if (typeof window === 'undefined') return {};
	try {
		const raw = localStorage.getItem(PERSIST_KEY);
		const parsed = raw ? JSON.parse(raw) : {};


		if (parsed.isOpen !== undefined) {
			console.log('🧹 [loadV2] Found isOpen:', parsed.isOpen, '→ forcing false');
			parsed.isOpen = false;

			localStorage.setItem(PERSIST_KEY, JSON.stringify(parsed));
		}

		return parsed;
	} catch {
		return {};
	}
}
function saveV2(s: PsychStateV2) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(
			PERSIST_KEY,
			JSON.stringify({
				isOpen: s.isOpen,
				section: s.section,
				query: s.query,
				selectedCardId: s.selectedCardId,
				favorites: s.favorites,
				recentlyUsed: s.recentlyUsed,
				riskFlag: s.riskFlag,
				settings: s.settings,
				uiPrefs: s.uiPrefs,
			})
		);
	} catch {

	}
}

const v2 = loadV2();


function ensureStringArray(val: unknown): string[] {
	if (Array.isArray(val)) return val.filter(v => typeof v === 'string');
	if (val && typeof val === 'object') return Object.keys(val as Record<string, unknown>);
	return [];
}
const hydratedFavorites = ensureStringArray((v2 as Record<string, unknown>)['favorites']);
const hydratedRecentlyUsed = ensureStringArray((v2 as Record<string, unknown>)['recentlyUsed']);


type CombinedState = LegacyPsychState & PsychStateV2 & NavSlice;

export const usePsychStore = create<CombinedState>((set, get) => ({


	isOpen: false,
	section: v2.section ?? 'All',
	query: v2.query ?? '',

	queryDraft: v2.query ?? '',
	selectedCardId: (() => {
		const raw: unknown = (v2 as Record<string, unknown>)['selectedCardId'];
		return typeof raw === 'string' ? raw : null;
	})(),
	favorites: hydratedFavorites,
	starredIds: new Set<string>(hydratedFavorites),
	recentlyUsed: hydratedRecentlyUsed,
	riskFlag: v2.riskFlag ?? false,
	settings: v2.settings ?? {
		outputMode: 'html',
		includeSources: true,
		includeScoring: true,
		density: 'cozy',
		defaultPatientName: 'the patient',
	},

	uiPrefs: (v2 as Record<string, unknown> & { uiPrefs?: UiPrefs }).uiPrefs ? { ...defaultUiPrefs, ...(v2 as Record<string, unknown> & { uiPrefs?: UiPrefs }).uiPrefs! } : defaultUiPrefs,

	cardVars: {},

	open: () =>
		set((s) => {
			const next = { ...s, isOpen: true };
			saveV2(next as PsychStateV2);
			return next;
		}),
	close: () =>
		set((s) => {
			const next = { ...s, isOpen: false };
			saveV2(next as PsychStateV2);
			return next;
		}),
	setSection: (section) =>
		set((s) => {
			const next = { ...s, section };
			saveV2(next as PsychStateV2);
			return next;
		}),
	setQuery: (query) =>
		set((s) => {

			if ((s as PsychStateV2).query === query && (s as PsychStateV2).queryDraft === query) return s;
			const next = { ...s, query, queryDraft: query };
			saveV2(next as PsychStateV2);
			return next;
		}),

	setQueryDraft: (q: string) => set(s => {
		const ps = s as PsychStateV2;
		if (ps.queryDraft === q) return s;
		return { ...ps, queryDraft: q };
	}),

	commitQuery: (q: string) => {
		const current = get() as PsychStateV2;
		const nextVal = q;
		if (current.query === nextVal && current.queryDraft === nextVal) return;
		set(s => {
			const ps = s as PsychStateV2;
			if (ps.query === nextVal && ps.queryDraft === nextVal) return s;
			const next: PsychStateV2 = { ...ps, query: nextVal, queryDraft: nextVal };
			saveV2(next);
			return next;
		});
	},
	selectCard: (id) => get().setSelectedCardId(id ?? null),
	setSelectedCardId: (id) => {
		set((s) => {
			const ps = s as PsychStateV2;
			const normalized: string | null = id ?? null;
			if (ps.selectedCardId === normalized && ps.recentlyUsed[0] === normalized) return s;
			const ru = normalized ? [normalized, ...ps.recentlyUsed.filter(r => r !== normalized)].slice(0,12) : ps.recentlyUsed;
			const next: PsychStateV2 = { ...ps, selectedCardId: normalized, recentlyUsed: ru };
			saveV2(next);
			return next;
		});
	},
	getSelectedCard: () => {
		const id = get().selectedCardId;
		if (!id) return null;

		const all = __psychLibrary ?? [];
		return (all as Card[]).find(c => (c as any).id === id) || null;
	},
	toggleFavorite: (id) =>
		set((s) => {
			const has = s.favorites.includes(id);
			const favorites = has
				? s.favorites.filter((x) => x !== id)
				: [id, ...s.favorites];
			const starredIds = new Set<string>(favorites);
			const next = { ...s, favorites, starredIds };
			saveV2(next as PsychStateV2);
			return next;
		}),
	toggleStar: (id) => set((s) => {
		const has = (s as PsychStateV2).favorites.includes(id);
		const favorites = has ? (s as PsychStateV2).favorites.filter(f => f !== id) : [id, ...(s as PsychStateV2).favorites];
		const starredIds = new Set<string>(favorites);
		const next: PsychStateV2 = { ...(s as PsychStateV2), favorites, starredIds };
		saveV2(next);
		return next;
	}),
	setRiskFlag: (riskFlag) =>
		set((s) => {
			const next = { ...s, riskFlag };
			saveV2(next as PsychStateV2);
			return next;
		}),
	setSettings: (p) =>
		set((s) => {
			const next = { ...s, settings: { ...s.settings, ...p } };
			saveV2(next as PsychStateV2);
			return next;
		}),
	setUiPref: (partial) =>
		set((s) => {
			const merged = { ...(s as PsychStateV2).uiPrefs, ...partial };
			const next: PsychStateV2 = { ...(s as PsychStateV2), uiPrefs: merged };
			saveV2(next);
			return next;
		}),
    clearRisk: () => set((s) => { const next = { ...s, riskFlag: false }; saveV2(next as PsychStateV2); return next; }),


	setCardVar: (cardId, key, value) =>
		set((st) => {
			const current = (st as PsychStateV2).cardVars[cardId] || {};
			return { cardVars: { ...(st as PsychStateV2).cardVars, [cardId]: { ...current, [key]: value } } } as Partial<PsychStateV2>;
		}),
	resetCardVars: (cardId) =>
		set((st) => ({ cardVars: { ...(st as PsychStateV2).cardVars, [cardId]: {} } } as Partial<PsychStateV2>)),
	overwriteCardVars: (cardId, vars) =>
		set((st) => ({ cardVars: { ...(st as PsychStateV2).cardVars, [cardId]: { ...(vars ?? {}) } } } as Partial<PsychStateV2>)),


	selectedSectionId: navLoad('section', 'all'),
	navQuery: navLoad('query', ''),
	activeTags: new Set<string>(navLoad<string[]>('tags', [])),
	favOnly: navLoad('favOnly', false),
	recMode: navLoad('recMode', false),
	recentlyViewedIds: navLoad('recent', [] as string[]),

	visibleCards: () => {
		const state = get() as unknown as PsychStateV2 & NavSlice;
		if (!__psychLibrary) return [];
		const library = __psychLibrary as NavCardLite[];
		  const favorites = new Set<string>((state as unknown as PsychStateV2).favorites || []);
		  const tokens = parseQuery(state.navQuery || '');
		const sig = buildSignature({
			library,
			section: state.selectedSectionId || 'all',
		      q: (state.navQuery || '').trim().toLowerCase(),
			tags: state.activeTags,
			favOnly: state.favOnly,
			rec: state.recMode,
			favsKey: [...favorites].join(','),
			recentKey: state.recentlyViewedIds.join(','),
		});
		if (_navMemo && _navMemo.key === sig) return _navMemo.cards;
		const base = filterCards({
			library,
		      section: state.selectedSectionId || 'all',
		      tokens,
		      tags: state.activeTags,
		      favOnly: state.favOnly,
		      favorites,
		});
		const ranked = state.recMode ? rankRecommended(base, favorites, state.recentlyViewedIds) : base.slice().sort((a,b)=> (a.title||'').localeCompare(b.title||''));

		const counts: Record<string, number> = { all: 0 };
		for (const c of base) {
			counts.all++;
			const sid = (c.sectionId || 'other');
			counts[sid] = (counts[sid] || 0) + 1;
		}

		const recScores = new Map<string, number>();
		for (const c of ranked) {
			const maybeScore = (c as Partial<{ recScore: number }>).recScore;
			recScores.set(c.id, typeof maybeScore === 'number' ? maybeScore : 0);
		}
		_navMemo = { key: sig, cards: ranked, counts, recScores };
		return ranked;
	},
	sectionCounts: () => {
		const state = get() as unknown as PsychStateV2 & NavSlice;
		state.visibleCards();
		const base = _navMemo?.counts || { all: 0 };

		const agg: Record<string, number> = { ...base };
		for (const parent of Object.keys(SECTION_INDEX.parentToChildren)) {
			const kids = SECTION_INDEX.parentToChildren[parent];
			agg[parent] = kids.reduce((sum: number, kid: string) => sum + (base[kid] || 0), 0);
		}
		return agg;
	},
	getRecScore: (id: string) => {
		const state = get() as unknown as PsychStateV2 & NavSlice;
		state.visibleCards();
		return _navMemo?.recScores.get(id) || 0;
	},
		navSetSection: (id: string) => {
		set((s: CombinedState) => {

			let legacySection: PsychSection | 'All' = (s as PsychStateV2).section;
			if (id === 'all') legacySection = 'All';
			const next: CombinedState = { ...(s as CombinedState), selectedSectionId: id, section: legacySection };
			navSave('section', id);
			return next;
		});
	},
	navSetQuery: (q: string) => {
		set((s: CombinedState) => {

			if (s.navQuery === q && (s as PsychStateV2).query === q && (s as PsychStateV2).queryDraft === q) return s;
			const next: CombinedState = { ...(s as CombinedState), navQuery: q, query: q, queryDraft: q };
			navSave('query', q);
			return next;
		});
	},
	navToggleTag: (tag: string) => {
		set((s: CombinedState) => {
			const setTags: Set<string> = new Set(s.activeTags || []);
			if (setTags.has(tag)) setTags.delete(tag); else setTags.add(tag);
			navSave('tags', [...setTags]);
			return { ...(s as CombinedState), activeTags: setTags } as CombinedState;
		});
	},
	navToggleFavOnly: () => set((s: CombinedState) => { const v = !s.favOnly; navSave('favOnly', v); return { ...(s as CombinedState), favOnly: v }; }),
	navToggleRecMode: () => set((s: CombinedState) => { const v = !s.recMode; navSave('recMode', v); return { ...(s as CombinedState), recMode: v }; }),
	navClearFilters: () => set((s: CombinedState) => { navSave('query',''); navSave('tags',[]); navSave('favOnly',false); return { ...(s as CombinedState), navQuery:'', activeTags:new Set(), favOnly:false }; }),
	recordView: (cardId: string) => set((s: CombinedState) => {
		const prev: string[] = s.recentlyViewedIds || [];
		if (prev[0] === cardId) return s;
		const nextList = [cardId, ...prev.filter(i => i !== cardId)].slice(0,20);
		navSave('recent', nextList);
		return { ...(s as CombinedState), recentlyViewedIds: nextList } as CombinedState;
	}),
}));


export type SelectionSlice = {
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
  getSelectedCard: () => Card | null;
};

export type PsychStore = CombinedState;


export const selectSelectedCardId = (s: PsychStore) => s.selectedCardId;
export const selectSelectedCard = (s: PsychStore) => (s as any).getSelectedCard?.() ?? null as Card | null;


export const useSelectedCardId = () => usePsychStore(selectSelectedCardId);
export const useSelectedCard = () => usePsychStore(selectSelectedCard);

