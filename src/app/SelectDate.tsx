'use client'

import { format } from 'date-fns'

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
			{dates.map((d) => (
				<option key={d.date} value={d.date}>
					{format(d.date, 'E MMM d, yyyy')}
				</option>
			))}
		</select>
	)
}
