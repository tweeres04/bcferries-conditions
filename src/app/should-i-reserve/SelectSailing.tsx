'use client'

import { useSearchParams } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'
import { formatTime } from '../formatTime'

type Props = {
	selectSailing: (
		searchParams: [string, string][],
		sailing: string,
	) => Promise<void>
	sailings: { time: string }[]
	defaultValue?: string
}

export default function SelectSailing({
	selectSailing,
	sailings,
	defaultValue,
}: Props) {
	const searchParams = useSearchParams()
	const [, startTransition] = useTransition()
	const [optimisticSailing, setOptimisticSailing] = useOptimistic(
		searchParams.get('sailing') ?? defaultValue ?? '',
		(_, newValue: string) => newValue,
	)

	return (
		<select
			onChange={(event) => {
				const nextValue = event.target.value
				startTransition(async () => {
					setOptimisticSailing(nextValue)
					await selectSailing(Array.from(searchParams.entries()), nextValue)
				})
			}}
			value={optimisticSailing}
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
