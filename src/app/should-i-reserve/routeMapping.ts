// Maps user-friendly route slugs to route codes and metadata
const routeConfig = {
	'vancouver-victoria': {
		code: 'TSA-SWB',
		from: 'Vancouver (Tsawwassen)',
		to: 'Victoria (Swartz Bay)',
		fromShort: 'Tsawwassen',
		toShort: 'Swartz Bay',
	},
	'victoria-vancouver': {
		code: 'SWB-TSA',
		from: 'Victoria (Swartz Bay)',
		to: 'Vancouver (Tsawwassen)',
		fromShort: 'Swartz Bay',
		toShort: 'Tsawwassen',
	},
} as const

export type RouteSlug = keyof typeof routeConfig

export function getRouteBySlug(slug: string) {
	return routeConfig[slug as RouteSlug]
}

export function isValidRouteSlug(slug: string): slug is RouteSlug {
	return slug in routeConfig
}

export function getAllRouteSlugs(): RouteSlug[] {
	return Object.keys(routeConfig) as RouteSlug[]
}

export function getSlugByRouteCode(code: string): RouteSlug | undefined {
	const entry = Object.entries(routeConfig).find(
		([, info]) => info.code === code
	)
	return entry?.[0] as RouteSlug | undefined
}
