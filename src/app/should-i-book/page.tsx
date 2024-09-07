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
} from 'date-fns'
import { getDb } from '../getDb'
import { entries } from '@/schema'
import { gte, sql } from 'drizzle-orm'
import SelectSailing from './SelectSailing'
import { formatTime } from '../formatTime'
import { Metadata } from 'next'
import { selectValue } from '../selectValue'
import { getEntriesForDow } from './getEntriesForDow'

export async function generateMetadata(): Promise<Metadata> {
	const title = 'Should I book the ferry? - BC Ferries Conditions Analytics'
	const description =
		'Use past sailing capacities to decide whether to book. Enter your route, date, and sailing time and learn how full the ferry got over the past few weeks.'
	const url = 'https://bcferries-conditions.tweeres.ca/should-i-book'

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
			images: 'https://bcferries-conditions.tweeres.ca/should-i-book-og.png',
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

export default async function ShouldIBook({ searchParams }: Props) {
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
		<div className="container mx-auto prose prose-lg px-1 py-2 should-i-book">
			<h1>Should I book the ferry?</h1>
			<ol>
				<li>
					<label htmlFor="route">What route?</label>
					<SelectRoute
						routes={routes}
						selectRoute={selectValue('/should-i-book', 'route')}
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
						selectDate={selectValue('/should-i-book', 'date')}
					/>
				</li>

				<li>
					<label htmlFor="sailing">What sailing?</label>
					<SelectSailing
						sailings={sailings}
						selectSailing={selectValue('/should-i-book', 'sailing')}
					/>
					<p className="text-sm">
						To do: make sure sailing actually occurs on that day?
					</p>
				</li>
				{route && date && sailing && dow ? (
					<>
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
									{dowEntries.map((de) => (
										<li key={de.date}>
											<div>
												{format(de.date, 'E MMM d, yyyy')} -{' '}
												{de.full ? (
													<>Full at {format(de.full, 'h:mm a')}</>
												) : (
													<>Didn&apos;t fill up</>
												)}
											</div>
										</li>
									))}
								</ul>
							) : null}
						</li>
						<p className="text-sm">To do:</p>
						<ul className="text-sm">
							<li>give recommendation to book or not</li>
							<li>account for long weekends</li>
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
