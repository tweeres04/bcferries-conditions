'use client'

import { useSearchParams } from 'next/navigation'

type Props = {
	selectRoute: (searchParams: [string, string][], route: string) => void
	routes: { route: string }[]
	defaultValue?: string
}

const routeLabels = {
	'SWB-TSA': 'Swartz Bay to Tsawwassen',
	'TSA-SWB': 'Tsawwassen to Swartz Bay',
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
		>
			<option value="">Select a route</option>
			{(routes as { route: keyof typeof routeLabels }[]).map((d) => (
				<option key={d.route} value={d.route}>
					{routeLabels[d.route]}
				</option>
			))}
		</select>
	)
}
