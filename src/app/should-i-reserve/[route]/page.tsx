import { getRoutes } from '../../getRoutes'
import {
	parseISO,
} from 'date-fns'
import { getDb } from '../../getDb'
import { entries } from '@/schema'
import { gte, sql } from 'drizzle-orm'
import { Metadata } from 'next'
import { getEntriesForDow } from '../getEntriesForDow'
import Link from 'next/link'
import { getRouteBySlug, isValidRouteSlug, getAllRouteSlugs } from '../routeMapping'
import { notFound } from 'next/navigation'
import ShouldIReserveForm from '../ShouldIReserveForm'

type Props = {
	params: {
		route: string
	}
	searchParams: {
		date?: string
		sailing?: string
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const routeInfo = getRouteBySlug(params.route)
	
	if (!routeInfo) {
		return {
			title: 'Route Not Found',
		}
	}

	const title = `Should I reserve the ${routeInfo.from} to ${routeInfo.to} ferry? - BC Ferries Conditions`
	const description = `Use past sailing stats to decide whether to reserve the ${routeInfo.from} to ${routeInfo.to} ferry. See how full this route got over the past few weeks.`
	const url = `https://bcferries-conditions.tweeres.ca/should-i-reserve/${params.route}`

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

export async function generateStaticParams() {
	return getAllRouteSlugs().map((route) => ({
		route,
	}))
}

function getSailings() {
	const db = getDb()

	return db
		.selectDistinct({ time: entries.time })
		.from(entries)
		.where(gte(entries.date, sql`current_date - interval '1 week'`))
		.orderBy(entries.time)
}

export default async function ShouldIReserveRoute({ params, searchParams }: Props) {
	// Validate route
	if (!isValidRouteSlug(params.route)) {
		notFound()
	}

	const routeInfo = getRouteBySlug(params.route)
	const routesPromise = getRoutes()
	const sailingsPromise = getSailings()

	// Pre-fill route from URL, but allow override from search params
	const route = routeInfo.code
	const { date, sailing } = searchParams
	const parsedDate = date ? parseISO(date) : undefined
	const dow = parsedDate ? parsedDate.getDay() : undefined

	const dowEntriesPromise =
		dow !== undefined && sailing !== undefined
			? getEntriesForDow({ dow, route, sailing })
			: Promise.resolve(undefined)

	const [routes, sailings, dowEntries] = await Promise.all([
		routesPromise,
		sailingsPromise,
		dowEntriesPromise,
	])

	return (
		<ShouldIReserveForm
			title={`Should I reserve the ${routeInfo.from} to ${routeInfo.to} ferry?`}
			routes={routes}
			sailings={sailings}
			dowEntries={dowEntries}
			date={date}
			sailing={sailing}
			route={route}
			routeSlug={params.route}
			baseUrl={`/should-i-reserve/${params.route}`}
		/>
	)
}
