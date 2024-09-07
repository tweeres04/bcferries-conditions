import {
	serial,
	text,
	timestamp,
	pgTable,
	time,
	numeric,
	boolean,
	date,
	index,
} from 'drizzle-orm/pg-core'

export const entries = pgTable(
	'entries',
	{
		id: serial('id').primaryKey(),
		route: text('route').notNull().default('SWB-TSA'),
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
	},
	(table) => {
		return {
			entries_idx: index('entries_idx').on(table.date, table.time, table.route),
		}
	}
)

export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert
