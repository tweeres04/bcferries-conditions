import Link from 'next/link'
import { formatTime } from '../formatTime'
import { getDailySummary } from './getDailySummary'
import { isRouteCollectingData } from './routeMapping'
import ColumnInfoButton from './ColumnInfoButton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type Props = {
	dow: number
	route: string
	date?: string
	baseUrl?: string
	day?: string
}

const MIN_DATA_POINTS = 4

export default async function DailySummaryTable({
	dow,
	route,
	date,
	baseUrl,
	day,
}: Props) {
	// Check if we're still collecting data for this route (need 6+ weeks)
	if (isRouteCollectingData(route)) {
		return (
			<div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
				<p className="text-sm">
					We just started tracking this route. Check back in a few weeks for
					sailing stats.
				</p>
			</div>
		)
	}

	const dailySummary = await getDailySummary({ dow, route })

	if (!dailySummary || dailySummary.length === 0) {
		return (
			<div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
				<p className="text-sm">
					We just started tracking this route. Check back in a few weeks for
					sailing stats.
				</p>
			</div>
		)
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Sailing</TableHead>
						<TableHead className="text-right flex items-center justify-end">
							<div>
								Full <br className="sm:hidden" /> sailings
							</div>
							<ColumnInfoButton column="full-percent" />
						</TableHead>
						<TableHead>
							Risk
							<ColumnInfoButton column="risk" />
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{dailySummary.map((summary) => {
						const total = Number(summary.total)
						const fullCount = Number(summary.full_count)
						const percent = total > 0 ? (fullCount / total) * 100 : 0

						const isInsufficientData = total < MIN_DATA_POINTS

						let risk = 'Low'
						let badgeVariant:
							| 'default'
							| 'secondary'
							| 'destructive'
							| 'outline' = 'default'

						if (isInsufficientData) {
							risk = 'Not enough data'
							badgeVariant = 'outline'
						} else if (percent > 50) {
							risk = 'High'
							badgeVariant = 'destructive'
						} else if (percent > 20) {
							risk = 'Moderate'
							badgeVariant = 'secondary'
						}

						const sailingParams = new URLSearchParams()
						if (route) sailingParams.set('route', route)
						if (date) sailingParams.set('date', date)
						if (day) sailingParams.set('day', day)
						sailingParams.set('sailing', summary.time)

						const hasLink = !!baseUrl

						return (
							<TableRow key={summary.time} className="space-x-3">
								<TableCell className="font-medium">
									{hasLink ? (
										<Link
											href={`${baseUrl}?${sailingParams.toString()}`}
											className="content-link"
										>
											{formatTime(summary.time)}
										</Link>
									) : (
										formatTime(summary.time)
									)}
								</TableCell>
								<TableCell className="text-right">
									{Math.round(percent)}%
									<span className="text-xs text-muted-foreground ml-1 sm:inline">
										({fullCount}/{total})
									</span>
								</TableCell>
								<TableCell>
									<Badge variant={badgeVariant}>{risk}</Badge>
								</TableCell>
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
		</div>
	)
}
