import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { careLog } from '$lib/server/db/schema';
import { getActiveDog } from '$lib/server/dog';
import { isCareType } from '$lib/careTypes';
import type { RequestHandler } from './$types';

interface LogBody {
	type?: string;
	occurredAt?: number;
	amount?: number | null;
	durationMin?: number | null;
	rating?: number | null;
	notes?: string | null;
	detail?: unknown;
}

/** Create a care-log entry. Called by quick-log buttons (and later the offline queue). */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Not signed in');

	let body: LogBody;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON');
	}

	if (!isCareType(body.type)) throw error(400, 'Unknown care type');

	const dog = getActiveDog();
	if (!dog) throw error(400, 'No dog configured');

	const nowSec = Math.floor(Date.now() / 1000);
	const occurredAt =
		typeof body.occurredAt === 'number' && Number.isFinite(body.occurredAt)
			? Math.round(body.occurredAt)
			: nowSec;

	const res = db
		.insert(careLog)
		.values({
			dogId: dog.id,
			userId: locals.user.id,
			type: body.type,
			occurredAt,
			amount: numOrNull(body.amount),
			durationMin: intOrNull(body.durationMin),
			rating: intOrNull(body.rating),
			notes: strOrNull(body.notes),
			detail: body.detail == null ? null : JSON.stringify(body.detail),
			createdAt: nowSec
		})
		.run();

	return json({ id: Number(res.lastInsertRowid), occurredAt }, { status: 201 });
};

function numOrNull(v: unknown): number | null {
	return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
function intOrNull(v: unknown): number | null {
	return typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : null;
}
function strOrNull(v: unknown): string | null {
	return typeof v === 'string' && v.trim() ? v.trim() : null;
}
