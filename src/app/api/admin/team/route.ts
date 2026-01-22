import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// POST - Add team member to organization (Org Admin only)
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
        const { email, password, name } = body;

        if (!email || !password) {
            return NextResponse.json({
                error: 'Email and password are required'
            }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({
                error: 'User with this email already exists'
            }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new team member
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            role: 'user',
            organizationId: admin.organizationId // Inherit org from admin
        });

        console.log(`[Org Admin] Added team member: ${email} to organization: ${admin.organizationId}`);

        return NextResponse.json({
            success: true,
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error: any) {
        console.error('[Org Admin] Add team member error:', error);
        return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
    }
}

// GET - List team members (Org Admin only)
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

        // Get all users in the same organization
        const teamMembers = await User.find({
            organizationId: admin.organizationId,
            role: 'user' // Only regular users, not admins
        }).select('-password').sort({ createdAt: -1 });

        return NextResponse.json({ teamMembers });
    } catch (error: any) {
        console.error('[Org Admin] GET team members error:', error);
        return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
    }
}
