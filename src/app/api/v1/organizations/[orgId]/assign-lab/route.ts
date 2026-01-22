import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Organization from '@/models/Organization';
import User from '@/models/User';
import Lab from '@/models/Lab';
import mongoose from 'mongoose';

/**
 * POST /api/v1/organizations/:orgId/assign-lab
 * Assign lab license to organization member
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

        // Admin or org admin
        const requestingUser = await User.findById(auth?.userId);
        const isAdmin = auth?.scopes?.includes('admin:all');
        const isOrgAdmin = requestingUser?.role === 'org_admin' &&
            requestingUser?.organizationId?.toString() === orgId;

        if (!isAdmin && !isOrgAdmin) {
            throw Errors.forbidden('Admin or organization admin access required');
        }

        const body = await request.json();
        const { userId, labCode } = body;

        if (!userId) {
            throw Errors.validationError('User ID is required', { field: 'userId' });
        }

        if (!labCode) {
            throw Errors.validationError('Lab code is required', { field: 'labCode' });
        }

        try {
            // Get organization
            const organization = await Organization.findById(orgId);
            if (!organization) {
                throw Errors.notFound('Organization not found');
            }

            // Get user
            const user = await User.findById(userId);
            if (!user) {
                throw Errors.notFound('User not found');
            }

            // Verify user is member of organization
            if (user.organizationId?.toString() !== orgId) {
                throw Errors.forbidden('User is not a member of this organization');
            }

            // Get lab
            const lab = await Lab.findOne({ code: labCode });
            if (!lab) {
                throw Errors.notFound(`Lab with code '${labCode}' not found`);
            }

            // Check if organization has license for this lab
            const license = organization.labLicenses?.find(
                (l: any) => l.courseId === labCode
            );

            if (!license) {
                throw Errors.notFound('Organization does not have licenses for this lab');
            }

            // Check if license is expired
            if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
                throw Errors.forbidden('Organization license for this lab has expired');
            }

            // Check if licenses are available
            if (license.usedLicenses >= license.totalLicenses) {
                throw Errors.forbidden('No available licenses for this lab');
            }

            // Check if user already has this lab
            const existingLab = user.purchasedLabs?.find(
                (l: any) => l.courseId === labCode
            );

            if (existingLab) {
                throw Errors.conflict('User already has access to this lab');
            }

            // Assign lab to user
            const accessExpiresAt = license.expiresAt || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

            user.purchasedLabs.push({
                courseId: labCode,
                purchaseDate: new Date(),
                accessExpiresAt,
                launchCount: 0,
                maxLaunches: 10,
                sessionDurationHours: 4,
                totalTimeSpent: 0,
                launchHistory: [],
                taskProgress: {
                    completedTasks: [],
                    currentTaskIndex: 0,
                },
            } as any);

            await user.save();

            // Increment used licenses
            license.usedLicenses += 1;
            await organization.save();

            return createApiResponse(
                {
                    userId: user._id,
                    userName: user.name,
                    labCode,
                    labTitle: lab.title,
                    accessExpiresAt,
                    organizationLicenses: {
                        total: license.totalLicenses,
                        used: license.usedLicenses,
                        available: license.totalLicenses - license.usedLicenses,
                    },
                },
                201,
                'Lab assigned successfully'
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Organizations API] Assign lab error:', error);
            throw Errors.databaseError('Failed to assign lab');
        }
    },
    { requiredScope: 'organizations:write' }
);
