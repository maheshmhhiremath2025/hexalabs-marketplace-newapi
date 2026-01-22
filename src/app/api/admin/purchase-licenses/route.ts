import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';

// POST - Purchase lab licenses (Org Admin only)
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
        const { courseId, quantity, duration } = body;

        if (!courseId || !quantity || !duration) {
            return NextResponse.json({
                error: 'Course ID, quantity, and duration are required'
            }, { status: 400 });
        }

        if (quantity < 1) {
            return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
        }

        if (![90, 180, 365].includes(duration)) {
            return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
        }

        // Get organization
        const organization = await Organization.findById(admin.organizationId);
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);

        // Check if license already exists for this course
        const existingLicense = organization.labLicenses.find((l: any) => l.courseId === courseId);

        if (existingLicense) {
            // Add to existing license
            existingLicense.totalLicenses += quantity;
            // Extend expiry if new expiry is later
            if (new Date(existingLicense.expiresAt) < expiresAt) {
                existingLicense.expiresAt = expiresAt;
            }
        } else {
            // Create new license
            organization.labLicenses.push({
                courseId,
                totalLicenses: quantity,
                usedLicenses: 0,
                purchaseDate: new Date(),
                expiresAt
            });
        }

        await organization.save();

        console.log(`[Org Admin] Purchased ${quantity} x ${courseId} licenses for ${duration} days`);

        return NextResponse.json({
            success: true,
            message: `Successfully purchased ${quantity} licenses`,
            license: {
                courseId,
                quantity,
                duration,
                expiresAt
            }
        });
    } catch (error: any) {
        console.error('[Org Admin] Purchase licenses error:', error);
        return NextResponse.json({ error: 'Failed to purchase licenses' }, { status: 500 });
    }
}
