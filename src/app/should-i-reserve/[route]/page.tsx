import { getRoutes } from '../../getRoutes'
import SelectRoute from '../../SelectRoute'
import SelectDate from '../../SelectDate'
import {
	formatISO,
	eachDayOfInterval,
	addMonths,
	format,
	previousDay,
	Day,
	parseISO,
	getDay,
} from 'date-fns'
import { getDb } from '../../getDb'
import { entries } from '@/schema'
import { gte, sql } from 'drizzle-orm'
import SelectSailing from '../SelectSailing'
import { formatTime } from '../../formatTime'
import { Metadata } from 'next'
import { selectValue } from '../../selectValue'
import { getEntriesForDow } from '../getEntriesForDow'
import { getHolidayForDate } from '../../holidays'
import Link from 'next/link'
import { TZDate } from '@date-fns/tz'
import { getRouteBySlug, isValidRouteSlug, getAllRouteSlugs } from '../routeMapping'
import { notFound } from 'next/navigation'

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

	const holiday = date ? getHolidayForDate(date) : undefined

	return (
		<div className="container mx-auto prose sm:prose-lg px-1 py-2 should-i-reserve">
			<div className="flex items-center gap-3">
				<h1 className="grow">Should I reserve the {routeInfo.fromShort} to {routeInfo.toShort} ferry?</h1>
				<Link href="/" className="text-center">
					History
				</Link>
			</div>
			<ol>
				<li>
					<label htmlFor="route">Route: {routeInfo.from} to {routeInfo.to}</label>
					<SelectRoute
						routes={routes}
						selectRoute={selectValue(`/should-i-reserve/${params.route}`, 'route')}
						defaultValue={route}
					/>
				</li>
				<li>
					<label htmlFor="date">What date?</label>
					<SelectDate
						dates={eachDayOfInterval({
							start: TZDate.tz('America/Vancouver'),
							end: addMonths(TZDate.tz('America/Vancouver'), 3),
						}).map((s) => ({
							date: formatISO(s, {
								representation: 'date',
							}),
						}))}
						selectDate={selectValue(`/should-i-reserve/${params.route}`, 'date')}
					/>
				</li>

				<li>
					<label htmlFor="sailing">What sailing?</label>
					<SelectSailing
						sailings={sailings}
						selectSailing={selectValue(`/should-i-reserve/${params.route}`, 'sailing')}
					/>
				</li>
				{date && sailing && dow !== undefined ? (
					<>
						{holiday ? (
							<li>
								<label>
									{format(date, 'E MMM d, yyyy')} is on a long weekend
								</label>
								<ul>
									<li>
										{holiday.name} on{' '}
										{format(holiday.observedDate, 'E MMM d, yyyy')}
									</li>
									<li>
										The ferries are typically much busier on long weekends
									</li>
								</ul>
							</li>
						) : null}
						<li>
							<label>
								Last{' '}
								{format(
									previousDay(TZDate.tz('America/Vancouver'), dow as Day),
									'EEEE'
								)}{' '}
								the {formatTime(sailing)} ferry:
							</label>
							{dowEntries ? (
								<ul>
									<li>
										{dowEntries[0].full ? (
											<>Filled at {format(dowEntries[0].full, 'h:mm a')}</>
										) : (
											<>Didn&apos;t fill up</>
										)}
									</li>
								</ul>
							) : null}
						</li>
						<li>
							<label>Here&apos;s what happened in the last six weeks:</label>
							{dowEntries ? (
								<ul>
									{dowEntries.map((de) => {
										const holiday = getHolidayForDate(de.date)
										const linkParams = new URLSearchParams({
											route: route,
											date: de.date.slice(0, 10),
											sailings: sailing,
										})
										return (
											<li
												key={de.date}
												className={
													holiday
														? ' text-blue-950 marker:text-blue-200'
														: undefined
												}
											>
												<a href={`/?${linkParams}`} target="_blank">
													{format(de.date, 'E MMM d, yyyy')}
												</a>{' '}
												-{' '}
												{de.full ? (
													<>Full at {format(de.full, 'h:mm a')}</>
												) : (
													<>Didn&apos;t fill up</>
												)}{' '}
												{holiday ? (
													<span
														className="text-sm bg-blue-100 px-2 py-1 rounded-sm whitespace-nowrap"
														title={`${holiday.name} on ${format(
															holiday.observedDate,
															'E MMM d, yyyy'
														)}`}
													>
														{getDay(de.date) === 3 ? 'Holiday' : 'Long weekend'}
													</span>
												) : null}
											</li>
										)
									})}
								</ul>
							) : null}
						</li>
						<li>
							<label>When you&apos;re ready, make your reservation:</label>
							<ul>
								<li>
									BC Ferries&apos;{' '}
									<a href="https://www.bcferries.com/RouteSelectionPage">
										reservation page
									</a>
								</li>
							</ul>
						</li>
						<p className="text-sm">To do:</p>
						<ul className="text-sm">
							<li>give recommendation to reserve or not</li>
						</ul>
					</>
				) : null}
			</ol>
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
