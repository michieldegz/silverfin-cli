import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import {
	createSessionToken,
	SESSION_COOKIE,
	SESSION_MAX_AGE,
	verifyPin
} from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const members = db
		.select({ id: users.id, name: users.name, color: users.color })
		.from(users)
		.where(eq(users.isActive, 1))
		.all();
	return { members };
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const userId = Number(form.get('userId'));
		const pin = String(form.get('pin') ?? '');
		const next = String(form.get('next') ?? '/') || '/';

		if (!userId || !pin) {
			return fail(400, { error: 'Pick your name and enter your PIN.', userId: userId || null });
		}

		const user = db.select().from(users).where(eq(users.id, userId)).get();
		if (!user || !user.isActive || !verifyPin(pin, user.pinHash)) {
			return fail(401, { error: 'Wrong PIN. Try again.', userId });
		}

		cookies.set(SESSION_COOKIE, createSessionToken(user.id), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: SESSION_MAX_AGE
		});

		// Only allow local redirects.
		const dest = next.startsWith('/') && !next.startsWith('//') ? next : '/';
		throw redirect(303, dest);
	}
};
