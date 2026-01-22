import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import Organization from '@/models/Organization';
import User from '@/models/User';
import Order from '@/models/Order';

/**
 * GET /api/v1/organizations/:orgId/analytics
 * Get organization analytics and statistics
 */
export const GET = withAuth(
    async (request: NextRequest, auth, context: any) => {
        await dbConnect();

        const { orgId } = context.params;

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

        try {
            const organization = await Organization.findById(orgId);

            if (!organization) {
                throw Errors.notFound('Organization not found');
            }

            // Get all members
            const members = await User.find({ organizationId: orgId });

            const totalMembers = members.length;
            const orgAdmins = members.filter(m => m.role === 'org_admin').length;
            const orgMembers = members.filter(m => m.role === 'org_member').length;

            // Calculate lab statistics
            let totalLabsAssigned = 0;
            let totalActiveLabs = 0;
            let totalLaunches = 0;
            let totalTimeSpent = 0;

            members.forEach(member => {
                const labs = member.purchasedLabs || [];
                totalLabsAssigned += labs.length;

                labs.forEach((lab: any) => {
                    if (lab.accessExpiresAt && new Date(lab.accessExpiresAt) > new Date()) {
                        totalActiveLabs++;
                    }
                    totalLaunches += lab.launchCount || 0;
                    totalTimeSpent += lab.totalTimeSpent || 0;
                });
            });

            // License statistics
            const licenses = organization.labLicenses || [];
            const totalLicenses = licenses.reduce((sum: number, l: any) => sum + (l.totalLicenses || 0), 0);
            const usedLicenses = licenses.reduce((sum: number, l: any) => sum + (l.usedLicenses || 0), 0);
            const availableLicenses = totalLicenses - usedLicenses;

            const expiredLicenses = licenses.filter((l: any) =>
                l.expiresAt && new Date(l.expiresAt) < new Date()
            ).length;

            // Get orders for this organization
            const memberIds = members.map(m => m._id);
            const orders = await Order.find({ userId: { $in: memberIds } });

            const totalOrders = orders.length;
            const completedOrders = orders.filter(o => o.status === 'completed').length;
            const totalSpent = orders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + (o.totals.total || 0), 0);

            // Most active members (by launches)
            const memberActivity = members
                .map(member => {
                    const launches = (member.purchasedLabs || []).reduce(
                        (sum: number, lab: any) => sum + (lab.launchCount || 0),
                        0
                    );
                    const timeSpent = (member.purchasedLabs || []).reduce(
                        (sum: number, lab: any) => sum + (lab.totalTimeSpent || 0),
                        0
                    );

                    return {
                        id: member._id,
                        name: member.name,
                        email: member.email,
                        labsCount: member.purchasedLabs?.length || 0,
                        launches,
                        timeSpent,
                    };
                })
                .sort((a, b) => b.launches - a.launches)
                .slice(0, 5);

            // License utilization by lab
            const licenseUtilization = licenses.map((license: any) => ({
                courseId: license.courseId,
                totalLicenses: license.totalLicenses,
                usedLicenses: license.usedLicenses,
                availableLicenses: license.totalLicenses - license.usedLicenses,
                utilizationRate: Math.round((license.usedLicenses / license.totalLicenses) * 100),
                expiresAt: license.expiresAt,
                isExpired: license.expiresAt && new Date(license.expiresAt) < new Date(),
            }));

            const analytics = {
                overview: {
                    totalMembers,
                    orgAdmins,
                    orgMembers,
                    totalLabsAssigned,
                    totalActiveLabs,
                    totalLaunches,
                    totalTimeSpent: Math.round(totalTimeSpent / 60 * 10) / 10, // hours
                    totalTimeSpentMinutes: totalTimeSpent,
                },
                licenses: {
                    totalLicenses,
                    usedLicenses,
                    availableLicenses,
                    utilizationRate: totalLicenses > 0
                        ? Math.round((usedLicenses / totalLicenses) * 100)
                        : 0,
                    expiredLicenses,
                    activeLicenses: licenses.length - expiredLicenses,
                },
                orders: {
                    totalOrders,
                    completedOrders,
                    totalSpent,
                    averageOrderValue: totalOrders > 0
                        ? Math.round(totalSpent / totalOrders * 100) / 100
                        : 0,
                },
                usage: {
                    averageLabsPerMember: totalMembers > 0
                        ? Math.round(totalLabsAssigned / totalMembers * 10) / 10
                        : 0,
                    averageLaunchesPerMember: totalMembers > 0
                        ? Math.round(totalLaunches / totalMembers * 10) / 10
                        : 0,
                    averageTimePerMember: totalMembers > 0
                        ? Math.round(totalTimeSpent / totalMembers)
                        : 0,
                },
                topMembers: memberActivity,
                licenseUtilization,
            };

            return createApiResponse(analytics);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Organizations API] Get analytics error:', error);
            throw Errors.databaseError('Failed to fetch organization analytics');
        }
    },
    { requiredScope: 'organizations:read' }
);
