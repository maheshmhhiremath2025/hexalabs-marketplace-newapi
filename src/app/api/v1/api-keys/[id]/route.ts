import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
<parameter name="authOptions" > from '@/lib/auth';
import dbConnect from '@/lib/db';
import { revokeApiKey, updateApiKey } from '@/lib/api-keys';

/**
 * PATCH /api/v1/api-keys/[id]
 * Update an API key
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const apiKeyId = params.id;

        // Parse request body
        const body = await request.json();
        const { name, description, scopes, allowedIPs } = body;

        // Update API key
        const result = await updateApiKey(apiKeyId, userId, {
            name,
            description,
            scopes,
            allowedIPs,
        });

        return NextResponse.json({
            success: true,
            message: 'API key updated successfully',
            data: result.apiKey,
        });
    } catch (error: any) {
        console.error('[API Keys] PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update API key', message: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/v1/api-keys/[id]
 * Revoke an API key
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const apiKeyId = params.id;

        // Revoke API key
        await revokeApiKey(apiKeyId, userId);

        return NextResponse.json({
            success: true,
            message: 'API key revoked successfully',
        });
    } catch (error: any) {
        console.error('[API Keys] DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to revoke API key', message: error.message },
            { status: 500 }
        );
    }
}
