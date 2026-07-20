import { redirect, type Handle } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { seedIfEmpty } from '$lib/server/db/seed';
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from '$lib/server/auth';

// Bootstrap: seed the database once at server startup. Safe to call repeatedly
// (no-ops when users already exist).
try {
	seedIfEmpty();
} catch (err) {
	console.error('[bootstrap] seed failed:', err);
}

const PUBLIC_PATHS = ['/login', '/api/health'];

function loadUser(uid: number): SessionUser | null {
	const row = db
		.select({ id: users.id, name: users.name, color: users.color, isActive: users.isActive })
		.from(users)
		.where(eq(users.id, uid))
		.get();
	if (!row || !row.isActive) return null;
	return { id: row.id, name: row.name, color: row.color };
}

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	const uid = verifySessionToken(token);
	event.locals.user = uid ? loadUser(uid) : null;

	const path = event.url.pathname;
	const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));

	if (!event.locals.user && !isPublic) {
		throw redirect(303, `/login?next=${encodeURIComponent(path)}`);
	}
	if (event.locals.user && path === '/login') {
		throw redirect(303, '/');
	}

	return resolve(event);
};
