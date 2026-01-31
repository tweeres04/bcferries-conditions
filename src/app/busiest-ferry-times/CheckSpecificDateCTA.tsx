import Link from 'next/link'

type Props = {
	href: string
}

export default function CheckSpecificDateCTA({ href }: Props) {
	return (
		<div className="mt-6 text-sm text-gray-600">
			Need a specific date? See how full your sailing usually gets.{' '}
			<Link href={href} className="content-link">
				Check a specific sailing →
			</Link>
		</div>
	)
}
