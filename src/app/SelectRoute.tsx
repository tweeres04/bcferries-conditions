'use client'

import { useSearchParams } from 'next/navigation'
import { routeLabels, type RouteCode } from './routeLabels'

type Props = {
	selectRoute: (searchParams: [string, string][], route: string) => void
	routes: { route: string }[]
	defaultValue?: string
}

export default function SelectRoute({
	selectRoute,
	routes,
	defaultValue,
}: Props) {
	const searchParams = useSearchParams()
	const route = searchParams.get('route') ?? undefined

	return (
		<select
			onChange={(event) => {
				selectRoute(Array.from(searchParams.entries()), event.target.value)
			}}
			value={route}
			defaultValue={defaultValue}
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
