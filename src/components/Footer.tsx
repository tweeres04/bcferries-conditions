import Link from 'next/link'
import FeedbackDialog from './FeedbackDialog'

export default function Footer() {
	return (
		<footer className="text-center py-32 not-prose">
			<div className="mb-8">
				<FeedbackDialog />
			</div>
			<div className="mb-8 space-y-2 text-sm text-gray-600">
				<div>
					<span className="text-gray-500">Quick links:</span>{' '}
					<Link href="/" className="content-link">
						Should I Reserve?
					</Link>{' '}
					|{' '}
					<Link href="/busiest-ferry-times" className="content-link">
						Busiest Times
					</Link>{' '}
					|{' '}
					<Link href="/history" className="content-link">
						History
					</Link>
				</div>
				<div>
					<span className="text-gray-500">Popular:</span>{' '}
					<Link href="/?day=friday" className="content-link">
						Friday Sailings
					</Link>{' '}
					|{' '}
					<Link href="/?day=sunday" className="content-link">
						Sunday Sailings
					</Link>{' '}
					|{' '}
					<Link href="/?holiday=victoria-day" className="content-link">
						Long Weekends
					</Link>
				</div>
			</div>
			<p>
				By{' '}
				<a href="https://tweeres.ca" title="Tyler Weeres" className="content-link">
					Tyler Weeres
				</a>
			</p>
			<p>
				Ferry boat icons created by{' '}
				<a
					href="https://www.flaticon.com/free-icons/ferry-boat"
					title="ferry boat icons"
					className="content-link"
				>
					Freepik - Flaticon
				</a>
			</p>
		</footer>
	)
}
