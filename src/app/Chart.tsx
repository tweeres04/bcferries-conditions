'use client'

import { Entry } from '@/schema'
import { RefObject, useLayoutEffect, useRef } from 'react'
import { groupBy, map, orderBy } from 'lodash'
import { Chart } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'

type Props = {
	entries: Entry[]
}

function useChart(entries: Entry[], canvasRef: RefObject<HTMLCanvasElement>) {
	useLayoutEffect(() => {
		const groupedEntries = groupBy(entries, (e) => e.time)

		let datasets = map(groupedEntries, (group, key) => ({
			label: key,
			data: group,
			parsing: {
				yAxisKey: 'overallPercent',
				xAxisKey: 'timestamp',
			},
		}))
		datasets = orderBy(datasets, 'label')
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
							max: 100,
						},
					},
					elements: {
						point: {
							radius: 0,
						},
					},
					spanGaps: true,
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
	return <canvas ref={canvasRef} />
}
