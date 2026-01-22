import { getRoutes } from '../getRoutes'
import {
	parseISO,
} from 'date-fns'
import { getDb } from '../getDb'
import { entries } from '@/schema'
import { gte, sql } from 'drizzle-orm'
import { Metadata } from 'next'
import { getEntriesForDow } from './getEntriesForDow'
import Link from 'next/link'
import ShouldIReserveForm from './ShouldIReserveForm'

export async function generateMetadata(): Promise<Metadata> {
	const title = 'Should I reserve the ferry? - BC Ferries Conditions Analytics'
	const description =
		'Use past sailing stats to decide whether to reserve. Enter your route, date, and sailing time and learn how full the ferry got over the past few weeks.'
	const url = 'https://bcferries-conditions.tweeres.ca/should-i-reserve'

	return {
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
			images: 'https://bcferries-conditions.tweeres.ca/should-i-reserve-og.png',
		},
	}
}

function getSailings() {
	const db = getDb()

	return db
		.selectDistinct({ time: entries.time })
		.from(entries)
		.where(gte(entries.date, sql`current_date - interval '1 week'`))
		.orderBy(entries.time)
}

type Props = {
	searchParams: {
		date?: string
		route?: string
		sailing?: string
	}
}

export default async function ShouldIReserve({ searchParams }: Props) {
	const routesPromise = getRoutes()
	const sailingsPromise = getSailings()

	const { date, route, sailing } = searchParams
	const parsedDate = date ? parseISO(date) : undefined // new Date() assumes it's gmt time
	const dow = parsedDate ? parsedDate.getDay() : undefined

	const dowEntriesPromise =
		dow !== undefined && route !== undefined && sailing !== undefined
			? getEntriesForDow({ dow, route, sailing })
			: Promise.resolve()

	const [routes, sailings, dowEntries] = await Promise.all([
		routesPromise,
		sailingsPromise,
		dowEntriesPromise,
	])

	return (
		<div className="container mx-auto prose sm:prose-lg px-1 py-2 should-i-reserve">
			<div className="flex items-center gap-3">
				<h1 className="grow">Should I reserve the ferry?</h1>
				<Link href="/" className="text-center">
					History
				</Link>
			</div>
			<ShouldIReserveForm
				routes={routes}
				sailings={sailings}
				dowEntries={dowEntries}
				date={date}
				sailing={sailing}
				route={route || ''}
				baseUrl="/should-i-reserve"
			/>
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
