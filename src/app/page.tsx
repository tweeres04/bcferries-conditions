import { getRoutes } from './getRoutes'
import { parseISO, getDay } from 'date-fns'
import { getDb } from './getDb'
import { entries } from '@/schema'
import { sql } from 'drizzle-orm'
import { Metadata } from 'next'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { getEntriesForDow } from './should-i-reserve/getEntriesForDow'
import ShouldIReserveForm from './should-i-reserve/ShouldIReserveForm'
import { getRouteByCode } from './should-i-reserve/routeMapping'
import { formatTime } from './formatTime'
import {
	generateBreadcrumbSchema,
	generateFaqSchema,
} from './should-i-reserve/structuredData'
import {
	getHolidayBySlug,
	getNextOccurrence,
	getHolidayForDate,
	getHolidaySlug,
	getUniqueHolidays,
} from './holidays'
import { redirect } from 'next/navigation'
import { tz } from '@date-fns/tz'
import { capitalizeDay } from './should-i-reserve/helpers'
import { resolveRedirect, resolveDate } from './resolveRedirect'
import RouteDisplay from './should-i-reserve/RouteDisplay'
import BrowseBusiestTimesCTA from './busiest-ferry-times/BrowseBusiestTimesCTA'
import Footer from '@/components/Footer'
import { buildCanonicalUrl } from './buildCanonicalUrl'

type Props = {
	searchParams: {
		date?: string
		route?: string
		sailing?: string
		holiday?: string
		day?: string
	}
}

export async function generateMetadata({
	searchParams,
}: Props): Promise<Metadata> {
	const {
		route,
		holiday: holidaySlug,
		date: dateParam,
		day,
		sailing,
	} = searchParams
	const routeInfo = route ? getRouteByCode(route) : undefined
	const holidayInfo = holidaySlug ? getHolidayBySlug(holidaySlug) : undefined
	const sailingTime = sailing ? formatTime(sailing) : undefined

	const date = resolveDate(searchParams)

	// If date doesn't match holiday, don't show holiday metadata
	const effectiveHolidayInfo =
		holidayInfo &&
		date &&
		getHolidaySlug(getHolidayForDate(date)?.name ?? '') !== holidaySlug
			? undefined
			: holidayInfo

	let title = 'Should I reserve the BC ferry? - BC Ferries Conditions Analytics'
	let description =
		'Check how often your sailing fills up before deciding to reserve. Covers all major BC Ferries routes, updated every 15 minutes.'

	if (effectiveHolidayInfo && routeInfo) {
		title = `Should I reserve the ${sailingTime ? `${sailingTime} ` : ''}${
			routeInfo.fromShort
		} to ${routeInfo.toShort} ferry on ${effectiveHolidayInfo.name}? - BC Ferries Conditions Analytics`
		description = `Check historical capacity for the ${
			sailingTime ? `${sailingTime} ` : ''
		}sailing from ${routeInfo.from} to ${routeInfo.to} on ${
			effectiveHolidayInfo.name
		}. Use past data to decide if you need a reservation.`
	} else if (effectiveHolidayInfo) {
		title = `Should I reserve the ferry on ${effectiveHolidayInfo.name}? - BC Ferries Conditions Analytics`
		description = `Planning to travel on ${effectiveHolidayInfo.name}? See historical BC Ferries capacity and learn if you should reserve your sailing.`
	} else if (routeInfo && day && !dateParam) {
		const dayCapitalized = capitalizeDay(day)
		title = `Should I reserve the ${sailingTime ? `${sailingTime} ` : ''}${
			routeInfo.from
		} to ${routeInfo.to} ferry on ${dayCapitalized}s? - BC Ferries Conditions Analytics`
		description = `Planning a ${dayCapitalized} trip? See historical capacity for the ${
			sailingTime ? `${sailingTime} ` : ''
		}sailing from ${routeInfo.from} to ${routeInfo.to} and decide if you should reserve.`
	} else if (routeInfo) {
		title = `Should I reserve the ${sailingTime ? `${sailingTime} ` : ''}${
			routeInfo.from
		} to ${routeInfo.to} ferry? - BC Ferries Conditions Analytics`
		description = `See how often the ${
			sailingTime ? `${sailingTime} ` : ''
		}${routeInfo.fromShort} to ${routeInfo.toShort} ferry fills up, so you know whether to reserve or just show up.`
	} else if (day && !dateParam) {
		const dayCapitalized = capitalizeDay(day)
		title = `Should I reserve the ferry on ${dayCapitalized}s? - BC Ferries Conditions Analytics`
		description = `Planning to travel on a ${dayCapitalized}? See historical BC Ferries capacity and learn if you should reserve your sailing.`
	}

	const canonicalUrl = buildCanonicalUrl({
		route,
		sailing,
		holidaySlug,
		holidayInfo: effectiveHolidayInfo,
		day,
		date,
		dateParam,
	})

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url: canonicalUrl,
			type: 'website',
			images: 'https://bcferries-conditions.tweeres.ca/should-i-reserve-og.png',
		},
	}
}

