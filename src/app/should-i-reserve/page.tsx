import { getRoutes } from '../getRoutes'
import SelectRoute from '../SelectRoute'
import SelectDate from '../SelectDate'
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
import { getDb } from '../getDb'
import { entries } from '@/schema'
import { gte, sql } from 'drizzle-orm'
import SelectSailing from './SelectSailing'
import { formatTime } from '../formatTime'
import { Metadata } from 'next'
import { selectValue } from '../selectValue'
import { getEntriesForDow } from './getEntriesForDow'
import { getHolidayForDate } from '../holidays'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
	const title = 'Should I reserve the ferry? - BC Ferries Conditions Analytics'
	const description =
		'Enter your route, date, and sailing time and learn how full the ferry got over the past few weeks. Use past sailing info to decide whether to reserve.'
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

	const holiday = date ? getHolidayForDate(date) : undefined

	return (
		<div className="container mx-auto prose prose-lg px-1 py-2 should-i-reserve">
			<div className="flex">
				<h1 className="grow">Should I reserve the ferry?</h1>
				<Link href="/">History</Link>
			</div>
			<ol>
				<li>
					<label htmlFor="route">What route?</label>
					<SelectRoute
						routes={routes}
						selectRoute={selectValue('/should-i-reserve', 'route')}
					/>
				</li>
				<li>
					<label htmlFor="date">What date?</label>
					<SelectDate
						dates={eachDayOfInterval({
							start: new Date(),
							end: addMonths(new Date(), 3),
						}).map((s) => ({
							date: formatISO(s, {
								representation: 'date',
							}),
						}))}
						selectDate={selectValue('/should-i-reserve', 'date')}
					/>
				</li>

				<li>
					<label htmlFor="sailing">What sailing?</label>
					<SelectSailing
						sailings={sailings}
						selectSailing={selectValue('/should-i-reserve', 'sailing')}
					/>
				</li>
				{route && date && sailing && dow !== undefined ? (
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
								Last {format(previousDay(new Date(), dow as Day), 'EEEE')} the{' '}
								{formatTime(sailing)} ferry:
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
