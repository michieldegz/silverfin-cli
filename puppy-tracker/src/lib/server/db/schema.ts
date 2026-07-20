import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

// All timestamps are Unix epoch SECONDS stored as integers, in UTC.
// Rendered in the household timezone on the client / with TZ server-side.

export const dogs = sqliteTable('dogs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	breed: text('breed'),
	sex: text('sex'), // 'M' | 'F'
	birthDate: integer('birth_date'), // epoch seconds (approx ok)
	adoptionDate: integer('adoption_date'),
	photoPath: text('photo_path'),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(unixepoch())`)
});

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	pinHash: text('pin_hash').notNull(),
	color: text('color').notNull().default('#0d9488'),
	isActive: integer('is_active').notNull().default(1),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(unixepoch())`)
});

export const careLog = sqliteTable(
	'care_log',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		dogId: integer('dog_id').notNull(),
		userId: integer('user_id'), // who logged it (nullable for imports)
		type: text('type').notNull(),
		occurredAt: integer('occurred_at')
			.notNull()
			.default(sql`(unixepoch())`),
		amount: real('amount'), // food grams, weight kg, water ml
		durationMin: integer('duration_min'), // walk/sleep/play length
		rating: integer('rating'), // optional 1-5
		notes: text('notes'),
		detail: text('detail'), // JSON string for type-specific extras
		createdAt: integer('created_at')
			.notNull()
			.default(sql`(unixepoch())`)
	},
	(t) => [
		index('idx_care_dog_type_time').on(t.dogId, t.type, t.occurredAt),
		index('idx_care_dog_time').on(t.dogId, t.occurredAt)
	]
);

export const healthEvents = sqliteTable('health_events', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	dogId: integer('dog_id').notNull(),
	category: text('category').notNull(), // vaccination|deworming|flea_tick|vet_appt|weight_check
	title: text('title').notNull(),
	dueDate: integer('due_date'), // epoch seconds
	completedAt: integer('completed_at'), // null until done
	vetName: text('vet_name'),
	notes: text('notes'),
	createdAt: integer('created_at')
		.notNull()
		.default(sql`(unixepoch())`)
});

export const appSettings = sqliteTable('app_settings', {
	key: text('key').primaryKey(),
	value: text('value')
});

export type Dog = typeof dogs.$inferSelect;
export type User = typeof users.$inferSelect;
export type CareLogRow = typeof careLog.$inferSelect;
export type HealthEvent = typeof healthEvents.$inferSelect;
