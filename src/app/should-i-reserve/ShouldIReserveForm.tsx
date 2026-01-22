'use client'

import SelectDate from '../SelectDate'
import SelectSailing from './SelectSailing'
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
import { useRouter } from 'next/navigation'
import { getRouteBySlug, getSlugByRouteCode, type RouteSlug } from './routeMapping'

type Props = {
	routes: { route: string }[]
	sailings: { time: string }[]
	dowEntries?: {
		date: string
		full: Date | null
	}[]
	date?: string
	sailing?: string
	route: string
	routeSlug?: RouteSlug
	baseUrl: string
}

const routeLabels = {
	'SWB-TSA': 'Swartz Bay to Tsawwassen',
	'TSA-SWB': 'Tsawwassen to Swartz Bay',
}

export default function ShouldIReserveForm({
	routes,
	sailings,
	dowEntries,
	date,
	sailing,
	route,
	routeSlug,
	baseUrl,
}: Props) {
	const router = useRouter()
	const parsedDate = date ? new Date(date) : undefined
	const dow = parsedDate ? parsedDate.getDay() : undefined
	const holiday = date ? getHolidayForDate(date) : undefined

	const handleRouteChange = (newRoute: string) => {
		// If on a route-specific page, navigate to the matching route page
		if (routeSlug) {
			const newRouteSlug = getSlugByRouteCode(newRoute)

			if (newRouteSlug) {
				router.push(`/should-i-reserve/${newRouteSlug}`)
			}
		} else {
			// On generic page, update query param
			const params = new URLSearchParams()
			if (newRoute) params.set('route', newRoute)
			if (date) params.set('date', date)
			if (sailing) params.set('sailing', sailing)
			router.push(`${baseUrl}?${params.toString()}`)
		}
	}

	const handleDateChange = (newDate: string) => {
		const params = new URLSearchParams()
		if (route) params.set('route', route)
		if (newDate) params.set('date', newDate)
		if (sailing) params.set('sailing', sailing)
		router.push(`${baseUrl}?${params.toString()}`)
	}

	const handleSailingChange = (newSailing: string) => {
		const params = new URLSearchParams()
		if (route) params.set('route', route)
		if (date) params.set('date', date)
		if (newSailing) params.set('sailing', newSailing)
		router.push(`${baseUrl}?${params.toString()}`)
	}

	return (
		<ol>
			<li>
				<label htmlFor="route">
					{routeSlug ? `Route: ${getRouteBySlug(routeSlug)?.from} to ${getRouteBySlug(routeSlug)?.to}` : 'What route?'}
				</label>
				<select
					onChange={(e) => handleRouteChange(e.target.value)}
					value={route}
					id="route"
				>
					<option value="">Select a route</option>
					{(routes as { route: keyof typeof routeLabels }[]).map((d) => (
						<option key={d.route} value={d.route}>
							{routeLabels[d.route]}
						</option>
					))}
				</select>
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
					selectDate={async (_, newDate) => handleDateChange(newDate)}
				/>
			</li>

			<li>
				<label htmlFor="sailing">What sailing?</label>
				<SelectSailing
					sailings={sailings}
					selectSailing={async (_, newSailing) => handleSailingChange(newSailing)}
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
	)
}
