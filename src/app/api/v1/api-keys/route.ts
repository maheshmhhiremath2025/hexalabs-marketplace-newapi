import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { generateApiKey, listApiKeys, revokeApiKey, updateApiKey } from '@/lib/api-keys';

/**
 * GET /api/v1/api-keys
 * List all API keys for the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // @ts-ignore
        const userId = session.user.id;

        // Get user's API keys
        const apiKeys = await listApiKeys(userId);

        return NextResponse.json({
            success: true,
            data: apiKeys,
            total: apiKeys.length,
        });
    } catch (error: any) {
        console.error('[API Keys] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch API keys', message: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/v1/api-keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // @ts-ignore
        const userId = session.user.id;

        // Parse request body
        const body = await request.json();
        const {
            name,
            description,
            scopes,
            tier,
            environment,
            expiresInDays,
        } = body;

        // Validate required fields
        if (!name || !scopes || !Array.isArray(scopes) || scopes.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: name, scopes' },
                { status: 400 }
            );
        }

        // Validate scopes
        const validScopes = [
            'labs:read', 'labs:write', 'labs:delete',
            'users:read', 'users:write',
            'orders:read', 'orders:write',
            'organizations:read', 'organizations:write',
            'analytics:read',
            'webhooks:read', 'webhooks:write',
            'admin:all',
        ];

        const invalidScopes = scopes.filter((s: string) => !validScopes.includes(s));
        if (invalidScopes.length > 0) {
            return NextResponse.json(
                { error: `Invalid scopes: ${invalidScopes.join(', ')}` },
                { status: 400 }
            );
        }

        // Generate API key
        const apiKey = await generateApiKey({
            userId,
            name,
            description,
            scopes,
            tier: tier || 'free',
            environment: environment || 'production',
            expiresInDays,
        });

        return NextResponse.json({
            success: true,
            message: 'API key created successfully',
            data: apiKey,
            warning: 'Save the API secret now - it will not be shown again!',
        }, { status: 201 });
    } catch (error: any) {
        console.error('[API Keys] POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create API key', message: error.message },
            { status: 500 }
        );
    }
}
