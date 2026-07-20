// Shared, framework-agnostic definitions for the care-log activity types.
// Used by both server (validation, seed) and client (buttons, dashboard).

export type CareType =
	| 'feeding'
	| 'pee'
	| 'poo'
	| 'walk'
	| 'sleep'
	| 'play'
	| 'training'
	| 'weight'
	| 'meds'
	| 'note';

export const CARE_TYPES: CareType[] = [
	'feeding',
	'pee',
	'poo',
	'walk',
	'sleep',
	'play',
	'training',
	'weight',
	'meds',
	'note'
];

export interface CareTypeMeta {
	label: string;
	emoji: string;
	/** Whether this type appears as a big one-tap button on the dashboard. */
	quickLog: boolean;
	/** Whether it appears as a "last X ago" card on the dashboard. */
	dashboardCard: boolean;
	/**
	 * Staleness thresholds in minutes for the dashboard card colour.
	 * Under `amber` = green, under `red` = amber, over = red.
	 * Omit for types where "staleness" is meaningless (e.g. weight, note).
	 */
	amberAfterMin?: number;
	redAfterMin?: number;
	/** Tailwind classes for the quick-log button accent. */
	accent: string;
}

export const CARE_META: Record<CareType, CareTypeMeta> = {
	feeding: {
		label: 'Fed',
		emoji: '🍚',
		quickLog: true,
		dashboardCard: true,
		amberAfterMin: 5 * 60,
		redAfterMin: 8 * 60,
		accent: 'bg-amber-500 hover:bg-amber-600'
	},
	pee: {
		label: 'Pee',
		emoji: '💧',
		quickLog: true,
		dashboardCard: true,
		amberAfterMin: 120,
		redAfterMin: 180,
		accent: 'bg-sky-500 hover:bg-sky-600'
	},
	poo: {
		label: 'Poo',
		emoji: '💩',
		quickLog: true,
		dashboardCard: true,
		amberAfterMin: 8 * 60,
		redAfterMin: 12 * 60,
		accent: 'bg-orange-700 hover:bg-orange-800'
	},
	walk: {
		label: 'Walk',
		emoji: '🐾',
		quickLog: true,
		dashboardCard: true,
		amberAfterMin: 4 * 60,
		redAfterMin: 6 * 60,
		accent: 'bg-emerald-600 hover:bg-emerald-700'
	},
	sleep: { label: 'Sleep', emoji: '😴', quickLog: false, dashboardCard: false, accent: 'bg-indigo-500' },
	play: { label: 'Play', emoji: '🎾', quickLog: false, dashboardCard: false, accent: 'bg-lime-600' },
	training: {
		label: 'Training',
		emoji: '🎓',
		quickLog: false,
		dashboardCard: false,
		accent: 'bg-purple-600'
	},
	weight: { label: 'Weight', emoji: '⚖️', quickLog: false, dashboardCard: false, accent: 'bg-slate-600' },
	meds: { label: 'Meds', emoji: '💊', quickLog: false, dashboardCard: false, accent: 'bg-rose-600' },
	note: { label: 'Note', emoji: '📝', quickLog: true, dashboardCard: false, accent: 'bg-slate-500' }
};

export function isCareType(v: unknown): v is CareType {
	return typeof v === 'string' && (CARE_TYPES as string[]).includes(v);
}
