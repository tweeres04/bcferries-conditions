import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export default function DailySummaryTableSkeleton() {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Sailing</TableHead>
						<TableHead className="text-right">
							Full
							<br className="sm:hidden" />
							sailings
						</TableHead>
						<TableHead>Risk</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 8 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell>
								<Skeleton className="h-5 w-20" />
							</TableCell>
							<TableCell className="text-right">
								<Skeleton className="h-5 w-16 ml-auto" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-24" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
