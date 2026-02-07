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
	'nanaimo-horseshoe-bay': {
		code: 'NAN-HSB',
		from: 'Nanaimo (Departure Bay)',
		to: 'Vancouver (Horseshoe Bay)',
		fromShort: 'Departure Bay',
		toShort: 'Horseshoe Bay',
		slug: 'departure-bay-to-horseshoe-bay',
	},
	'horseshoe-bay-langdale': {
		code: 'HSB-LNG',
		from: 'Vancouver (Horseshoe Bay)',
		to: 'Sunshine Coast (Langdale)',
		fromShort: 'Horseshoe Bay',
		toShort: 'Langdale',
		slug: 'horseshoe-bay-to-langdale',
	},
	'langdale-horseshoe-bay': {
		code: 'LNG-HSB',
		from: 'Sunshine Coast (Langdale)',
		to: 'Vancouver (Horseshoe Bay)',
		fromShort: 'Langdale',
		toShort: 'Horseshoe Bay',
		slug: 'langdale-to-horseshoe-bay',
	},
	'tsawwassen-duke-point': {
		code: 'TSA-DUK',
		from: 'Vancouver (Tsawwassen)',
		to: 'Nanaimo (Duke Point)',
		fromShort: 'Tsawwassen',
		toShort: 'Duke Point',
		slug: 'tsawwassen-to-duke-point',
	},
	'duke-point-tsawwassen': {
		code: 'DUK-TSA',
		from: 'Nanaimo (Duke Point)',
		to: 'Vancouver (Tsawwassen)',
		fromShort: 'Duke Point',
		toShort: 'Tsawwassen',
		slug: 'duke-point-to-tsawwassen',
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

export function getOppositeRouteSlug(slug: string): string | undefined {
	const oppositeMap: Record<string, string> = {
		'tsawwassen-to-swartz-bay': 'swartz-bay-to-tsawwassen',
		'swartz-bay-to-tsawwassen': 'tsawwassen-to-swartz-bay',

		'horseshoe-bay-to-langdale': 'langdale-to-horseshoe-bay',
		'langdale-to-horseshoe-bay': 'horseshoe-bay-to-langdale',
		'tsawwassen-to-duke-point': 'duke-point-to-tsawwassen',
		'duke-point-to-tsawwassen': 'tsawwassen-to-duke-point',
	}
	return oppositeMap[slug]
}
