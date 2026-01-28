import { and, eq, inArray } from 'drizzle-orm'
import { entries } from '@/schema'
import { getDb } from '../getDb'
import Chart from '../Chart'

type Props = {
	date: string
	route: string
	sailings?: string[]
}

export default async function HistoryChartWithData({
	date,
	route,
	sailings,
}: Props) {
	const db = getDb()

	const results = await db.query.entries.findMany({
		where: and(
			eq(entries.date, date),
			eq(entries.route, route),
			sailings ? inArray(entries.time, sailings) : undefined,
		),
		orderBy: entries.timestamp,
	})

	return <Chart entries={results} />
}
