import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createPaginatedResponse, createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Organization from '@/models/Organization';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * GET /api/v1/organizations/:orgId/members
 * List organization members
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Extract orgId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const orgId = pathParts[pathParts.length - 1];
        const { searchParams } = new URL(request.url);

        if (!orgId) {
            throw Errors.badRequest('Organization ID is required');
        }

        // Permission check
        const requestingUser = await User.findById(auth?.userId);
        const isAdmin = auth?.scopes?.includes('admin:all');
        const isMember = requestingUser?.organizationId?.toString() === orgId;

        if (!isAdmin && !isMember) {
            throw Errors.forbidden('You must be a member of this organization');
        }

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const skip = (page - 1) * limit;

        // Filters
        const role = searchParams.get('role'); // org_admin, org_member

        const query: any = { organizationId: new mongoose.Types.ObjectId(orgId) };
        if (role) {
            query.role = role;
        }

        try {
            const total = await User.countDocuments(query);

            const members = await User.find(query)
                .select('name email role createdAt purchasedLabs')
                .skip(skip)
                .limit(limit)
                .lean();

            const formattedMembers = members.map((member: any) => ({
                id: member._id,
                name: member.name,
                email: member.email,
                role: member.role,
                labsCount: member.purchasedLabs?.length || 0,
                activeLabs: member.purchasedLabs?.filter((lab: any) =>
                    lab.accessExpiresAt && new Date(lab.accessExpiresAt) > new Date()
                ).length || 0,
                joinedAt: member.createdAt,
            }));

            return createPaginatedResponse(formattedMembers, page, limit, total);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Organizations API] List members error:', error);
            throw Errors.databaseError('Failed to fetch organization members');
        }
    },
    { requiredScope: 'organizations:read' }
);

/**
 * POST /api/v1/organizations/:orgId/members
 * Add member to organization (admin only)
 */
export const POST = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Extract orgId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const orgId = pathParts[pathParts.length - 1];

        if (!orgId) {
            throw Errors.badRequest('Organization ID is required');
        }

        // Admin only
        if (!auth?.scopes?.includes('admin:all')) {
            throw Errors.forbidden('Admin access required to add members');
        }

        const body = await request.json();
        const { userId, role = 'org_member' } = body;

        if (!userId) {
            throw Errors.validationError('User ID is required', { field: 'userId' });
        }

        const validRoles = ['org_admin', 'org_member'];
        if (!validRoles.includes(role)) {
            throw Errors.validationError('Invalid role', {
                field: 'role',
                validValues: validRoles,
            });
        }

        try {
            // Check organization exists
            const organization = await Organization.findById(orgId);
            if (!organization) {
                throw Errors.notFound('Organization not found');
            }

            // Check user exists
            const user = await User.findById(userId);
            if (!user) {
                throw Errors.notFound('User not found');
            }

            // Check if user is already in an organization
            if (user.organizationId) {
                throw Errors.conflict('User is already a member of another organization');
            }

            // Add user to organization
            user.organizationId = new mongoose.Types.ObjectId(orgId);
            user.role = role;
            await user.save();

            return createApiResponse(
                {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organizationId: orgId,
                },
                201,
                'Member added successfully'
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Organizations API] Add member error:', error);
            throw Errors.databaseError('Failed to add member');
        }
    },
    { requiredScope: 'admin:all' }
);
