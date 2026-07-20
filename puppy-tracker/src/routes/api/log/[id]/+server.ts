import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { careLog } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) throw error(401, 'Not signed in');
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Bad id');

	const existing = db.select().from(careLog).where(eq(careLog.id, id)).get();
	if (!existing) throw error(404, 'Not found');

	const body = await request.json().catch(() => ({}));
	const patch: Record<string, unknown> = {};
	if (typeof body.occurredAt === 'number') patch.occurredAt = Math.round(body.occurredAt);
	if ('amount' in body) patch.amount = typeof body.amount === 'number' ? body.amount : null;
	if ('durationMin' in body)
		patch.durationMin = typeof body.durationMin === 'number' ? Math.round(body.durationMin) : null;
	if ('rating' in body) patch.rating = typeof body.rating === 'number' ? Math.round(body.rating) : null;
	if ('notes' in body) patch.notes = typeof body.notes === 'string' ? body.notes.trim() || null : null;

	if (Object.keys(patch).length === 0) return json({ ok: true, unchanged: true });

	db.update(careLog).set(patch).where(eq(careLog.id, id)).run();
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Not signed in');
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(400, 'Bad id');
	db.delete(careLog).where(eq(careLog.id, id)).run();
	return json({ ok: true });
};
