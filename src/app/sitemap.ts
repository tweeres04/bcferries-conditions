import type { MetadataRoute } from 'next'
import { getAllRouteSlugs } from './should-i-reserve/routeMapping'

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://bcferries-conditions.tweeres.ca'
	
	const routePages = getAllRouteSlugs().map((slug) => ({
		url: `${baseUrl}/should-i-reserve/${slug}`,
		changeFrequency: 'hourly' as const,
	}))

	return [
		{
			url: baseUrl,
			changeFrequency: 'hourly' as const,
		},
		{
			url: `${baseUrl}/should-i-reserve`,
			changeFrequency: 'hourly' as const,
		},
		...routePages,
	]
}
