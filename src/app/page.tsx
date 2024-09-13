import { Metadata } from 'next'
import { and, eq, inArray } from 'drizzle-orm'
import { entries } from '@/schema'
import { formatISO, subHours } from 'date-fns'

import { getDb } from './getDb'
import Chart from './Chart'
import SelectDate from './SelectDate'
import SelectRoute from './SelectRoute'
import { getRoutes } from './getRoutes'
import { selectValue } from './selectValue'
import Link from 'next/link'

const title =
	'BC Ferries Conditions Analytics - Plan your ferry ride stress-free'
const description =
	"Historical data and analytics tools for BC Ferries' vehicle deck space capacity."
const url = 'https://bcferries-conditions.tweeres.ca'

export const metadata: Metadata = {
	title,
	description,
	alternates: {
		canonical: url,
	},
	openGraph: {
		title,
		description,
		url,
		type: 'website',
		images: 'https://bcferries-conditions.tweeres.ca/og.png',
	},
}

type Props = {
	searchParams: {
		date?: string
		route?: string
		sailings?: string | string[]
	}
}

export default async function Home({ searchParams }: Props) {
	const db = getDb()

	let { date, route, sailings: sailingsParam } = searchParams

	// Find a better approach than -7 offset
	date = date ?? formatISO(subHours(new Date(), 7), { representation: 'date' })
	route = route ?? 'SWB-TSA'
	const sailings = sailingsParam ? [sailingsParam].flat() : undefined

	const datesPromise = db
		.selectDistinct({ date: entries.date })
		.from(entries)
		.orderBy(entries.date)

	const routesPromise = getRoutes()

	const resultsPromise = db.query.entries.findMany({
		where: and(
			eq(entries.date, date),
			eq(entries.route, route),
			sailings ? inArray(entries.time, sailings) : undefined
		),
		orderBy: entries.timestamp,
	})

	const [dates, results, routes] = await Promise.all([
		datesPromise,
		resultsPromise,
		routesPromise,
	])

	return (
		<div className="container mx-auto">
			<div className="flex items-center gap-3">
				<h1 className="text-2xl grow">bc ferries conditions</h1>
				<Link href="/should-i-reserve" className="text-center">
					Should I reserve?
				</Link>
			</div>
			<div className="py-1">
				<SelectRoute
					selectRoute={selectValue('/', 'route')}
					routes={routes}
					defaultValue="SWB-TSA"
				/>
				<SelectDate
					selectDate={selectValue('/', 'date')}
					dates={dates}
					defaultValue={formatISO(subHours(new Date(), 7), {
						representation: 'date',
					})}
				/>
			</div>
			<Chart entries={results} />
			<footer className="text-center py-32">
				<p>
					By{' '}
					<a href="https://tweeres.ca" title="Tyler Weeres">
						Tyler Weeres
					</a>
				</p>
				<p>
					Ferry boat icons created by{' '}
					<a
						href="https://www.flaticon.com/free-icons/ferry-boat"
						title="ferry boat icons"
					>
						Freepik - Flaticon
					</a>
				</p>
			</footer>
		</div>
	)
}
