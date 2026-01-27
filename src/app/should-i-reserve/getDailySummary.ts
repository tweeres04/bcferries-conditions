import { sql } from 'drizzle-orm'
import { getDb } from '../getDb'

type Args = { dow: number; route: string }

export function getDailySummary({ dow, route }: Args) {
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
),
dates AS (
	select date::date as date
	from generate_series(
		(select * from most_recent_weekday),
		current_date - interval '1 week' * 12,
		-interval '1 week'
	) as date
),
daily_status AS (
	SELECT
		e.date,
		e.time,
		bool_or(e.full) as was_full
	FROM
		dates d
	JOIN
		entries e ON e.date = d.date
	WHERE
		e.route = ${route}
	GROUP BY
		e.date, e.time
)
SELECT
	ds.time,
	count(*) as total,
	count(case when ds.was_full then 1 end) as full_count
FROM
	daily_status ds
GROUP BY
	ds.time
ORDER BY
	ds.time`

	return db.execute<{ time: string; total: string; full_count: string }>(sqlQuery)
}
