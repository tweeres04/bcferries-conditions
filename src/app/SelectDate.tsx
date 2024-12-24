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
	const date = searchParams.get('date')

	return (
		<select
			onChange={(event) => {
				selectDate(Array.from(searchParams.entries()), event.target.value)
			}}
			id="date"
			value={date ?? undefined}
			defaultValue={defaultValue}
		>
			<option value="">Select a date</option>
			{dates.map((d) => {
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
