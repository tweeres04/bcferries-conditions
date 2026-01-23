'use client'

import { useSearchParams } from 'next/navigation'
import { formatTime } from '../formatTime'

type Props = {
	selectSailing: (searchParams: [string, string][], sailing: string) => void
	sailings: { time: string }[]
}

export default function SelectSailing({ selectSailing, sailings }: Props) {
	const searchParams = useSearchParams()
	const sailing = searchParams.get('sailing') ?? undefined

	return (
		<select
			onChange={(event) => {
				selectSailing(Array.from(searchParams.entries()), event.target.value)
			}}
			defaultValue={sailing}
			id="sailing"
			className="w-full"
		>
			<option value="">Select a sailing</option>
			{sailings.map((s) => (
				<option key={s.time} value={s.time}>
					{formatTime(s.time)}
				</option>
			))}
		</select>
	)
}
