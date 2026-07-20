import { asc } from 'drizzle-orm';
import { db } from './db';
import { dogs, type Dog } from './db/schema';

/** The app is single-dog for the MVP: return the first (oldest) dog row. */
export function getActiveDog(): Dog | undefined {
	return db.select().from(dogs).orderBy(asc(dogs.id)).limit(1).get();
}
