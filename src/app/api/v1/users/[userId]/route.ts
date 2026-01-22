import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import { createApiResponse } from '@/lib/api-response';
import { Errors } from '@/lib/api-errors';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * GET /api/v1/users/:userId
 * Get user profile
 * Requires authentication
 */
export const GET = withAuth(
    async (request: NextRequest, auth, context: any) => {
        await dbConnect();

        const { userId } = context.params;

        if (!userId) {
            throw Errors.badRequest('User ID is required');
        }

        // Verify user can access this profile
        // Users can view their own profile, admins can view any profile
        const requestingUserId = auth?.userId;
        const isAdmin = auth?.scopes?.includes('admin:all');

        if (userId !== requestingUserId && !isAdmin) {
            throw Errors.forbidden('You can only view your own profile');
        }

        try {
            const user = await User.findById(userId)
                .select('-password -purchasedLabs.activeSession.guacamolePassword -purchasedLabs.activeSession.azurePassword')
                .populate('organizationId', 'name slug contactEmail')
                .lean();

            if (!user) {
                throw Errors.notFound('User not found');
            }

            // Format response
            const response = {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                oauthProvider: user.oauthProvider,
                organization: user.organizationId ? {
                    id: (user.organizationId as any)._id,
                    name: (user.organizationId as any).name,
                    slug: (user.organizationId as any).slug,
                } : null,
                stats: {
                    totalLabsPurchased: user.purchasedLabs?.length || 0,
                    activeLabs: user.purchasedLabs?.filter((lab: any) =>
                        lab.accessExpiresAt && new Date(lab.accessExpiresAt) > new Date()
                    ).length || 0,
                },
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };

            return createApiResponse(response);
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            console.error('[Users API] Get profile error:', error);
            throw Errors.databaseError('Failed to fetch user profile');
        }
    },
    { requiredScope: 'users:read' }
);

/**
 * PATCH /api/v1/users/:userId
 * Update user profile
 * Requires authentication
 */
export const PATCH = withAuth(
    async (request: NextRequest, auth, context: any) => {
        await dbConnect();

        const { userId } = context.params;

        if (!userId) {
            throw Errors.badRequest('User ID is required');
        }

        // Verify user can update this profile
        const requestingUserId = auth?.userId;
        const isAdmin = auth?.scopes?.includes('admin:all');

        if (userId !== requestingUserId && !isAdmin) {
            throw Errors.forbidden('You can only update your own profile');
        }

        const body = await request.json();
        const { name, email } = body;

        // Validate allowed fields
        const allowedUpdates: any = {};
        if (name) allowedUpdates.name = name;
        if (email) allowedUpdates.email = email;

        if (Object.keys(allowedUpdates).length === 0) {
            throw Errors.validationError('No valid fields to update', {
                allowedFields: ['name', 'email']
            });
        }

        try {
            // Check if email already exists (if updating email)
            if (email) {
                const existingUser = await User.findOne({
                    email,
                    _id: { $ne: new mongoose.Types.ObjectId(userId) }
                });

                if (existingUser) {
                    throw Errors.conflict('Email already in use');
                }
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { $set: allowedUpdates },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                throw Errors.notFound('User not found');
            }

            return createApiResponse(
                {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    updatedAt: user.updatedAt,
                },
                200,
                'Profile updated successfully'
            );
        } catch (error: any) {
            if (error.name === 'ApiError') {
                throw error;
            }
            if (error.code === 11000) {
                throw Errors.conflict('Email already in use');
            }
            console.error('[Users API] Update profile error:', error);
            throw Errors.databaseError('Failed to update user profile');
        }
    },
    { requiredScope: 'users:write' }
);
