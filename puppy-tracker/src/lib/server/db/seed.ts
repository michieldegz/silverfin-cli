import { and, eq, isNull } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { hashPin } from '../auth';
import { db } from './index';
import { dogs, healthEvents, users } from './schema';

const DAY = 86_400;
const WEEK = 7 * DAY;

function nowSec(): number {
	return Math.floor(Date.now() / 1000);
}

/**
 * Build a standard EU puppy vaccination / deworming / parasite schedule
 * relative to the dog's birth date. Idempotent for the schedule categories:
 * it clears any *incomplete* generated events first, so it can be re-run when
 * the birth date is corrected without wiping completed history.
 */
export function regenerateHealthSchedule(dogId: number, birthDateSec: number): void {
	const at = (weeks: number) => birthDateSec + Math.round(weeks * WEEK);

	const generated: {
		category: string;
		title: string;
		dueDate: number;
	}[] = [
		{ category: 'vaccination', title: 'DHPP — 1st dose', dueDate: at(6) },
		{ category: 'vaccination', title: 'DHPP — 2nd dose', dueDate: at(9) },
		{ category: 'vaccination', title: 'DHPP — 3rd dose', dueDate: at(12) },
		{ category: 'vaccination', title: 'DHPP — booster', dueDate: at(16) },
		{ category: 'vaccination', title: 'Rabies', dueDate: at(12) },
		{ category: 'vaccination', title: 'Leptospirosis (L4) — 1st', dueDate: at(9) },
		{ category: 'vaccination', title: 'Leptospirosis (L4) — 2nd', dueDate: at(12) },
		// Deworming: every 2 weeks until 12 weeks, then monthly.
		...[2, 4, 6, 8, 10, 12].map((w) => ({
			category: 'deworming',
			title: `Deworming — week ${w}`,
			dueDate: at(w)
		})),
		...[16, 20, 24].map((w) => ({
			category: 'deworming',
			title: `Deworming — month ${Math.round(w / 4)}`,
			dueDate: at(w)
		})),
		{ category: 'flea_tick', title: 'Flea & tick — start', dueDate: at(8) },
		{ category: 'vet_appt', title: 'First vet checkup', dueDate: at(8) }
	];

	// Clear previously generated but not-yet-completed events for these categories.
	for (const cat of ['vaccination', 'deworming', 'flea_tick', 'vet_appt']) {
		db.delete(healthEvents)
			.where(
				and(
					eq(healthEvents.dogId, dogId),
					eq(healthEvents.category, cat),
					isNull(healthEvents.completedAt)
				)
			)
			.run();
	}

	const createdAt = nowSec();
	for (const e of generated) {
		db.insert(healthEvents)
			.values({ dogId, category: e.category, title: e.title, dueDate: e.dueDate, createdAt })
			.run();
	}
}

/**
 * Seed initial data on first run only (when there are no users yet):
 * two household members with a shared default PIN and a placeholder dog whose
 * birth date is estimated at ~8 weeks ago (typical bring-home age). Both are
 * editable in-app afterwards.
 */
export function seedIfEmpty(): void {
	const existing = db.select({ id: users.id }).from(users).limit(1).all();
	if (existing.length > 0) return;

	const pin = env.SEED_PIN || '1234';
	const pinHash = hashPin(pin);
	const createdAt = nowSec();

	db.insert(users).values({ name: 'Me', pinHash, color: '#0d9488', createdAt }).run();
	db.insert(users).values({ name: 'Partner', pinHash, color: '#7c3aed', createdAt }).run();

	const estimatedBirth = nowSec() - 8 * WEEK;
	const res = db
		.insert(dogs)
		.values({ name: 'Puppy', birthDate: estimatedBirth, createdAt })
		.run();
	const dogId = Number(res.lastInsertRowid);

	regenerateHealthSchedule(dogId, estimatedBirth);
}
