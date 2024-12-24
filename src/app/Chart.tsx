'use client'

import { Entry } from '@/schema'
import { RefObject, useLayoutEffect, useRef } from 'react'
import { groupBy, map, orderBy } from 'lodash'
import { Chart } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { formatISO, isToday, parseISO } from 'date-fns'
import { formatTime } from './formatTime'
import { tz } from '@date-fns/tz'

type Props = {
	entries: Entry[]
}

function useChart(entries: Entry[], canvasRef: RefObject<HTMLCanvasElement>) {
	useLayoutEffect(() => {
		const targetDate = entries[0].date
		const groupedEntries = groupBy(entries, (e) => e.time)
		const nowString = formatISO(new Date(), {
			representation: 'time',
		})
		const targetIsToday = isToday(
			parseISO(targetDate, { in: tz('America/Vancouver') })
		)

		let datasets = map(groupedEntries, (group, key) => ({
			label: key,
			data: group,
			hidden: targetIsToday && key < nowString,
			parsing: {
				yAxisKey: 'overallPercent',
				xAxisKey: 'timestamp',
			},
		}))
		datasets = orderBy(datasets, 'label')
		datasets = datasets.map((d) => ({ ...d, label: formatTime(d.label) }))
		let chart: Chart
		if (canvasRef.current) {
			chart = new Chart(canvasRef.current, {
				type: 'line',
				data: {
					datasets,
				},
				options: {
					scales: {
						x: {
							type: 'time',
						},
						y: {
							min: 0,
						},
					},
					elements: {
						point: {
							radius: 0,
							hitRadius: 10,
						},
					},
					spanGaps: true,
					maintainAspectRatio: false,
				},
			})
		}

		function cleanup() {
			chart.destroy()
		}

		return cleanup
	}, [canvasRef, entries])
}

export default function HistoryChart({ entries }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	useChart(entries, canvasRef)
	return (
		<div style={{ height: 'calc(50dvh - 32px - 50px - 5px)' }}>
			<canvas
				ref={canvasRef}
				aria-label="Chart showing ferry vehicle capacities over time for the day"
				role="figure"
			/>
		</div>
	)
}
