import { getRoutes } from '../getRoutes'
import { parseISO } from 'date-fns'
import { getDb } from '../getDb'
import { entries } from '@/schema'
import { gte, sql } from 'drizzle-orm'
import { Metadata } from 'next'
import { getEntriesForDow } from './getEntriesForDow'
import ShouldIReserveForm from './ShouldIReserveForm'
import { getRouteByCode } from './routeMapping'
import { getHolidayBySlug, getNextOccurrence } from '../holidays'
import { redirect } from 'next/navigation'

type Props = {
	searchParams: {
		date?: string
		route?: string
		sailing?: string
		holiday?: string
	}
}

export async function generateMetadata({
	searchParams,
}: Props): Promise<Metadata> {
	const { route, holiday: holidaySlug } = searchParams
	const routeInfo = route ? getRouteByCode(route) : undefined
	const holidayInfo = holidaySlug ? getHolidayBySlug(holidaySlug) : undefined

	let title = 'Should I reserve the ferry? - BC Ferries Conditions Analytics'
	let description =
		'Use past sailing stats to decide whether to reserve. Enter your route, date, and sailing time and learn how full the ferry got over the past few weeks.'

	if (holidayInfo && routeInfo) {
		title = `BC Ferries ${holidayInfo.name} Capacity & Trends: ${routeInfo.from} to ${routeInfo.to}`
		description = `See how busy the ${routeInfo.from} to ${routeInfo.to} ferry gets on ${holidayInfo.name}. View historical data and decide whether to reserve.`
	} else if (holidayInfo) {
		title = `BC Ferries ${holidayInfo.name} Capacity & Travel Trends`
		description = `Planning to travel on ${holidayInfo.name}? See historical BC Ferries capacity and learn if you should reserve your sailing.`
	} else if (routeInfo) {
		title = `Should I reserve the ${routeInfo.from} to ${routeInfo.to} ferry? - BC Ferries Conditions`
		description = `Use past sailing stats to decide whether to reserve the ${routeInfo.from} to ${routeInfo.to} ferry. See how full this route got over the past few weeks.`
	}

	const params = new URLSearchParams()
	if (route) params.set('route', route)
	if (holidaySlug) params.set('holiday', holidaySlug)
	const queryString = params.toString()

	const url = `https://bcferries-conditions.tweeres.ca/should-i-reserve${
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

function getSailings() {
	const db = getDb()

	return db
		.selectDistinct({ time: entries.time })
		.from(entries)
		.where(gte(entries.date, sql`current_date - interval '1 week'`))
		.orderBy(entries.time)
}

export default async function ShouldIReserve({ searchParams }: Props) {
	const { holiday: holidaySlug, route, sailing, date } = searchParams

	const holidayInfo = holidaySlug ? getHolidayBySlug(holidaySlug) : undefined

	// If a holiday is selected but no date is provided, redirect to the next occurrence
	if (holidayInfo && !date) {
		const nextDate = getNextOccurrence(holidayInfo.name)
		if (nextDate) {
			const params = new URLSearchParams(searchParams)
			params.set('date', nextDate)
			redirect(`/should-i-reserve?${params.toString()}`)
		}
	}

	const routesPromise = getRoutes()
	const sailingsPromise = getSailings()

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

	const routeInfo = route ? getRouteByCode(route) : undefined

	return (
		<ShouldIReserveForm
			title={
				holidayInfo ? (
					<>
						Should I reserve the{' '}
						{routeInfo ? (
							<>
								<span className="sm:hidden">
									{routeInfo.fromShort} to {routeInfo.toShort}
								</span>
								<span className="hidden sm:inline">
									{routeInfo.from} to {routeInfo.to}
								</span>
							</>
						) : (
							'ferry'
						)}{' '}
						on {holidayInfo.name}?
					</>
				) : routeInfo ? (
					<>
						Should I reserve the{' '}
						<span className="sm:hidden">
							{routeInfo.fromShort} to {routeInfo.toShort}
						</span>
						<span className="hidden sm:inline">
							{routeInfo.from} to {routeInfo.to}
						</span>{' '}
						ferry?
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
			baseUrl="/should-i-reserve"
		/>
	)
}
