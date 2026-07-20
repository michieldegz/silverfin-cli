import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { careLog, users } from '$lib/server/db/schema';
import { getActiveDog } from '$lib/server/dog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const dog = getActiveDog();
	if (!dog) return { entries: [] };

	const rows = db
		.select({
			id: careLog.id,
			type: careLog.type,
			occurredAt: careLog.occurredAt,
			amount: careLog.amount,
			durationMin: careLog.durationMin,
			rating: careLog.rating,
			notes: careLog.notes,
			userName: users.name,
			userColor: users.color
		})
		.from(careLog)
		.leftJoin(users, eq(careLog.userId, users.id))
		.where(eq(careLog.dogId, dog.id))
		.orderBy(desc(careLog.occurredAt))
		.limit(150)
		.all();

	return { entries: rows };
};
