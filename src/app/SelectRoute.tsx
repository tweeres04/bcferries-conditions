'use client'

type Props = {
	selectRoute: (route: string) => void
	routes: { route: string }[]
	route: string
}

const routeLabels = {
	'SWB-TSA': 'Swartz Bay to Tsawwassen',
	'TSA-SWB': 'Tsawwassen to Swartz Bay',
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
				<option key={d.route}>{routeLabels[d.route]}</option>
			))}
		</select>
	)
}
