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
