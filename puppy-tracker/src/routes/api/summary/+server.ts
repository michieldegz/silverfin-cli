import { error, json } from '@sveltejs/kit';
import { and, count, eq, gte, max, sum } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { careLog } from '$lib/server/db/schema';
import { getActiveDog } from '$lib/server/dog';
import { startOfLocalDaySec } from '$lib/time';
import type { RequestHandler } from './$types';

export interface SummaryPayload {
	lastByType: Record<string, number>;
	today: Record<string, { count: number; amount: number | null; duration: number | null }>;
	generatedAt: number;
}

/** Dashboard payload: last occurrence per type + today's aggregates. */
export const GET: RequestHandler = ({ locals }) => {
	if (!locals.user) throw error(401, 'Not signed in');
	const dog = getActiveDog();
	if (!dog) return json({ lastByType: {}, today: {}, generatedAt: 0 } satisfies SummaryPayload);

	const lastRows = db
		.select({ type: careLog.type, last: max(careLog.occurredAt) })
		.from(careLog)
		.where(eq(careLog.dogId, dog.id))
		.groupBy(careLog.type)
		.all();

	const startOfDay = startOfLocalDaySec();
	const todayRows = db
		.select({
			type: careLog.type,
			c: count(),
			amount: sum(careLog.amount),
			duration: sum(careLog.durationMin)
		})
		.from(careLog)
		.where(and(eq(careLog.dogId, dog.id), gte(careLog.occurredAt, startOfDay)))
		.groupBy(careLog.type)
		.all();

	const lastByType: Record<string, number> = {};
	for (const r of lastRows) if (r.last != null) lastByType[r.type] = r.last;

	const today: SummaryPayload['today'] = {};
	for (const r of todayRows) {
		today[r.type] = {
			count: r.c,
			amount: r.amount != null ? Number(r.amount) : null,
			duration: r.duration != null ? Number(r.duration) : null
		};
	}

	return json({
		lastByType,
		today,
		generatedAt: Math.floor(Date.now() / 1000)
	} satisfies SummaryPayload);
};
