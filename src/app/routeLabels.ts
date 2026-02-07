// Shared route labels for display in dropdowns
export const routeLabels: Record<string, string> = {
	'SWB-TSA': 'Victoria (Swartz Bay) to Vancouver (Tsawwassen)',
	'TSA-SWB': 'Vancouver (Tsawwassen) to Victoria (Swartz Bay)',
	'NAN-HSB': 'Nanaimo (Departure Bay) to Vancouver (Horseshoe Bay)',
	'HSB-LNG': 'Vancouver (Horseshoe Bay) to Sunshine Coast (Langdale)',
	'LNG-HSB': 'Sunshine Coast (Langdale) to Vancouver (Horseshoe Bay)',
	'TSA-DUK': 'Vancouver (Tsawwassen) to Nanaimo (Duke Point)',
	'DUK-TSA': 'Nanaimo (Duke Point) to Vancouver (Tsawwassen)',
}

export type RouteCode = keyof typeof routeLabels
