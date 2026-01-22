// Maps user-friendly route slugs to route codes and metadata
export const routeConfig = {
	'vancouver-victoria': {
		code: 'TSA-SWB',
		from: 'Vancouver (Tsawwassen)',
		to: 'Victoria (Swartz Bay)',
		fromShort: 'Vancouver',
		toShort: 'Victoria',
	},
	'victoria-vancouver': {
		code: 'SWB-TSA',
		from: 'Victoria (Swartz Bay)',
		to: 'Vancouver (Tsawwassen)',
		fromShort: 'Victoria',
		toShort: 'Vancouver',
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
