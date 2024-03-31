'use client'

import { Entry } from '@/schema'
import { RefObject, useLayoutEffect, useRef } from 'react'
import { groupBy, map, orderBy } from 'lodash'
import { Chart } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { formatISO, isToday, addHours } from 'date-fns'

function formatTime(timeString: string) {
	const [hoursString, minutes] = timeString.split(':')

	let hours = Number(hoursString)

	const pm = hours >= 12
	const amPm = pm ? 'PM' : 'AM'

	hours = hours === 0 || hours === 12 ? 12 : pm ? hours - 12 : hours

	return `${hours}:${minutes} ${amPm}`
}

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
		const targetIsToday = isToday(addHours(new Date(targetDate), 7))

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
