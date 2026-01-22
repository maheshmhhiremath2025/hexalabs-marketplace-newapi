import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'hexalabsmktplace@gmail.com',
        pass: 'gxgjsudlelawgwwo', // App password without spaces
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: '"Hexalabs" <hexalabsmktplace@gmail.com>',
            to,
            subject,
            html,
            text: text || '', // Fallback plain text
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

export default transporter;
