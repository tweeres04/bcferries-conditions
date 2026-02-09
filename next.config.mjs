import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
	// Add markdown plugins here if needed
})

export default withMDX(nextConfig)
