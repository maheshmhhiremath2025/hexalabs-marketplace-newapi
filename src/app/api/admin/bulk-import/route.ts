import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { parseUserCSV } from '@/lib/csv-parser';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin or super admin
        if (!session?.user || !['org_admin', 'super_admin'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const organizationId = formData.get('organizationId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Read CSV content
        const csvContent = await file.text();

        // Parse and validate CSV
        const { valid, errors } = parseUserCSV(csvContent);

        if (valid.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No valid users found in CSV',
                errors,
            }, { status: 400 });
        }

        await dbConnect();

        // Get organization for org_admin
        let targetOrgId = organizationId;
        if ((session.user as any).role === 'org_admin') {
            const admin = await User.findOne({ email: session.user.email });
            targetOrgId = admin?.organizationId?.toString();

            if (!targetOrgId) {
                return NextResponse.json({ error: 'Admin not associated with organization' }, { status: 400 });
            }
        }

        // ENTERPRISE VALIDATION: Check for existing users BEFORE creating any
        const emailsToCheck = valid.map(u => u.email);
        const existingUsers = await User.find({ email: { $in: emailsToCheck } }).select('email');
        const existingEmails = new Set(existingUsers.map(u => u.email));

        if (existingEmails.size > 0) {
            const duplicates = valid.filter(u => existingEmails.has(u.email));
            return NextResponse.json({
                success: false,
                message: `Cannot import: ${duplicates.length} user(s) already exist in the system`,
                duplicates: duplicates.map(u => u.email),
                error: 'DUPLICATE_USERS',
            }, { status: 400 });
        }

        const results = {
            success: [] as string[],
            failed: [] as { email: string; error: string }[],
        };

        // Create users (all at once for better performance)
        const usersToCreate = [];
        const passwords: { [email: string]: string } = {};

        for (const userData of valid) {
            // Generate random password
            const password = Math.random().toString(36).slice(-12) + 'A1!';
            const hashedPassword = await bcrypt.hash(password, 10);
            passwords[userData.email] = password;

            usersToCreate.push({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                organizationId: targetOrgId || null,
            });
        }

        try {
            // Bulk insert for better performance
            const createdUsers = await User.insertMany(usersToCreate);

            // Send welcome emails
            for (const user of createdUsers) {
                try {
                    await sendEmail({
                        to: user.email,
                        subject: 'Welcome to Hexalabs!',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #2563eb;">Welcome to Hexalabs!</h2>
                                <p>Your account has been created. Here are your login credentials:</p>
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <p><strong>Email:</strong> ${user.email}</p>
                                    <p><strong>Temporary Password:</strong> ${passwords[user.email]}</p>
                                </div>
                                <p><strong>Important:</strong> Please change your password after your first login.</p>
                                <p><a href="${process.env.NEXTAUTH_URL}/login" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login Now</a></p>
                            </div>
                        `,
                    });
                    results.success.push(user.email);
                } catch (emailError) {
                    console.error(`Failed to send email to ${user.email}:`, emailError);
                    results.success.push(user.email); // Still count as success even if email fails
                }
            }
        } catch (error: any) {
            console.error('[Bulk Import] Database error:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to create users in database',
                error: error.message,
            }, { status: 500 });
        }

        console.log(`[Bulk Import] Created ${results.success.length} users`);

        return NextResponse.json({
            success: true,
            message: `Successfully created ${results.success.length} users`,
            results,
            validationErrors: errors,
        });
    } catch (error: any) {
        console.error('[Bulk Import] Error:', error);
        return NextResponse.json(
            { error: 'Failed to import users' },
            { status: 500 }
        );
    }
}
