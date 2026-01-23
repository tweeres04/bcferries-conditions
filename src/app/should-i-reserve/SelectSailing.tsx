'use client'

import { useSearchParams } from 'next/navigation'
import { formatTime } from '../formatTime'

type Props = {
	selectSailing: (searchParams: [string, string][], sailing: string) => void
	sailings: { time: string }[]
	defaultValue?: string
}

export default function SelectSailing({
	selectSailing,
	sailings,
	defaultValue,
}: Props) {
	const searchParams = useSearchParams()

	return (
		<select
			onChange={(event) => {
				selectSailing(Array.from(searchParams.entries()), event.target.value)
			}}
			value={searchParams.get('sailing') ?? defaultValue ?? ''}
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
