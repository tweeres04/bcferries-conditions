import type { MetadataRoute } from 'next'
import { getAllRouteSlugs } from './should-i-reserve/routeMapping'

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://bcferries-conditions.tweeres.ca'

	const routePages = getAllRouteSlugs().map((slug) => ({
		url: `${baseUrl}/should-i-reserve/${slug}`,
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
