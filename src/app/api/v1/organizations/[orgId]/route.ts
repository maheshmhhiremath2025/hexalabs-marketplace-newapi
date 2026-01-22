import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Organization from '@/models/Organization';
import User from '@/models/User';

/**
 * GET /api/v1/organizations/:orgId
 * Get organization details
 */
export const GET = withAuth(
    async (request: NextRequest, auth) => {
        await dbConnect();

        // Extract orgId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const orgId = pathParts[pathParts.length - 1];

        if (!orgId) {
            throw Errors.badRequest('Organization ID is required');
        }

        try {
            const organization = await Organization.findById(orgId).lean();

            if (!organization) {
                throw Errors.notFound('Organization not found');
            }

            // Permission check - user must be member of org or admin
            const user = await User.findById(auth?.userId);
            const isAdmin = auth?.scopes?.includes('admin:all');
            const isMember = user?.organizationId?.toString() === orgId;

            if (!isAdmin && !isMember) {
                throw Errors.forbidden('You must be a member of this organization');
            }

            // Get member count
            const memberCount = await User.countDocuments({ organizationId: orgId });

            // Calculate total licenses
            const totalLicenses = organization.labLicenses?.reduce(
                (sum: number, license: any) => sum + (license.totalLicenses || 0),
                0
            ) || 0;

            const usedLicenses = organization.labLicenses?.reduce(
                (sum: number, license: any) => sum + (license.usedLicenses || 0),
                0
            ) || 0;

            return createApiResponse({
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
                contactEmail: organization.contactEmail,
                isActive: organization.isActive,
                memberCount,
                licenses: {
                    total: totalLicenses,
                    used: usedLicenses,
                    available: totalLicenses - usedLicenses,
                },
                labLicenses: organization.labLicenses?.map((license: any) => ({
                    courseId: license.courseId,
                    totalLicenses: license.totalLicenses,
                    usedLicenses: license.usedLicenses,
                    availableLicenses: license.totalLicenses - license.usedLicenses,
                    purchaseDate: license.purchaseDate,
                    expiresAt: license.expiresAt,
                    isExpired: license.expiresAt && new Date(license.expiresAt) < new Date(),
                })),
                billingInfo: organization.billingInfo,
                zohoCustomer: organization.zohoCustomerId ? {
                    customerId: organization.zohoCustomerId,
                    customerName: organization.zohoCustomerName,
                } : null,
                createdAt: organization.createdAt,
                updatedAt: organization.updatedAt,
            });
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Organizations API] Get organization error:', error);
            throw Errors.databaseError('Failed to fetch organization details');
        }
    },
    { requiredScope: 'organizations:read' }
);

/**
 * PATCH /api/v1/organizations/:orgId
 * Update organization details (admin only)
 */
export const PATCH = withAuth(
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
            throw Errors.forbidden('Admin access required to update organizations');
        }

        const body = await request.json();
        const { name, contactEmail, isActive, billingInfo } = body;

        const updates: any = {};
        if (name) updates.name = name;
        if (contactEmail) updates.contactEmail = contactEmail;
        if (typeof isActive === 'boolean') updates.isActive = isActive;
        if (billingInfo) updates.billingInfo = billingInfo;

        if (Object.keys(updates).length === 0) {
            throw Errors.validationError('No valid fields to update');
        }

        try {
            const organization = await Organization.findByIdAndUpdate(
                orgId,
                { $set: updates },
                { new: true, runValidators: true }
            ).lean();

            if (!organization) {
                throw Errors.notFound('Organization not found');
            }

            return createApiResponse(
                {
                    id: organization._id,
                    name: organization.name,
                    contactEmail: organization.contactEmail,
                    isActive: organization.isActive,
                    updatedAt: organization.updatedAt,
                },
                200,
                'Organization updated successfully'
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Organizations API] Update organization error:', error);
            throw Errors.databaseError('Failed to update organization');
        }
    },
    { requiredScope: 'admin:all' }
);
