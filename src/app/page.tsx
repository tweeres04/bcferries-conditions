import { and, eq } from 'drizzle-orm'
import { entries } from '@/schema'
import { formatISO, subHours } from 'date-fns'

import { getDB } from './getDb'
import Chart from './Chart'
import { redirect } from 'next/navigation'
import SelectDate from './SelectDate'

async function selectDate(newDate: string) {
	'use server'

	redirect(`/?date=${newDate}`)
}

type Props = {
	searchParams: {
		date?: string
	}
}

export default async function Home({ searchParams: { date } }: Props) {
	const db = getDB()

	// Find a better approach than -7 offset
	date = date ?? formatISO(subHours(new Date(), 7), { representation: 'date' })

	const datesPromise = db
		.selectDistinct({ date: entries.date })
		.from(entries)
		.orderBy(entries.date)

	const resultsPromise = db.query.entries.findMany({
		where: eq(entries.date, date),
		orderBy: entries.timestamp,
	})

	const [dates, results] = await Promise.all([datesPromise, resultsPromise])

	return (
		<div className="container mx-auto">
			<h1 className="text-2xl">bc ferries conditions</h1>
			<SelectDate selectDate={selectDate} dates={dates} date={date} />
			<Chart entries={results} />
		</div>
	)
}
