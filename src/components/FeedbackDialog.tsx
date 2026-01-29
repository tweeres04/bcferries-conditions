'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function FeedbackDialog() {
	const [open, setOpen] = useState(false)
	const [message, setMessage] = useState('')
	const [email, setEmail] = useState('')
	const [status, setStatus] = useState<
		'idle' | 'submitting' | 'success' | 'error'
	>('idle')
	const [errorMessage, setErrorMessage] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (message.trim().length < 3) {
			setErrorMessage('Please enter at least 3 characters')
			return
		}

		setStatus('submitting')
		setErrorMessage('')

		try {
			const response = await fetch('/api/feedback', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: message.trim(),
					email: email.trim() || undefined,
				}),
			})

			const data = await response.json()

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Failed to send feedback')
			}

			setStatus('success')
			setMessage('')
			setEmail('')

			// Close dialog after 2 seconds
			setTimeout(() => {
				setOpen(false)
				// Reset status after dialog closes
				setTimeout(() => setStatus('idle'), 300)
			}, 2000)
		} catch (error) {
			console.error('Error submitting feedback:', error)
			setStatus('error')
			setErrorMessage(
				error instanceof Error ? error.message : 'Failed to send feedback',
			)
		}
	}

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		if (!newOpen) {
			// Reset form when closing
			setTimeout(() => {
				setMessage('')
				setEmail('')
				setStatus('idle')
				setErrorMessage('')
			}, 300)
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="secondary">Send feedback</Button>
			</DialogTrigger>
			<DialogContent>
				{status === 'success' ? (
					<div className="space-y-2">
						<p className="text-lg font-semibold">Thank you!</p>
						<p>Your feedback has been sent successfully.</p>
					</div>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Send Feedback</DialogTitle>
							<DialogDescription>
								Help me improve! Share your thoughts, report issues, or suggest
								new features.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-1">
								<label htmlFor="message">
									Your feedback <span className="text-red-500">*</span>
								</label>
								<Textarea
									id="message"
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									rows={4}
									disabled={status === 'submitting'}
									required
								/>
							</div>

							<div className="space-y-1">
								<label htmlFor="email">
									Your email (optional) - so I can respond
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="your@email.com"
									disabled={status === 'submitting'}
									className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
								/>
							</div>

							{errorMessage && (
								<div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
									{errorMessage}
								</div>
							)}

							<div className="flex justify-end gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={() => handleOpenChange(false)}
									disabled={status === 'submitting'}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={
										status === 'submitting' || message.trim().length < 3
									}
								>
									{status === 'submitting' ? 'Sending...' : 'Send Feedback'}
								</Button>
							</div>
						</form>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