function getSailings(dow?: number, route?: string) {
	const db = getDb()

	const conditions = []

	// Date/dow filter
	if (dow !== undefined) {
		conditions.push(
			sql`extract(dow from ${entries.date}) = ${dow} AND ${entries.date} >= current_date - interval '12 weeks'`
		)
	} else {
		conditions.push(sql`${entries.date} >= current_date - interval '1 week'`)
	}

	// Route filter
	if (route) {
		conditions.push(sql`${entries.route} = ${route}`)
	}

	return db
		.selectDistinct({ time: entries.time })
		.from(entries)
		.where(sql`${sql.join(conditions, sql` AND `)}`)
		.orderBy(entries.time)
}

export default async function Home({ searchParams }: Props) {
	const {
		holiday: holidaySlug,
		route,
		sailing,
		date: dateParam,
		day,
	} = searchParams

	const redirectUrl = resolveRedirect(searchParams)
	if (redirectUrl) redirect(redirectUrl)

	let date = resolveDate(searchParams)

	const holidayInfo = holidaySlug ? getHolidayBySlug(holidaySlug) : undefined

	if (holidayInfo && !date) {
		const nextDate = getNextOccurrence(holidayInfo.name)
		if (nextDate) {
			date = nextDate
		}
	}

	const parsedDate = date
		? parseISO(date, { in: tz('America/Vancouver') })
		: undefined
	const dow = parsedDate
		? getDay(parsedDate, { in: tz('America/Vancouver') })
		: undefined

	const routesPromise = getRoutes()
	const sailingsPromise = getSailings(dow, route)

	const dowEntriesPromise =
		dow !== undefined && route !== undefined && sailing !== undefined
			? getEntriesForDow({ dow, route, sailing })
			: Promise.resolve(undefined)

	const [routes, sailings, dowEntries] = await Promise.all([
		routesPromise,
		sailingsPromise,
		dowEntriesPromise,
	])

	const routeInfo = route ? getRouteByCode(route) : undefined

	const breadcrumbList = generateBreadcrumbSchema({
		route,
		routeInfo,
		day,
		sailing,
	})

	const faqPage = generateFaqSchema({
		routeInfo,
		sailing,
		day,
		holidayName: holidayInfo?.name,
	})

	const canonicalUrl = buildCanonicalUrl({
		route,
		sailing,
		holidaySlug,
		holidayInfo,
		day,
		date,
		dateParam,
	})

	return (
		<>
			{/*
			 * Next.js has a bug where alternates.canonical strips query params when
			 * the pathname is "/" (it returns result.origin instead of result.href).
			 * See: node_modules/next/dist/lib/metadata/resolvers/resolve-url.js
			 * Rendering the canonical tag manually bypasses this bug entirely.
			 */}
			<link rel="canonical" href={canonicalUrl} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
			/>
			{faqPage && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
				/>
			)}
			<div className="container mx-auto max-w-2xl space-y-20 px-2 py-4">
				<ShouldIReserveForm
					title={
						holidayInfo ? (
							<>
								Should I reserve the{' '}
								{routeInfo ? <RouteDisplay routeInfo={routeInfo} /> : 'ferry'}{' '}
								on {holidayInfo.name}?
							</>
						) : routeInfo && day ? (
							<>
								Should I reserve the <RouteDisplay routeInfo={routeInfo} />{' '}
								ferry on {capitalizeDay(day)}s?
							</>
						) : routeInfo ? (
							<>
								Should I reserve the <RouteDisplay routeInfo={routeInfo} />{' '}
								ferry?
							</>
						) : day ? (
							<>Should I reserve the ferry on {capitalizeDay(day)}s?</>
						) : (
							'Should I reserve the ferry?'
						)
					}
					routes={routes}
					sailings={sailings}
					dowEntries={dowEntries}
					date={date}
					sailing={sailing}
					route={route || ''}
					baseUrl="/"
					dow={dow}
				/>
				<BrowseBusiestTimesCTA />

				<div className="text-sm text-gray-600">
					New to BC Ferries?{' '}
					<Link href="/articles" className="content-link">
						Read our travel guides →
					</Link>
				</div>

				<div className="text-sm text-gray-600">
					Finding this useful?{' '}
					<a
						href={process.env.NEXT_PUBLIC_STRIPE_DONATION_URL}
						className="content-link"
						target="_blank"
						rel="noopener"
					>
						Support the project{' '}
						{/* Lucide icons are display: block by default */}
						<Heart size={14} fill="currentColor" className="inline" />
					</a>
				</div>

				{holidayInfo && (
					<div className="max-w-2xl mx-auto">
						<div className="text-sm text-gray-600">
							<span className="text-gray-500">Other holidays:</span>{' '}
							{getUniqueHolidays()
								.filter((h) => h.slug !== holidaySlug)
								.map((holiday, index, arr) => (
									<span key={holiday.slug}>
										<Link
											href={`/?holiday=${holiday.slug}`}
											className="content-link"
										>
											{holiday.name}
										</Link>
										{index < arr.length - 1 && ' | '}
									</span>
								))}
						</div>
					</div>
				)}

				<Footer />
			</div>
		</>
	)
}
