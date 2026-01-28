import Link from 'next/link'
import { formatTime } from '../formatTime'
import { getDailySummary } from './getDailySummary'
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
}

const MIN_DATA_POINTS = 4

export default async function DailySummaryTable({
	dow,
	route,
	date,
	baseUrl,
}: Props) {
	const dailySummary = await getDailySummary({ dow, route })

	if (!dailySummary || dailySummary.length === 0) {
		return null
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Sailing</TableHead>
						<TableHead className="text-right">
							Full %
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
						sailingParams.set('sailing', summary.time)

						const hasLink = !!baseUrl

						return (
							<TableRow key={summary.time}>
								<TableCell className="font-medium">
									{hasLink ? (
										<Link
											href={`${baseUrl}?${sailingParams.toString()}`}
											className="text-blue-600 hover:underline"
										>
											{formatTime(summary.time)}
										</Link>
									) : (
										formatTime(summary.time)
									)}
								</TableCell>
								<TableCell className="text-right">
									{Math.round(percent)}%
									<span className="text-xs text-muted-foreground ml-1 hidden sm:inline">
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
