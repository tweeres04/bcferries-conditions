'use client'

import { Entry } from '@/schema'

type Props = {
	selectRoute: (route: string) => void
	routes: { route: string }[]
	route: string
}

export default function SelectRoute({ selectRoute, routes, route }: Props) {
	return (
		<select
			onChange={(event) => {
				selectRoute(event.target.value)
			}}
			defaultValue={route}
		>
			{routes.map((d) => (
				<option key={d.route}>{d.route}</option>
			))}
		</select>
	)
}
