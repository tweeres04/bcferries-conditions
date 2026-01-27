type RouteInfo = {
	from: string
	to: string
	fromShort: string
	toShort: string
	code: string
}

type Props = {
	routeInfo: RouteInfo
}

export default function RouteDisplay({ routeInfo }: Props) {
	return (
		<>
			<span className="sm:hidden">
				{routeInfo.fromShort} to {routeInfo.toShort}
			</span>
			<span className="hidden sm:inline">
				{routeInfo.from} to {routeInfo.to}
			</span>
		</>
	)
}
