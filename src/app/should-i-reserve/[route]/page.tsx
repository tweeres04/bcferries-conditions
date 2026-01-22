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

	const title = `Should I reserve the ${routeInfo.fromShort} to ${routeInfo.toShort} ferry? - BC Ferries Conditions`
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
			: Promise.resolve()

	const [routes, sailings, dowEntries] = await Promise.all([
		routesPromise,
		sailingsPromise,
		dowEntriesPromise,
	])

	return (
		<div className="container mx-auto prose sm:prose-lg px-1 py-2 should-i-reserve">
			<div className="flex items-center gap-3">
				<h1 className="grow">Should I reserve the {routeInfo.fromShort} to {routeInfo.toShort} ferry?</h1>
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
				route={route}
				routeSlug={params.route}
				baseUrl={`/should-i-reserve/${params.route}`}
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
