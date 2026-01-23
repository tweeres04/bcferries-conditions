import type { MetadataRoute } from 'next'
import { getAllRouteCodes } from './should-i-reserve/routeMapping'

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://bcferries-conditions.tweeres.ca'

	const routePages = getAllRouteCodes().map((code) => ({
		url: `${baseUrl}/should-i-reserve?route=${code}`,
	}))

	return [
		{
			url: baseUrl,
		},
		{
			url: `${baseUrl}/should-i-reserve`,
		},
		...routePages,
	]
}
