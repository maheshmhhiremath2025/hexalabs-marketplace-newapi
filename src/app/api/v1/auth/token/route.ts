import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { validateApiKey } from '@/lib/api-keys';
import { generateTokenPair, validateRefreshToken, generateAccessToken } from '@/lib/jwt';

/**
 * POST /api/v1/auth/token
 * Exchange API key for JWT token
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { apiKey, apiSecret, grantType = 'api_key' } = body;

        // Handle different grant types
        if (grantType === 'api_key') {
            // Validate API credentials
            if (!apiKey || !apiSecret) {
                return NextResponse.json(
                    { error: 'Missing apiKey or apiSecret' },
                    { status: 400 }
                );
            }

            // Validate API key
            const validation = await validateApiKey(apiKey, apiSecret);

            if (!validation.valid) {
                return NextResponse.json(
                    { error: validation.error || 'Invalid credentials' },
                    { status: 401 }
                );
            }

            // Generate JWT token pair
            const tokens = generateTokenPair({
                userId: validation.userId!,
                organizationId: validation.organizationId,
                scopes: validation.scopes!,
                tier: validation.tier!,
            });

            return NextResponse.json({
                success: true,
                ...tokens,
            });
        } else if (grantType === 'refresh_token') {
            // Handle refresh token
            const { refreshToken } = body;

            if (!refreshToken) {
                return NextResponse.json(
                    { error: 'Missing refreshToken' },
                    { status: 400 }
                );
            }

            // Validate refresh token
            const validation = validateRefreshToken(refreshToken);

            if (!validation.valid) {
                return NextResponse.json(
                    { error: validation.error || 'Invalid refresh token' },
                    { status: 401 }
                );
            }

            // Generate new access token
            const accessToken = generateAccessToken({
                userId: validation.payload!.sub,
                organizationId: validation.payload!.org,
                scopes: validation.payload!.scopes,
                tier: validation.payload!.tier,
            });

            return NextResponse.json({
                success: true,
                accessToken,
                expiresIn: 3600,
                tokenType: 'Bearer',
            });
        } else {
            return NextResponse.json(
                { error: `Unsupported grant_type: ${grantType}` },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('[Auth Token] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate token', message: error.message },
            { status: 500 }
        );
    }
}
