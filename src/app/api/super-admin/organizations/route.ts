import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Organization from '@/models/Organization';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// GET - List all organizations (Super Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        if (user?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
        }

        const organizations = await Organization.find().sort({ createdAt: -1 });

        return NextResponse.json({ organizations });
    } catch (error: any) {
        console.error('[Super Admin] GET organizations error:', error);
        return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
    }
}

// POST - Create new organization (Super Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id);

        if (user?.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
        }

        const body = await request.json();
        const { name, adminEmail, adminName, adminPassword } = body;

        if (!name || !adminEmail || !adminPassword) {
            return NextResponse.json({
                error: 'Organization name, admin email, and password are required'
            }, { status: 400 });
        }

        // Check if organization already exists
        const existingOrg = await Organization.findOne({
            $or: [
                { name: name },
                { contactEmail: adminEmail }
            ]
        });

        if (existingOrg) {
            return NextResponse.json({
                error: 'Organization with this name or email already exists'
            }, { status: 400 });
        }

        // Check if admin user already exists
        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            return NextResponse.json({
                error: 'User with this email already exists'
            }, { status: 400 });
        }

        // Create organization
        const organization = await Organization.create({
            name,
            contactEmail: adminEmail,
            isActive: true,
            labLicenses: []
        });

        // Create admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminUser = await User.create({
            email: adminEmail,
            password: hashedPassword,
            name: adminName || name + ' Admin',
            role: 'org_admin',
            organizationId: organization._id
        });

        console.log(`[Super Admin] Created organization: ${name} with admin: ${adminEmail}`);

        return NextResponse.json({
            success: true,
            organization: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
                contactEmail: organization.contactEmail
            },
            admin: {
                id: adminUser._id,
                email: adminUser.email,
                name: adminUser.name
            }
        });
    } catch (error: any) {
        console.error('[Super Admin] POST organization error:', error);
        return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
    }
}
