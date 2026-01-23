import SelectDate from '../SelectDate'
import SelectSailing from './SelectSailing'
import SelectRoute from '../SelectRoute'
import { formatTime } from '../formatTime'
import {
	formatISO,
	eachDayOfInterval,
	addMonths,
	format,
	previousDay,
	Day,
	getDay,
} from 'date-fns'
import { getHolidayForDate } from '../holidays'
import { TZDate } from '@date-fns/tz'
import { redirect } from 'next/navigation'
import { getRouteBySlug, getSlugByRouteCode, type RouteSlug } from './routeMapping'
import { selectValue } from '../selectValue'
import Link from 'next/link'
import { ReactNode } from 'react'

type Props = {
	title: ReactNode
	routes: { route: string }[]
	sailings: { time: string }[]
	dowEntries?: {
		date: string
		full: string | Date | null
	}[]
	date?: string
	sailing?: string
	route: string
	routeSlug?: RouteSlug
	baseUrl: string
}

export default function ShouldIReserveForm({
	title,
	routes,
	sailings,
	dowEntries,
	date,
	sailing,
	route,
	routeSlug,
	baseUrl,
}: Props) {
	const parsedDate = date ? new Date(date) : undefined
	const dow = parsedDate ? parsedDate.getDay() : undefined
	const holiday = date ? getHolidayForDate(date) : undefined

	return (
		<div className="container mx-auto prose sm:prose-lg px-1 py-2 should-i-reserve">
			<div className="flex items-center gap-3">
				<h1 className="grow">{title}</h1>
				<Link href="/" className="text-center">
					History
				</Link>
			</div>
			<ol>
				<li>
					<label htmlFor="route">
						{routeSlug
							? `Route: ${getRouteBySlug(routeSlug)?.from} to ${
									getRouteBySlug(routeSlug)?.to
							  }`
							: 'What route?'}
					</label>
					<SelectRoute
						selectRoute={
							routeSlug
								? async (searchParams, newRoute) => {
										'use server'
										const newRouteSlug = getSlugByRouteCode(newRoute)
										const params = new URLSearchParams(searchParams)
										if (newRouteSlug) {
											redirect(
												`/should-i-reserve/${newRouteSlug}?${params.toString()}`
											)
										} else {
											params.set('route', newRoute)
											redirect(`/should-i-reserve?${params.toString()}`)
										}
								  }
								: selectValue(baseUrl, 'route')
						}
						routes={routes}
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
						selectDate={selectValue(baseUrl, 'date')}
					/>
				</li>

				<li>
					<label htmlFor="sailing">What sailing?</label>
					<SelectSailing
						sailings={sailings}
						selectSailing={selectValue(baseUrl, 'sailing')}
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
