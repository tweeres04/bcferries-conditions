import { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPostMeta } from './getBlogPosts'
import Footer from '@/components/Footer'
import { format, parseISO } from 'date-fns'
import { tz } from '@date-fns/tz'

export const metadata: Metadata = {
	title: 'BC Ferries travel tips & guides - BC Ferries Conditions Analytics',
	description:
		'Tips for traveling BC Ferries without the stress. When to reserve, which sailings to avoid, and how to read the crowds. Backed by real data.',
	alternates: {
		canonical: 'https://bcferries-conditions.tweeres.ca/articles',
	},
	openGraph: {
		title: 'BC Ferries travel tips & guides - BC Ferries Conditions Analytics',
		description:
			'Tips for traveling BC Ferries without the stress. When to reserve, which sailings to avoid, and how to read the crowds. Backed by real data.',
		url: 'https://bcferries-conditions.tweeres.ca/articles',
	},
}

export default function BlogIndex() {
	const posts = getAllBlogPostMeta()

	return (
		<div className="container mx-auto max-w-3xl px-4 py-8">
			<div className="prose sm:prose-lg mx-auto">
				<h1>BC Ferries travel tips & guides</h1>
				<p className="lead">
					Expert advice for planning your BC Ferries trip, backed by real data.
				</p>

				{posts.length === 0 ? (
					<p className="text-gray-600">No articles yet. Check back soon!</p>
				) : (
					<div className="space-y-8 not-prose">
						{posts.map((post) => (
							<article key={post.slug} className="border-b border-gray-200 pb-6">
								<h2 className="text-2xl font-semibold mb-2">
									<Link
										href={`/articles/${post.slug}`}
										className="content-link hover:underline"
									>
										{post.title}
									</Link>
								</h2>
								<time className="text-sm text-gray-500 block mb-3">
									{format(
										parseISO(post.date, { in: tz('America/Vancouver') }),
										'MMMM d, yyyy'
									)}
								</time>
								<p className="text-gray-700 mb-3">{post.description}</p>
								<Link
									href={`/articles/${post.slug}`}
									className="text-blue-600 hover:underline text-sm font-medium"
								>
									Read more →
								</Link>
							</article>
						))}
					</div>
				)}
			</div>

			<div className="mt-16">
				<Footer />
			</div>
		</div>
	)
}
