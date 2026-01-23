// Shared route labels for display in dropdowns
export const routeLabels: Record<string, string> = {
	'SWB-TSA': 'Victoria (Swartz Bay) to Vancouver (Tsawwassen)',
	'TSA-SWB': 'Vancouver (Tsawwassen) to Victoria (Swartz Bay)',
}

export type RouteCode = keyof typeof routeLabels
