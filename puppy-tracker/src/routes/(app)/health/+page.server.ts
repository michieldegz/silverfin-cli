import { fail } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { healthEvents } from '$lib/server/db/schema';
import { getActiveDog } from '$lib/server/dog';
import { nowSec } from '$lib/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const dog = getActiveDog();
	if (!dog) return { events: [] };
	const events = db
		.select()
		.from(healthEvents)
		.where(eq(healthEvents.dogId, dog.id))
		.orderBy(asc(healthEvents.dueDate))
		.all();
	return { events };
};

export const actions: Actions = {
	toggle: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400);
		const row = db.select().from(healthEvents).where(eq(healthEvents.id, id)).get();
		if (!row) return fail(404);
		db.update(healthEvents)
			.set({ completedAt: row.completedAt ? null : nowSec() })
			.where(eq(healthEvents.id, id))
			.run();
		return { ok: true };
	},

	add: async ({ request }) => {
		const dog = getActiveDog();
		if (!dog) return fail(400, { error: 'No dog configured' });
		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const category = String(form.get('category') ?? 'vet_appt');
		const dueStr = String(form.get('dueDate') ?? '');
		if (!title) return fail(400, { error: 'Title is required' });
		const dueMs = dueStr ? Date.parse(dueStr) : NaN;
		db.insert(healthEvents)
			.values({
				dogId: dog.id,
				category,
				title,
				dueDate: Number.isNaN(dueMs) ? null : Math.floor(dueMs / 1000),
				createdAt: nowSec()
			})
			.run();
		return { ok: true };
	},

	remove: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400);
		db.delete(healthEvents).where(and(eq(healthEvents.id, id))).run();
		return { ok: true };
	}
};
