import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { tz } from '@date-fns/tz'
import { formatTime } from '../formatTime'
import { getDailySummary } from './getDailySummary'
import ColumnInfoButton from './ColumnInfoButton'

type Props = {
	dow: number
	route: string
	date?: string
	baseUrl: string
}

const MIN_DATA_POINTS = 4

export default async function DailySummaryTable({
	dow,
	route,
	date,
	baseUrl,
}: Props) {
	const dailySummary = await getDailySummary({ dow, route })
	const parsedDate = date
		? parseISO(date, { in: tz('America/Vancouver') })
		: undefined

	if (!dailySummary || dailySummary.length === 0) {
		return null
	}

	return (
		<div className="mt-8 not-prose">
			<label className="font-bold">
				Typical {format(parsedDate || new Date(), 'EEEE')} sailings over the
				past 12 weeks:
			</label>
			<div className="overflow-x-auto mt-3">
				<table className="min-w-full text-sm sm:text-base border-collapse [&_td]:p-3 [&_th]:p-3">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="text-left">Sailing</th>
							<th className="text-right">
								Full %
								<ColumnInfoButton column="full-percent" />
							</th>
							<th className="text-left">
								Risk
								<ColumnInfoButton column="risk" />
							</th>
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
								risk = 'Not enough data'
								riskClass = 'text-gray-400'
							} else if (percent > 50) {
								risk = 'High'
								riskClass = 'text-red-600'
							} else if (percent > 20) {
								risk = 'Moderate'
								riskClass = 'text-orange-600'
							}

							const sailingParams = new URLSearchParams()
							if (route) sailingParams.set('route', route)
							if (date) sailingParams.set('date', date)
							sailingParams.set('sailing', summary.time)

							return (
								<tr
									key={summary.time}
									className="border-b border-gray-100 hover:bg-gray-50 transition-colors relative group"
								>
									<td>
										<Link
											href={`${baseUrl}?${sailingParams.toString()}`}
											className="no-underline group-hover:underline font-medium text-blue-600 after:absolute after:inset-0"
										>
											{formatTime(summary.time)}
										</Link>
									</td>
									<td className="text-right">
										{Math.round(percent)}%
										<span className="text-xs text-gray-400 ml-1">
											({fullCount}/{total})
										</span>
									</td>
									<td className={`font-semibold ${riskClass}`}>{risk}</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}
