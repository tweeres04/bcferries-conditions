import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRouteBySlug } from '../../../should-i-reserve/routeMapping'
import { getDailySummary } from '../../../should-i-reserve/getDailySummary'
import { formatTime } from '../../../formatTime'
import { capitalizeDay } from '../../../should-i-reserve/helpers'

type Props = {
	params: {
		route: string
		day: string
	}
}

const VALID_DAYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
]

const DAY_TO_DOW: Record<string, number> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
}

const MIN_DATA_POINTS = 4

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { route, day } = params
	const routeInfo = getRouteBySlug(route)

	if (!routeInfo || !VALID_DAYS.includes(day.toLowerCase())) {
		return {}
	}

	const dayCapitalized = capitalizeDay(day)
	const title = `Busiest Ferry Times: ${routeInfo.fromShort} to ${routeInfo.toShort} on ${dayCapitalized}s - BC Ferries Conditions`
	const description = `See which ${routeInfo.fromShort} to ${routeInfo.toShort} ferry sailings fill up most often on ${dayCapitalized}s, based on 12 weeks of historical data.`

	return {
		title,
		description,
		openGraph: {
			title,
			description,
		},
	}
}

export default async function BusiestFerryTimesPage({ params }: Props) {
	const { route, day } = params
	const routeInfo = getRouteBySlug(route)
	const dow = DAY_TO_DOW[day.toLowerCase()]

	if (!routeInfo || dow === undefined || !VALID_DAYS.includes(day.toLowerCase())) {
		notFound()
	}

	const dailySummary = await getDailySummary({ dow, route: routeInfo.code })

	if (!dailySummary || dailySummary.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-4">
					Busiest Ferry Times: {routeInfo.fromShort} to {routeInfo.toShort} on{' '}
					{capitalizeDay(day)}s
				</h1>
				<p>No data available for this route and day combination.</p>
			</div>
		)
	}

	const dayCapitalized = capitalizeDay(day)

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<nav className="text-sm text-gray-600 mb-4">
				<Link href="/" className="hover:underline">
					Home
				</Link>
				{' / '}
				<Link href="/busiest-ferry-times" className="hover:underline">
					Busiest Ferry Times
				</Link>
				{' / '}
				<span>
					{routeInfo.fromShort} to {routeInfo.toShort}
				</span>
				{' / '}
				<span>{dayCapitalized}</span>
			</nav>

			<h1 className="text-3xl font-bold mb-4">
				Busiest Ferry Times: {routeInfo.fromShort} to {routeInfo.toShort} on{' '}
				{dayCapitalized}s
			</h1>

			<div className="prose max-w-none mb-8">
				<p>
					Based on 12 weeks of historical data, here are the sailings most
					likely to fill up on {dayCapitalized}s. The &ldquo;Full %&rdquo; shows
					how often each sailing filled up, and the risk level indicates whether
					you should consider making a reservation.
				</p>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full text-sm sm:text-base border-collapse">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="text-left py-2 px-1">Sailing</th>
							<th className="text-right py-2 px-1">Full %</th>
							<th className="text-left py-2 px-1">Risk</th>
						</tr>
					</thead>
					<tbody>
						{dailySummary.map((summary) => {
							const total = Number(summary.total)
							const fullCount = Number(summary.full_count)
							const percent = total > 0 ? (fullCount / total) * 100 : 0

							const isInsufficientData = total < MIN_DATA_POINTS

							let risk = 'Low'
							let riskClass = 'text-green-600'

							if (isInsufficientData) {
								risk = 'Insufficient data'
								riskClass = 'text-gray-400'
							} else if (percent > 50) {
								risk = 'High'
								riskClass = 'text-red-600'
							} else if (percent > 20) {
								risk = 'Moderate'
								riskClass = 'text-orange-600'
							}

							return (
								<tr
									key={summary.time}
									className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
								>
									<td className="py-3 px-1 font-medium">
										{formatTime(summary.time)}
									</td>
									<td className="py-3 px-1 text-right">
										{Math.round(percent)}%
										<span className="text-xs text-gray-400 ml-1 hidden sm:inline">
											({fullCount}/{total})
										</span>
									</td>
									<td className={`py-3 px-1 font-semibold ${riskClass}`}>
										{risk}
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			<div className="mt-8 p-4 bg-blue-50 rounded-lg">
				<h2 className="text-lg font-semibold mb-2">
					Want to check a specific date?
				</h2>
				<p className="text-sm text-gray-700 mb-3">
					Use our interactive tool to see historical data for a specific sailing
					and date.
				</p>
				<Link
					href={`/should-i-reserve?route=${routeInfo.code}&day=${day.toLowerCase()}`}
					className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
				>
					View Interactive Tool →
				</Link>
			</div>
		</div>
	)
}
