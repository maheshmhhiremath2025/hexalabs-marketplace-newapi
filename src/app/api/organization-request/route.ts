import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { organizationName, contactName, email, phone, estimatedUsers, industry, message } = body;

        // Validate required fields
        if (!organizationName || !contactName || !email) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Send email to labs@hexalabs.online
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Organization Account Request</h2>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Organization Details</h3>
                    <p><strong>Organization Name:</strong> ${organizationName}</p>
                    <p><strong>Contact Person:</strong> ${contactName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                    <p><strong>Estimated Users:</strong> ${estimatedUsers || 'Not specified'}</p>
                    <p><strong>Industry:</strong> ${industry || 'Not specified'}</p>
                </div>

                ${message ? `
                    <div style="margin: 20px 0;">
                        <h3>Message:</h3>
                        <p style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb;">
                            ${message}
                        </p>
                    </div>
                ` : ''}

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                    <p>Submitted: ${new Date().toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'short'
        })}</p>
                </div>
            </div>
        `;

        await sendEmail({
            to: 'labs@hexalabs.online', // Send to Hexalabs admin email
            subject: `New Organization Request: ${organizationName}`,
            html: emailHtml,
        });

        console.log(`[Org Request] New request from ${organizationName} (${email})`);

        return NextResponse.json({
            success: true,
            message: 'Request submitted successfully. We will contact you soon!',
        });
    } catch (error: any) {
        console.error('[Org Request] Error:', error);
        return NextResponse.json(
            { error: 'Failed to submit request' },
            { status: 500 }
        );
    }
}
