import { unstable_cache } from 'next/cache'
import { getDailySummary } from '@/app/should-i-reserve/getDailySummary'
import {
	getRouteByCode,
	isRouteCollectingData,
} from '@/app/should-i-reserve/routeMapping'
import { formatTime } from '@/app/formatTime'

const MIN_DATA_POINTS = 4
const FRIDAY_DOW = 5

export type SailingStat = {
	time: string
	timeFormatted: string
	fillRate: number
	fullCount: number
	total: number
	risk: 'High' | 'Moderate' | 'Low' | 'Not enough data'
}

export type RouteStat = {
	code: string
	from: string
	to: string
	fromShort: string
	toShort: string
	sailings: SailingStat[]
}

// Only show these routes in the article
const FEATURED_ROUTES = ['TSA-SWB']

export const getReservationStats = unstable_cache(
	async (): Promise<RouteStat[]> => {
		const routeEntries = FEATURED_ROUTES.filter(
			(code) => !isRouteCollectingData(code)
		)
			.map((code) => ({ code, info: getRouteByCode(code) }))
			.filter((r): r is { code: string; info: NonNullable<ReturnType<typeof getRouteByCode>> } => r.info != null)

		const results = await Promise.all(
			routeEntries.map(async ({ code, info }) => {
				const summary = await getDailySummary({ dow: FRIDAY_DOW, route: code })
				if (!summary || summary.length === 0) return null

				// Only include sailings with Moderate or High risk (>20% fill rate)
				const sailings: SailingStat[] = summary
					.map((row) => {
						const total = Number(row.total)
						const fullCount = Number(row.full_count)
						const fillRate =
							total > 0 ? Math.round((fullCount / total) * 100) : 0

						let risk: SailingStat['risk'] = 'Low'
						if (total < MIN_DATA_POINTS) {
							risk = 'Not enough data'
						} else if (fillRate > 50) {
							risk = 'High'
						} else if (fillRate > 20) {
							risk = 'Moderate'
						}

						return {
							time: row.time,
							timeFormatted: formatTime(row.time),
							fillRate,
							fullCount,
							total,
							risk,
						}
					})
					.filter((s) => s.risk === 'High' || s.risk === 'Moderate')

				return {
					code,
					from: info.from as string,
					to: info.to as string,
					fromShort: info.fromShort as string,
					toShort: info.toShort as string,
					sailings,
				}
			})
		)

		return results.filter((r): r is RouteStat => r !== null)
	},
	['reservation-stats'],
	{ revalidate: 86400 } // revalidate once a day
)
