import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: 'https://bcferries-conditions.tweeres.ca',
		},
		{
			url: 'https://bcferries-conditions.tweeres.ca/should-i-reserve',
		},
	]
}
