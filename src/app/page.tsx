import { getRoutes } from './getRoutes'
import { parseISO, getDay } from 'date-fns'
import { getDb } from './getDb'
import { entries } from '@/schema'
import { sql } from 'drizzle-orm'
import { Metadata } from 'next'
import { getEntriesForDow } from './should-i-reserve/getEntriesForDow'
import ShouldIReserveForm from './should-i-reserve/ShouldIReserveForm'
import { getRouteByCode } from './should-i-reserve/routeMapping'
import { formatTime } from './formatTime'
import { generateBreadcrumbSchema, generateFaqSchema } from './should-i-reserve/structuredData'
import {
	getHolidayBySlug,
	getNextOccurrence,
	getHolidayForDate,
	getHolidaySlug,
} from './holidays'
import { redirect } from 'next/navigation'
import { tz } from '@date-fns/tz'
import { inferDateFromDay, capitalizeDay } from './should-i-reserve/helpers'
import RouteDisplay from './should-i-reserve/RouteDisplay'

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

	let date = dateParam
	if (!date && day) {
		date = inferDateFromDay(day)
	}

	// If date doesn't match holiday, don't show holiday metadata
	const effectiveHolidayInfo =
		holidayInfo &&
		date &&
		getHolidaySlug(getHolidayForDate(date)?.name ?? '') !== holidaySlug
			? undefined
			: holidayInfo

	let title = 'Should I reserve the ferry? - BC Ferries Conditions Analytics'
	let description =
		'Use past sailing stats to decide whether to reserve. Enter your route, date, and sailing time and learn how full the ferry got over the past few weeks.'

	if (effectiveHolidayInfo && routeInfo) {
		title = `Should I reserve the ${sailingTime ? `${sailingTime} ` : ''}${
			routeInfo.fromShort
		} to ${routeInfo.toShort} ferry on ${effectiveHolidayInfo.name}? - BC Ferries Conditions`
		description = `Check historical capacity for the ${
			sailingTime ? `${sailingTime} ` : ''
		}sailing from ${routeInfo.from} to ${routeInfo.to} on ${
			effectiveHolidayInfo.name
		}. Use past data to decide if you need a reservation.`
	} else if (effectiveHolidayInfo) {
		title = `Should I reserve the ferry on ${effectiveHolidayInfo.name}? - BC Ferries Conditions`
		description = `Planning to travel on ${effectiveHolidayInfo.name}? See historical BC Ferries capacity and learn if you should reserve your sailing.`
	} else if (routeInfo && day && !dateParam) {
		const dayCapitalized = capitalizeDay(day)
		title = `Should I reserve the ${sailingTime ? `${sailingTime} ` : ''}${
			routeInfo.from
		} to ${routeInfo.to} ferry on ${dayCapitalized}s? - BC Ferries Conditions`
		description = `Planning a ${dayCapitalized} trip? See historical capacity for the ${
			sailingTime ? `${sailingTime} ` : ''
		}sailing from ${routeInfo.from} to ${routeInfo.to} and decide if you should reserve.`
	} else if (routeInfo) {
		title = `Should I reserve the ${sailingTime ? `${sailingTime} ` : ''}${
			routeInfo.from
		} to ${routeInfo.to} ferry? - BC Ferries Conditions`
		description = `Use past sailing stats to decide whether to reserve the ${
			sailingTime ? `${sailingTime} ` : ''
		}ferry from ${routeInfo.from} to ${
			routeInfo.to
		}. See how full this route got over the past few weeks.`
	} else if (day && !dateParam) {
		const dayCapitalized = capitalizeDay(day)
		title = `Should I reserve the ferry on ${dayCapitalized}s? - BC Ferries Conditions`
		description = `Planning to travel on a ${dayCapitalized}? See historical BC Ferries capacity and learn if you should reserve your sailing.`
	}

	const params = new URLSearchParams()
	if (route) params.set('route', route)
	if (sailing) params.set('sailing', sailing)

	if (effectiveHolidayInfo) {
		params.set('holiday', holidaySlug!)
		// If the date matches the next occurrence of this holiday, we don't need the date param in the canonical URL
		const nextDate = getNextOccurrence(effectiveHolidayInfo.name)
		if (date !== nextDate) {
			if (date) params.set('date', date)
		}
	} else if (day) {
		params.set('day', day)
		// Only set date if it was explicitly provided in searchParams to keep canonicals stable
		if (dateParam) params.set('date', dateParam)
	} else if (date) {
		params.set('date', date)
	}
	const queryString = params.toString()

	const url = `https://bcferries-conditions.tweeres.ca${
		queryString ? `?${queryString}` : ''
	}`

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

function getSailings(dow?: number) {
	const db = getDb()

	const condition =
		dow !== undefined
			? sql`extract(dow from ${entries.date}) = ${dow} AND ${entries.date} >= current_date - interval '12 weeks'`
			: sql`${entries.date} >= current_date - interval '1 week'`

	return db
		.selectDistinct({ time: entries.time })
		.from(entries)
		.where(condition)
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

	// If date and day are both provided, redirect to remove day as date is more specific
	if (dateParam && day) {
		const params = new URLSearchParams(searchParams)
		params.delete('day')
		redirect(`/?${params.toString()}`)
	}

	let date = dateParam
	if (!date && day) {
		date = inferDateFromDay(day)
	}

	const holidayInfo = holidaySlug ? getHolidayBySlug(holidaySlug) : undefined

	// If date is provided, check if it's the next occurrence of a holiday and redirect to stable URL if so
	if (date && !holidaySlug) {
		const holidayForDate = getHolidayForDate(date)
		if (holidayForDate) {
			const nextDate = getNextOccurrence(holidayForDate.name)
			if (nextDate === date) {
				const params = new URLSearchParams(searchParams)
				params.set('holiday', getHolidaySlug(holidayForDate.name))
				params.delete('date')
				redirect(`/?${params.toString()}`)
			}
		}
	}

	// If date is provided but doesn't match the holiday, redirect to remove the holiday param
	if (holidaySlug && date) {
		const holidayForDate = getHolidayForDate(date)
		if (getHolidaySlug(holidayForDate?.name ?? '') !== holidaySlug) {
			const params = new URLSearchParams(searchParams)
			params.delete('holiday')
			redirect(`/?${params.toString()}`)
		}

		// If it is the holiday and matches the next occurrence, remove the date param for stable URL
		if (holidayInfo) {
			const nextDate = getNextOccurrence(holidayInfo.name)
			if (nextDate === date) {
				const params = new URLSearchParams(searchParams)
				params.delete('date')
				redirect(`/?${params.toString()}`)
			}
		}
	}

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
	const sailingsPromise = getSailings(dow)

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

	return (
		<>
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
			<ShouldIReserveForm
				title={
					holidayInfo ? (
						<>
							Should I reserve the{' '}
							{routeInfo ? <RouteDisplay routeInfo={routeInfo} /> : 'ferry'} on{' '}
							{holidayInfo.name}?
						</>
					) : routeInfo && day ? (
						<>
							Should I reserve the <RouteDisplay routeInfo={routeInfo} /> ferry
							on {capitalizeDay(day)}s?
						</>
					) : routeInfo ? (
						<>
							Should I reserve the <RouteDisplay routeInfo={routeInfo} /> ferry?
						</>
					) : day ? (
						<>
							Should I reserve the ferry on {capitalizeDay(day)}s?
						</>
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
		</>
	)
}
