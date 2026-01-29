import { Metadata } from 'next'
import { entries } from '@/schema'
import { formatISO } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import { Suspense } from 'react'

import { getDb } from '../getDb'
import SelectDate from '../SelectDate'
import SelectRoute from '../SelectRoute'
import { getRoutes } from '../getRoutes'
import { selectValue } from '../selectValue'
import Footer from '@/components/Footer'
import HistoryChartWithData from './HistoryChartWithData'
import ChartSkeleton from './ChartSkeleton'

const title = 'View Past Capacity Data - BC Ferries Conditions Analytics'
const description =
	'View historical vehicle deck space capacity data for BC Ferries. Track how full sailings were throughout the day.'
const url = 'https://bcferries-conditions.tweeres.ca/history'

export const metadata: Metadata = {
	title,
	description,
	alternates: {
		canonical: url,
	},
	openGraph: {
		title,
		description,
		url,
		type: 'website',
		images: 'https://bcferries-conditions.tweeres.ca/og.png',
	},
}

type Props = {
	searchParams: {
		date?: string
		route?: string
		sailings?: string | string[]
	}
}

export default async function History({ searchParams }: Props) {
	const db = getDb()

	let { date, route, sailings: sailingsParam } = searchParams

	date =
		date ??
		formatISO(TZDate.tz('America/Vancouver'), { representation: 'date' })
	route = route ?? 'SWB-TSA'
	const sailings = sailingsParam ? [sailingsParam].flat() : undefined

	const datesPromise = db
		.selectDistinct({ date: entries.date })
		.from(entries)
		.orderBy(entries.date)

	const routesPromise = getRoutes()

	const [dates, routes] = await Promise.all([datesPromise, routesPromise])

	return (
		<div className="container mx-auto px-2 space-y-10">
			<div className="py-1">
				<SelectRoute
					selectRoute={selectValue('/history', 'route')}
					routes={routes}
					defaultValue="SWB-TSA"
				/>
				<SelectDate
					selectDate={selectValue('/history', 'date')}
					dates={dates}
					defaultValue={formatISO(TZDate.tz('America/Vancouver'), {
						representation: 'date',
					})}
				/>
			</div>
			<Suspense
				key={`${date}-${route}-${sailings?.join(',')}`}
				fallback={<ChartSkeleton />}
			>
				<HistoryChartWithData date={date} route={route} sailings={sailings} />
			</Suspense>
			<Footer />
		</div>
	)
}
