import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type FAQ = {
	question: string
	answer: string
}

export type BlogPost = {
	slug: string
	title: string
	description: string
	date: string
	keywords?: string[]
	faqs?: FAQ[]
	content: string
}

const postsDirectory = path.join(process.cwd(), 'src/content/articles')

export function getAllBlogPosts(): BlogPost[] {
	// Check if directory exists
	if (!fs.existsSync(postsDirectory)) {
		return []
	}

	const fileNames = fs.readdirSync(postsDirectory)
	const posts = fileNames
		.filter((fileName) => fileName.endsWith('.mdx'))
		.map((fileName) => {
			const slug = fileName.replace(/\.mdx$/, '')
			const fullPath = path.join(postsDirectory, fileName)
			const fileContents = fs.readFileSync(fullPath, 'utf8')
			const { data, content } = matter(fileContents)

			return {
				slug,
				title: data.title,
				description: data.description,
				date: data.date,
				keywords: data.keywords,
				faqs: data.faqs,
				content,
			}
		})

	// Sort posts by date (newest first)
	return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
	try {
		const fullPath = path.join(postsDirectory, `${slug}.mdx`)
		const fileContents = fs.readFileSync(fullPath, 'utf8')
		const { data, content } = matter(fileContents)

		return {
			slug,
			title: data.title,
			description: data.description,
			date: data.date,
			keywords: data.keywords,
			faqs: data.faqs,
			content,
		}
	} catch {
		return null
	}
}
