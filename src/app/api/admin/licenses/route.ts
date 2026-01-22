import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Organization from '@/models/Organization';

// GET - Get organization licenses (Org Admin only)
export async function GET(request: NextRequest) {
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

        // Get organization
        const organization = await Organization.findById(admin.organizationId);
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        return NextResponse.json({
            licenses: organization.labLicenses || []
        });
    } catch (error: any) {
        console.error('[Org Admin] GET licenses error:', error);
        return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
    }
}
