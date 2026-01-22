import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * POST /api/v1/labs/:purchaseId/launch
 * Launch a purchased lab
 * Requires authentication with 'labs:read' scope
 */
export const POST = withAuth(
    async (request: NextRequest, auth, context: any) => {
        await dbConnect();

        const { purchaseId } = context.params;

        if (!purchaseId) {
            throw Errors.badRequest('Purchase ID is required');
        }

        const userId = auth?.userId;
        if (!userId) {
            throw Errors.unauthorized('User ID not found in authentication');
        }

        try {
            // Find user and purchased lab
            const user = await User.findById(userId);

            if (!user) {
                throw Errors.notFound('User not found');
            }

            const purchasedLab = user.purchasedLabs.id(purchaseId);

            if (!purchasedLab) {
                throw Errors.notFound('Purchased lab not found');
            }

            // Check if access has expired
            if (purchasedLab.accessExpiresAt && new Date() > purchasedLab.accessExpiresAt) {
                throw Errors.forbidden('Lab access has expired');
            }

            // Check if launch limit reached
            if (purchasedLab.launchCount >= purchasedLab.maxLaunches) {
                throw Errors.forbidden('Maximum launch limit reached');
            }

            // Check if there's already an active session
            if (purchasedLab.activeSession && purchasedLab.activeSession.status === 'active') {
                // Return existing session
                return createApiResponse({
                    labId: purchasedLab.activeSession.id,
                    status: 'active',
                    labUrl: `/lab/${userId}/${purchaseId}/connect`,
                    credentials: {
                        username: purchasedLab.activeSession.guacamoleUsername || 'lab-user',
                        password: purchasedLab.activeSession.guacamolePassword || 'auto-generated',
                    },
                    azurePortal: purchasedLab.activeSession.azureUsername ? {
                        username: purchasedLab.activeSession.azureUsername,
                        password: purchasedLab.activeSession.azurePassword,
                        resourceGroup: purchasedLab.activeSession.azureResourceGroup,
                    } : undefined,
                    expiresAt: purchasedLab.activeSession.expiresAt,
                    message: 'Returning existing active session',
                });
            }

            // Create new session
            const sessionExpiresAt = new Date();
            sessionExpiresAt.setHours(sessionExpiresAt.getHours() + purchasedLab.sessionDurationHours);

            const labId = `lab-${userId}-${purchasedLab.courseId}-${Date.now()}`;

            // Update purchased lab with new session
            purchasedLab.activeSession = {
                id: labId,
                vmName: `vm-${labId}`,
                guacamoleConnectionId: `conn-${Date.now()}`,
                guacamoleUsername: 'lab-user',
                guacamolePassword: generatePassword(),
                guacamoleAuthToken: generateToken(),
                azureUsername: `lab-user-${Date.now()}@hexalabs.online`,
                azurePassword: generatePassword(),
                azureObjectId: `obj-${Date.now()}`,
                azureResourceGroup: `rg-${labId}`,
                status: 'provisioning',
                startTime: new Date(),
                expiresAt: sessionExpiresAt,
            };

            // Increment launch count
            purchasedLab.launchCount += 1;
            purchasedLab.lastAccessedAt = new Date();

            // Add to launch history
            purchasedLab.launchHistory.push({
                launchedAt: new Date(),
                closedAt: null as any,
                duration: 0,
            });

            await user.save();

            // In production, this would trigger Azure VM provisioning
            // For now, return provisioning status
            return createApiResponse(
                {
                    labId,
                    status: 'provisioning',
                    estimatedReadyTime: '2-3 minutes',
                    labUrl: `/lab/${userId}/${purchaseId}/connect`,
                    credentials: {
                        username: purchasedLab.activeSession.guacamoleUsername,
                        password: purchasedLab.activeSession.guacamolePassword,
                    },
                    azurePortal: {
                        username: purchasedLab.activeSession.azureUsername,
                        password: purchasedLab.activeSession.azurePassword,
                        resourceGroup: purchasedLab.activeSession.azureResourceGroup,
                    },
                    expiresAt: sessionExpiresAt,
                    remainingLaunches: purchasedLab.maxLaunches - purchasedLab.launchCount,
                },
                201,
                'Lab launch initiated'
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Labs API] Launch error:', error);
            throw Errors.databaseError('Failed to launch lab');
        }
    },
    { requiredScope: 'labs:read' }
);

/**
 * DELETE /api/v1/labs/:purchaseId/launch
 * Terminate active lab session
 */
export const DELETE = withAuth(
    async (request: NextRequest, auth, context: any) => {
        await dbConnect();

        const { purchaseId } = context.params;

        if (!purchaseId) {
            throw Errors.badRequest('Purchase ID is required');
        }

        const userId = auth?.userId;
        if (!userId) {
            throw Errors.unauthorized('User ID not found in authentication');
        }

        try {
            const user = await User.findById(userId);

            if (!user) {
                throw Errors.notFound('User not found');
            }

            const purchasedLab = user.purchasedLabs.id(purchaseId);

            if (!purchasedLab) {
                throw Errors.notFound('Purchased lab not found');
            }

            if (!purchasedLab.activeSession || purchasedLab.activeSession.status !== 'active') {
                throw Errors.badRequest('No active session to terminate');
            }

            // Calculate session duration
            const startTime = purchasedLab.activeSession.startTime;
            const endTime = new Date();
            const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

            // Update launch history
            const lastLaunch = purchasedLab.launchHistory[purchasedLab.launchHistory.length - 1];
            if (lastLaunch && !lastLaunch.closedAt) {
                lastLaunch.closedAt = endTime;
                lastLaunch.duration = durationMinutes;
            }

            // Update total time spent
            purchasedLab.totalTimeSpent += durationMinutes;

            // Clear active session
            purchasedLab.activeSession.status = 'terminated';

            await user.save();

            // In production, this would trigger Azure VM deletion
            return createApiResponse(
                {
                    message: 'Lab session terminated successfully',
                    sessionDuration: durationMinutes,
                    totalTimeSpent: purchasedLab.totalTimeSpent,
                },
                200
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Labs API] Terminate error:', error);
            throw Errors.databaseError('Failed to terminate lab session');
        }
    },
    { requiredScope: 'labs:write' }
);

// Helper functions
function generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
