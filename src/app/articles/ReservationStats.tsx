import { Suspense } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { getReservationStats } from './getReservationStats'
import type { SailingStat } from './getReservationStats'

function riskBadgeVariant(
	risk: SailingStat['risk']
): 'default' | 'secondary' | 'destructive' | 'outline' {
	if (risk === 'High') return 'destructive'
	if (risk === 'Moderate') return 'secondary'
	if (risk === 'Not enough data') return 'outline'
	return 'default'
}

async function ReservationStatsContent() {
	const stats = await getReservationStats()

	if (stats.length === 0) return null

	return (
		<div className="not-prose space-y-8 my-8">
			{stats.map((route) => (
				<div key={route.code}>
					<h3 className="font-semibold text-base mb-3">
						{route.fromShort} to {route.toShort}{' '}
						<span className="font-normal text-muted-foreground">(busy times only)</span>
					</h3>
					{route.sailings.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No sailings filled up frequently on Fridays in the past 12 weeks.
						</p>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Sailing</TableHead>
										<TableHead className="text-right">Full sailings</TableHead>
										<TableHead>Risk</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{route.sailings.map((s) => (
										<TableRow key={s.time}>
											<TableCell className="font-medium">
												{s.timeFormatted}
											</TableCell>
											<TableCell className="text-right">
												{s.fillRate}%{' '}
												<span className="text-xs text-muted-foreground">
													({s.fullCount}/{s.total})
												</span>
											</TableCell>
											<TableCell>
												<Badge variant={riskBadgeVariant(s.risk)}>
													{s.risk}
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
					<p className="text-sm mt-2">
						<Link
							href={`/?route=${route.code}&day=friday`}
							className="underline underline-offset-4"
						>
							See all Friday sailings for this route
						</Link>
					</p>
				</div>
			))}
			<p className="text-xs text-muted-foreground">
				Capacity data collected every 15 minutes from BC Ferries, past 12
				weeks. Showing sailings that filled up more than 20% of the time.
			</p>
		</div>
	)
}

export default function ReservationStats() {
	return (
		<Suspense
			fallback={<div className="h-48 animate-pulse bg-muted rounded-md" />}
		>
			<ReservationStatsContent />
		</Suspense>
	)
}
