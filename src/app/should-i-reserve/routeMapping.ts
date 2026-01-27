const routeConfig = {
	'vancouver-victoria': {
		code: 'TSA-SWB',
		from: 'Vancouver (Tsawwassen)',
		to: 'Victoria (Swartz Bay)',
		fromShort: 'Tsawwassen',
		toShort: 'Swartz Bay',
		slug: 'tsawwassen-to-swartz-bay',
	},
	'victoria-vancouver': {
		code: 'SWB-TSA',
		from: 'Victoria (Swartz Bay)',
		to: 'Vancouver (Tsawwassen)',
		fromShort: 'Swartz Bay',
		toShort: 'Tsawwassen',
		slug: 'swartz-bay-to-tsawwassen',
	},
} as const

export function getAllRouteCodes(): string[] {
	return Object.values(routeConfig).map((info) => info.code)
}

export function getSlugByRouteCode(code: string) {
	const entry = Object.entries(routeConfig).find(
		([, info]) => info.code === code
	)
	return entry?.[0]
}

export function getRouteByCode(code: string) {
	return Object.values(routeConfig).find((info) => info.code === code)
}

export function getRouteBySlug(slug: string) {
	return Object.values(routeConfig).find((info) => info.slug === slug)
}

export function getAllRouteSlugs(): string[] {
	return Object.values(routeConfig).map((info) => info.slug)
}
