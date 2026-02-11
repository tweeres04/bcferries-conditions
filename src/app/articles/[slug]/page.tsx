import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllBlogPostMeta, getBlogPostBySlug } from '../getBlogPosts'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { format, parseISO } from 'date-fns'
import { tz } from '@date-fns/tz'

type Props = {
	params: { slug: string }
}

export const dynamicParams = false

export async function generateStaticParams() {
	const posts = getAllBlogPostMeta()
	return posts.map((post) => ({
		slug: post.slug,
	}))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const post = getBlogPostBySlug(params.slug)

	if (!post) {
		return {
			title: 'Post not found',
		}
	}

	return {
		title: `${post.title} - BC Ferries Conditions Analytics`,
		description: post.description,
		keywords: post.keywords,
		alternates: {
			canonical: `https://bcferries-conditions.tweeres.ca/articles/${params.slug}`,
		},
		openGraph: {
			title: post.title,
			description: post.description,
			url: `https://bcferries-conditions.tweeres.ca/articles/${params.slug}`,
			type: 'article',
			publishedTime: post.date,
		},
	}
}

export default function BlogPost({ params }: Props) {
	const post = getBlogPostBySlug(params.slug)

	if (!post) {
		notFound()
	}

	const schema = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Article',
				headline: post.title,
				description: post.description,
				datePublished: post.date,
				author: {
					'@type': 'Person',
					name: 'Tyler Weeres',
				},
			},
			...(post.faqs && post.faqs.length > 0
				? [
						{
							'@type': 'FAQPage',
							mainEntity: post.faqs.map((faq) => ({
								'@type': 'Question',
								name: faq.question,
								acceptedAnswer: {
									'@type': 'Answer',
									text: faq.answer,
								},
							})),
						},
					]
				: []),
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Home',
						item: 'https://bcferries-conditions.tweeres.ca',
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Articles',
						item: 'https://bcferries-conditions.tweeres.ca/articles',
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: post.title,
						item: `https://bcferries-conditions.tweeres.ca/articles/${params.slug}`,
					},
				],
			},
		],
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
			/>
			<div className="container mx-auto max-w-3xl px-4 py-8">
				<nav className="mb-6 text-sm">
					<Link href="/articles" className="content-link">
						← Back to articles
					</Link>
				</nav>

				<article className="prose sm:prose-lg mx-auto">
					<header className="mb-8">
						<h1 className="mb-2">{post.title}</h1>
						<time className="text-sm text-gray-500">
							{format(
								parseISO(post.date, { in: tz('America/Vancouver') }),
								'MMMM d, yyyy'
							)}
						</time>
					</header>

					<MDXRemote source={post.content} />

					{post.faqs && post.faqs.length > 0 && (
						<section className="mt-12">
							<h2>Frequently asked questions</h2>
							{post.faqs.map((faq, i) => (
								<div key={i} className="mt-6">
									<h3>{faq.question}</h3>
									<p>{faq.answer}</p>
								</div>
							))}
						</section>
					)}
				</article>

				<div className="mt-16">
					<Footer />
				</div>
			</div>
		</>
	)
}
