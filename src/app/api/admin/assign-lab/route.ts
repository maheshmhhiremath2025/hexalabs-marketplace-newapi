import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';

// POST - Assign lab to team member (Org Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // @ts-ignore
        const admin = await User.findById(session.user.id);

        if (admin?.role !== 'org_admin' && admin?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, courseId } = body;

        if (!userId || !courseId) {
            return NextResponse.json({
                error: 'User ID and Course ID are required'
            }, { status: 400 });
        }

        // Get organization
        const organization = await Organization.findById(admin.organizationId);
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Find the license for this course
        const license = organization.labLicenses.find((l: any) => l.courseId === courseId);
        if (!license) {
            return NextResponse.json({
                error: 'No licenses available for this course'
            }, { status: 400 });
        }

        // Check if licenses are available
        if (license.usedLicenses >= license.totalLicenses) {
            return NextResponse.json({
                error: 'No available licenses. Please purchase more.'
            }, { status: 400 });
        }

        // Check if license has expired
        if (new Date(license.expiresAt) < new Date()) {
            return NextResponse.json({
                error: 'License has expired'
            }, { status: 400 });
        }

        // Get the user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user belongs to same organization
        if (user.organizationId?.toString() !== admin.organizationId?.toString()) {
            return NextResponse.json({
                error: 'User does not belong to your organization'
            }, { status: 403 });
        }

        // Check if user already has this lab
        const existingLab = user.purchasedLabs?.find((lab: any) => lab.courseId === courseId);
        if (existingLab) {
            return NextResponse.json({
                error: 'User already has this lab assigned'
            }, { status: 400 });
        }

        // Assign lab to user
        user.purchasedLabs = user.purchasedLabs || [];
        user.purchasedLabs.push({
            courseId,
            purchaseDate: new Date(),
            accessExpiresAt: license.expiresAt, // Same as license expiry
            launchCount: 0,
            maxLaunches: 10,
            sessionDurationHours: 4
        });

        await user.save();

        // Increment used licenses
        license.usedLicenses += 1;
        await organization.save();

        console.log(`[Org Admin] Assigned ${courseId} to user ${user.email} (${license.usedLicenses}/${license.totalLicenses} used)`);

        // Send course assignment email to user
        try {
            const { sendEmail } = await import('@/lib/email');
            const { getCourseAssignmentTemplate } = await import('@/lib/email-templates/course-assignment');

            const assignmentData = {
                userName: user.name,
                userEmail: user.email,
                courseId,
                courseName: `${courseId.toUpperCase()} - Microsoft Certification Lab`,
                maxLaunches: 10,
                expiryDate: new Date(license.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                organizationName: organization.name,
            };

            const html = getCourseAssignmentTemplate(assignmentData);

            await sendEmail({
                to: user.email,
                subject: `🎉 New Lab Assigned: ${courseId.toUpperCase()}`,
                html,
            });

            console.log(`[Email] Course assignment notification sent to ${user.email}`);
        } catch (emailError) {
            console.error('[Email] Failed to send assignment notification:', emailError);
            // Don't fail the assignment if email fails
        }

        return NextResponse.json({
            success: true,
            message: 'Lab assigned successfully',
            license: {
                courseId: license.courseId,
                used: license.usedLicenses,
                total: license.totalLicenses,
                available: license.totalLicenses - license.usedLicenses
            }
        });
    } catch (error: any) {
        console.error('[Org Admin] Assign lab error:', error);
        return NextResponse.json({ error: 'Failed to assign lab' }, { status: 500 });
    }
}
