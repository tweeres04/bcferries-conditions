import { and, eq } from 'drizzle-orm'
import { entries } from '@/schema'
import { formatISO, subHours } from 'date-fns'

import { getDB } from './getDb'
import Chart from './Chart'
import { redirect } from 'next/navigation'
import SelectDate from './SelectDate'
import SelectRoute from './SelectRoute'

type Props = {
	searchParams: {
		date?: string
		route?: string
	}
}

export default async function Home({ searchParams }: Props) {
	const db = getDB()

	let { date, route } = searchParams

	async function selectDate(newDate: string) {
		'use server'

		const newSearchParams = {
			date: newDate,
			...(route ? { route } : {}),
		}

		const newUrl = newSearchParams
			? `/?${new URLSearchParams(newSearchParams)}`
			: '/'

		redirect(newUrl)
	}

	async function selectRoute(newRoute: string) {
		'use server'

		const newSearchParams = {
			route: newRoute,
			...(date ? { date } : {}),
		}

		const newUrl = newSearchParams
			? `/?${new URLSearchParams(newSearchParams)}`
			: '/'

		redirect(newUrl)
	}

	// Find a better approach than -7 offset
	date = date ?? formatISO(subHours(new Date(), 7), { representation: 'date' })
	route = route ?? 'SWB-TSA'

	const datesPromise = db
		.selectDistinct({ date: entries.date })
		.from(entries)
		.orderBy(entries.date)

	const routesPromise = db
		.selectDistinct({ route: entries.route })
		.from(entries)
		.orderBy(entries.route)

	const resultsPromise = db.query.entries.findMany({
		where: and(eq(entries.date, date), eq(entries.route, route)),
		orderBy: entries.timestamp,
	})

	const [dates, results, routes] = await Promise.all([
		datesPromise,
		resultsPromise,
		routesPromise,
	])

	return (
		<div className="container mx-auto">
			<h1 className="text-2xl">bc ferries conditions</h1>
			<div className="space-x-1">
				<SelectRoute selectRoute={selectRoute} routes={routes} route={route} />
				<SelectDate selectDate={selectDate} dates={dates} date={date} />
			</div>
			<Chart entries={results} />
		</div>
	)
}
