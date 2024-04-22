'use client'

import { format, isToday, isTomorrow, isYesterday, addHours } from 'date-fns'

type Props = {
	selectDate: (date: string) => void
	dates: { date: string }[]
	date: string
}

export default function SelectDate({ selectDate, dates, date }: Props) {
	return (
		<select
			onChange={(event) => {
				selectDate(event.target.value)
			}}
			defaultValue={date}
		>
			{dates.map((d) => {
				// Add hours since this runs client side, and timestamp is UTC
				const dateInBcTime = addHours(new Date(d.date), 7)
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
