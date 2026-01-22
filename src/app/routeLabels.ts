// Shared route labels for display in dropdowns
export const routeLabels: Record<string, string> = {
	'SWB-TSA': 'Swartz Bay to Tsawwassen',
	'TSA-SWB': 'Tsawwassen to Swartz Bay',
}

export type RouteCode = keyof typeof routeLabels
