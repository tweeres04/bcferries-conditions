'use client'

import { Info } from 'lucide-react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
	column: 'full-percent' | 'risk'
}

export default function ColumnInfoButton({ column }: Props) {
	const content = {
		'full-percent': {
			title: 'What does Full % mean?',
			description:
				'This shows how often this sailing filled up over the last 12 weeks. For example, 75% means it filled up on 3 out of 4 similar days.',
		},
		risk: {
			title: 'How is risk calculated?',
			description:
				'We look at how often the sailing fills up. High means it fills more than half the time (>50%). Moderate is 20-50%. Low is less than 20%. If we don\'t have enough data (less than 4 sailings), we\'ll show "Insufficient data" instead.',
		},
	}

	const { title, description } = content[column]

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="h-6 w-6 ml-1 align-middle">
					<Info className="h-4 w-4 text-gray-400" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	)
}
