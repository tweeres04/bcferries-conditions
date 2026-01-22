import type { MetadataRoute } from 'next'
import { getAllRouteSlugs } from './should-i-reserve/routeMapping'

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://bcferries-conditions.tweeres.ca'
	
	const routePages = getAllRouteSlugs().map((slug) => ({
		url: `${baseUrl}/should-i-reserve/${slug}`,
		lastModified: new Date(),
		changeFrequency: 'daily' as const,
		priority: 0.9,
	}))

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: `${baseUrl}/should-i-reserve`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		...routePages,
	]
}
