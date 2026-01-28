import SelectDate from '../SelectDate'
import SelectSailing from './SelectSailing'
import SelectRoute from '../SelectRoute'
import { formatTime } from '../formatTime'
import FeedbackDialog from './FeedbackDialog'
import Footer from '@/components/Footer'
import {
	formatISO,
	eachDayOfInterval,
	addMonths,
	format,
	previousDay,
	Day,
	getDay,
	parseISO,
} from 'date-fns'
import { getHolidayForDate } from '../holidays'
import { TZDate, tz } from '@date-fns/tz'
import { selectValue } from '../selectValue'
import { ReactNode, Suspense } from 'react'
import DailySummaryTable from './DailySummaryTable'
import DailySummaryTableSkeleton from './DailySummaryTableSkeleton'

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
	baseUrl: string
	dow?: number
}

export default function ShouldIReserveForm({
	title,
	routes,
	sailings,
	dowEntries,
	date,
	sailing,
	route,
	baseUrl,
	dow: dowProp,
}: Props) {
	const parsedDate = date
		? parseISO(date, { in: tz('America/Vancouver') })
		: undefined
	const dow =
		dowProp ??
		(parsedDate
			? getDay(parsedDate, { in: tz('America/Vancouver') })
			: undefined)
	const holiday = date ? getHolidayForDate(date) : undefined

	return (
		<div className="container mx-auto prose sm:prose-lg px-2 py-4 should-i-reserve">
			<h1 className="text-2xl sm:text-4xl mb-4 sm:mb-6">{title}</h1>
			<ol className="pl-6 sm:pl-8">
				<li>
					<label htmlFor="route">What route?</label>
					<SelectRoute
						selectRoute={selectValue(baseUrl, 'route')}
						routes={routes}
						defaultValue={route}
					/>
				</li>
				<li>
					<label htmlFor="date">What date?</label>
					<SelectDate
						dates={eachDayOfInterval({
							start: TZDate.tz('America/Vancouver'),
							end: addMonths(TZDate.tz('America/Vancouver'), 6),
						}).map((s) => ({
							date: formatISO(s, {
								representation: 'date',
							}),
						}))}
						selectDate={selectValue(baseUrl, 'date')}
						defaultValue={date}
					/>
				</li>

				<li>
					<label htmlFor="sailing">What sailing?</label>
					<SelectSailing
						sailings={sailings}
						selectSailing={selectValue(baseUrl, 'sailing')}
						defaultValue={sailing}
					/>
					{dow !== undefined && route && !sailing ? (
						<div className="mt-8 not-prose">
							<label className="font-bold">
								Typical {format(parsedDate || new Date(), 'EEEE')} sailings over
								the past 12 weeks:
							</label>
							<div className="mt-3">
								<Suspense
									key={`${dow}-${route}-${date}`}
									fallback={<DailySummaryTableSkeleton />}
								>
									<DailySummaryTable
										dow={dow}
										route={route}
										date={date}
										baseUrl={baseUrl}
									/>
								</Suspense>
							</div>
						</div>
					) : null}
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
									'EEEE',
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
												<a href={`/history?${linkParams}`} target="_blank">
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
															'E MMM d, yyyy',
														)}`}
													>
														{getDay(de.date, {
															in: tz('America/Vancouver'),
														}) === 3
															? 'Holiday'
															: 'Long weekend'}
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
						<li>
							<label>Have feedback or suggestions?</label>
							<ul>
								<li>
									<FeedbackDialog />
								</li>
							</ul>
						</li>
					</>
				) : null}
			</ol>
			<Footer />
		</div>
	)
}
