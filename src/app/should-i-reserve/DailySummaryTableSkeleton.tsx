export default function DailySummaryTableSkeleton() {
	return (
		<div className="mt-8">
			<div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
			<div className="overflow-x-auto mt-3">
				<table className="min-w-full text-sm sm:text-base border-collapse">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="text-left py-2 px-1">Sailing</th>
							<th className="text-right py-2 px-1">Full %</th>
							<th className="text-left py-2 px-1">Risk</th>
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: 8 }).map((_, i) => (
							<tr
								key={i}
								className="border-b border-gray-100 animate-pulse"
							>
								<td className="py-3 px-1">
									<div className="h-5 bg-gray-200 rounded w-20" />
								</td>
								<td className="py-3 px-1 text-right">
									<div className="h-5 bg-gray-200 rounded w-16 ml-auto" />
								</td>
								<td className="py-3 px-1">
									<div className="h-5 bg-gray-200 rounded w-24" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
