import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

type FeedbackRequest = {
	message: string
	email?: string
}

export async function POST(request: NextRequest) {
	try {
		const apiKey = process.env.RESEND_API_KEY

		if (!apiKey) {
			console.error('RESEND_API_KEY is not configured')
			return NextResponse.json(
				{ success: false, error: 'Email service not configured' },
				{ status: 500 },
			)
		}

		const body = (await request.json()) as FeedbackRequest

		if (!body.message || body.message.trim().length < 3) {
			return NextResponse.json(
				{
					success: false,
					error: 'Message is required and must be at least 3 characters',
				},
				{ status: 400 },
			)
		}

		const resend = new Resend(apiKey)

		const referer = request.headers.get('referer') || 'Unknown'
		const timestamp = new Date().toISOString()

		const emailHtml = `
			<h2>New Feedback Submission</h2>
			<p><strong>Message:</strong></p>
			<p>${body.message.replace(/\n/g, '<br>')}</p>
			<hr>
			<p><strong>Submitted:</strong> ${timestamp}</p>
			<p><strong>From:</strong> ${body.email || 'Anonymous'}</p>
			<p><strong>Page:</strong> <a href="${referer}">${referer}</a></p>
		`

		const emailText = `
New Feedback Submission

Message:
${body.message}

---
Submitted: ${timestamp}
From: ${body.email || 'Anonymous'}
Page: ${referer}
		`

		const emailData = {
			from: 'Should I reserve feedback <onboarding@resend.dev>',
			to: 'tweeres04@gmail.com',
			subject: 'Should I reserve feedback',
			html: emailHtml,
			text: emailText,
			...(body.email && { replyTo: body.email }),
		}

		const { error } = await resend.emails.send(emailData)

		if (error) {
			console.error('Resend API error:', error)
			return NextResponse.json(
				{ success: false, error: 'Failed to send email' },
				{ status: 500 },
			)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Unexpected error in feedback API:', error)
		return NextResponse.json(
			{ success: false, error: 'An unexpected error occurred' },
			{ status: 500 },
		)
	}
}
