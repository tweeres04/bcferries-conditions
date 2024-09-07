import { gte, sql } from 'drizzle-orm'
import { getDb } from './getDb'
import { entries } from '@/schema'

export function getRoutes() {
	const db = getDb()
	return db
		.selectDistinct({ route: entries.route })
		.from(entries)
		.where(gte(entries.date, sql`current_date - interval '1 week'`))
		.orderBy(entries.route)
}
