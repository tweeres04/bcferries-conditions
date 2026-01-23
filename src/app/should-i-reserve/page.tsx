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
			: Promise.resolve(undefined)

	const [routes, sailings, dowEntries] = await Promise.all([
		routesPromise,
		sailingsPromise,
		dowEntriesPromise,
	])

	return (
		<ShouldIReserveForm
			title="Should I reserve the ferry?"
			routes={routes}
			sailings={sailings}
			dowEntries={dowEntries}
			date={date}
			sailing={sailing}
			route={route || ''}
			baseUrl="/should-i-reserve"
		/>
	)
}
