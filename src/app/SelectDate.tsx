'use client'

import { tz } from '@date-fns/tz'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'

type Props = {
	selectDate: (searchParams: [string, string][], date: string) => Promise<void>
	dates: { date: string }[]
	defaultValue?: string
}

export default function SelectDate({ selectDate, dates, defaultValue }: Props) {
	const searchParams = useSearchParams()
	const [, startTransition] = useTransition()
	const dateInUrl = searchParams.get('date') ?? defaultValue ?? ''
	const [optimisticDate, setOptimisticDate] = useOptimistic(
		dateInUrl,
		(_, newValue: string) => newValue,
	)

	// Ensure the date from the URL is always in the list, even if outside the standard range
	const allDates = [...dates]
	if (optimisticDate && !allDates.find((d) => d.date === optimisticDate)) {
		allDates.push({ date: optimisticDate })
		allDates.sort((a, b) => a.date.localeCompare(b.date))
	}

	return (
		<select
			onChange={(event) => {
				const nextValue = event.target.value
				startTransition(async () => {
					setOptimisticDate(nextValue)
					await selectDate(Array.from(searchParams.entries()), nextValue)
				})
			}}
			id="date"
			value={optimisticDate}
			className="w-full"
		>
			<option value="">Select a date</option>
			{allDates.map((d) => {
				const dateInBcTime = parseISO(d.date, { in: tz('America/Vancouver') })
				return (
					<option key={d.date} value={d.date}>
						{format(dateInBcTime, 'E MMM d, yyyy')}
						{isYesterday(dateInBcTime)
							? ' (yesterday)'
							: isToday(dateInBcTime)
								? ' (today)'
								: isTomorrow(dateInBcTime)
									? ' (tomorrow)'
									: ''}
					</option>
				)
			})}
		</select>
	)
}
