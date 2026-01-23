'use client'

import { tz } from '@date-fns/tz'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { useSearchParams } from 'next/navigation'

type Props = {
	selectDate: (searchParams: [string, string][], date: string) => void
	dates: { date: string }[]
	defaultValue?: string
}

export default function SelectDate({ selectDate, dates, defaultValue }: Props) {
	const searchParams = useSearchParams()
	const dateInUrl = searchParams.get('date')

	// Ensure the date from the URL is always in the list, even if outside the standard range
	const allDates = [...dates]
	if (dateInUrl && !allDates.find((d) => d.date === dateInUrl)) {
		allDates.push({ date: dateInUrl })
		allDates.sort((a, b) => a.date.localeCompare(b.date))
	}

	return (
		<select
			onChange={(event) => {
				selectDate(Array.from(searchParams.entries()), event.target.value)
			}}
			id="date"
			value={dateInUrl ?? defaultValue ?? ''}
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
