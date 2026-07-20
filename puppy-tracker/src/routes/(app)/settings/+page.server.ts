import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { hashPin, SESSION_COOKIE } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const members = db
		.select({ id: users.id, name: users.name, color: users.color })
		.from(users)
		.where(eq(users.isActive, 1))
		.all();
	return { user: locals.user, members };
};

export const actions: Actions = {
	changePin: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const form = await request.formData();
		const pin = String(form.get('pin') ?? '');
		const confirm = String(form.get('confirm') ?? '');
		if (pin.length < 4) return fail(400, { error: 'PIN must be at least 4 digits.' });
		if (pin !== confirm) return fail(400, { error: 'PINs do not match.' });
		db.update(users).set({ pinHash: hashPin(pin) }).where(eq(users.id, locals.user.id)).run();
		return { ok: true };
	},

	rename: async ({ request, locals }) => {
		if (!locals.user) return fail(401);
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'Name is required.' });
		db.update(users).set({ name }).where(eq(users.id, locals.user.id)).run();
		return { ok: true };
	},

	logout: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE, { path: '/' });
		throw redirect(303, '/login');
	}
};
