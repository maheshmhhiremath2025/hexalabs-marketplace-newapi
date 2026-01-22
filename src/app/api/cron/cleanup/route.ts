import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { labManager } from '@/lib/azure/lab-manager';

// This endpoint should be called by a cron job (e.g., Vercel Cron or external scheduler)
// Protect with a secret token
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-token-here';

export async function POST(request: NextRequest) {
    try {
        // Verify authorization
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Find all users with expired sessions
        const now = new Date();
        const users = await User.find({
            'purchasedLabs.activeSession.expiresAt': { $lt: now }
        });

        let cleanedCount = 0;

        for (const user of users) {
            for (const lab of user.purchasedLabs) {
                if (lab.activeSession && lab.activeSession.expiresAt < now) {
                    const resourceGroupName = lab.activeSession.id;

                    console.log(`[Cleanup] Deleting expired lab: ${resourceGroupName} for user ${user.email}`);

                    // Calculate usage
                    const sessionStart = lab.activeSession.startTime || new Date();
                    const durationMinutes = Math.floor((now.getTime() - sessionStart.getTime()) / 60000);

                    // Delete Azure resources
                    try {
                        await labManager.deleteLab(resourceGroupName);
                    } catch (error) {
                        console.error(`[Cleanup] Failed to delete ${resourceGroupName}:`, error);
                    }

                    // Update usage tracking
                    const today = now.toDateString();
                    if (!user.dailyUsageReset || user.dailyUsageReset !== today) {
                        user.dailyUsageMinutes = 0;
                        user.dailyUsageReset = today;
                    }
                    user.dailyUsageMinutes = (user.dailyUsageMinutes || 0) + durationMinutes;

                    // Clear session
                    lab.activeSession = null;
                    cleanedCount++;
                }
            }

            await user.save();
        }

        return NextResponse.json({
            success: true,
            message: `Cleaned up ${cleanedCount} expired lab sessions`,
            cleanedCount
        }, { status: 200 });

    } catch (error) {
        console.error('Cleanup cron error:', error);
        return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }
}
