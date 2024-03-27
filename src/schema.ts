import {
	serial,
	text,
	timestamp,
	pgTable,
	time,
	numeric,
	boolean,
	date,
} from 'drizzle-orm/pg-core'

export const entries = pgTable('entries', {
	id: serial('id').primaryKey(),
	route: text('route').notNull(),
	date: date('date').defaultNow().notNull(),
	time: time('time').notNull(),
	vessel: text('vessel').notNull(),
	overallPercent: numeric('overall_percent'),
	vehiclePercent: numeric('vehicle_percent'),
	truckPercent: numeric('truck_percent'),
	full: boolean('full'),
	eta: time('eta'),
	departure: time('departure'),
	timestamp: timestamp('timestamp').defaultNow(),
})

export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert
