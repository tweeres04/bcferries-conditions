import { sql } from 'drizzle-orm'
import { getDb } from '../getDb'

type Args = { dow: number; route: string; sailing: string }

export function getEntriesForDow({ dow, route, sailing }: Args) {
	const db = getDb()

	const sqlQuery = sql`WITH most_recent_weekday AS (
	select days
	from generate_series(
		current_date - interval '1 day',
		current_date - interval '1 day' - interval '1 week',
		- interval '1 day'
	) days
	where extract(dow from days) = ${dow}
	limit 1
)
	
SELECT
	date."date" date, -- date-fns interprets this properly as local time
	(
		select
			timestamp at time zone 'Z' at time zone 'America/Vancouver' -- these are moments in time and we need to tell js/node that it's local time
		from
			entries
		where
			date = date.date
			and route = ${route}
			and time = ${sailing}
			and "full"
		limit
			1
	) as full
FROM
	generate_series(
		(select * from most_recent_weekday),
		current_date - interval '1 week' * 6,
		-interval '1 week'
	) as "date"`

	return db.execute<{ date: string; full: string }>(sqlQuery)
}
