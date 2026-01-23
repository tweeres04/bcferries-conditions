'use client'

import { useOptimistic, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { routeLabels, type RouteCode } from './routeLabels'

type Props = {
	selectRoute: (
		searchParams: [string, string][],
		route: string,
	) => Promise<void>
	routes: { route: string }[]
	defaultValue?: string
}

export default function SelectRoute({
	selectRoute,
	routes,
	defaultValue,
}: Props) {
	const searchParams = useSearchParams()
	const [, startTransition] = useTransition()
	const [optimisticRoute, setOptimisticRoute] = useOptimistic(
		searchParams.get('route') ?? defaultValue ?? '',
		(_, newValue: string) => newValue,
	)

	return (
		<select
			onChange={(event) => {
				const nextValue = event.target.value
				startTransition(async () => {
					setOptimisticRoute(nextValue)
					await selectRoute(Array.from(searchParams.entries()), nextValue)
				})
			}}
			value={optimisticRoute}
			id="route"
			className="w-full"
		>
			<option value="">Select a route</option>
			{(routes as { route: RouteCode }[]).map((d) => (
				<option key={d.route} value={d.route}>
					{routeLabels[d.route] ?? d.route}
				</option>
			))}
		</select>
	)
}
