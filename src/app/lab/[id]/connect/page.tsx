import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { labManager } from '@/lib/azure/lab-manager';
import Link from 'next/link';
import LabConnectClient from '@/components/lab/LabConnectClient';
import { MOCK_COURSES } from '@/lib/mock-data';

export default async function LabConnectPage(props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return <div className="p-8">Please log in.</div>;
    }

    const { id: purchaseId } = await props.params;

    await dbConnect();
    // @ts-ignore
    const user = await User.findById(session.user.id);

    // Find lab by purchaseId (MongoDB _id)
    const labEntry = user?.purchasedLabs?.id(purchaseId);

    console.log('[ConnectPage] Lab entry activeSession:', {
        hasActiveSession: !!labEntry?.activeSession,
        hasConnectionId: !!labEntry?.activeSession?.guacamoleConnectionId,
        hasUsername: !!labEntry?.activeSession?.guacamoleUsername,
        hasPassword: !!labEntry?.activeSession?.guacamolePassword,
        hasAuthToken: !!labEntry?.activeSession?.guacamoleAuthToken,
        authTokenPreview: labEntry?.activeSession?.guacamoleAuthToken ?
            labEntry.activeSession.guacamoleAuthToken.substring(0, 20) + '...' : 'MISSING'
    });

    if (!labEntry || !labEntry.activeSession) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">No Active Session</h1>
                <p className="text-gray-600 mb-8">You need to launch this lab from the dashboard first.</p>
                <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Go to Dashboard</Link>
            </div>
        );
    }

    // Fetch real-time status from Azure
    const statusData = await labManager.getLabStatus(labEntry.activeSession.id);
    // @ts-ignore
    const vmPublicIP = statusData.vmPublicIP;
    // @ts-ignore
    const status = statusData.status || labEntry.activeSession.status;

    // Sync with Guacamole if running and publicIP is available
    let guacamoleId = labEntry.activeSession.guacamoleConnectionId;

    // Check if status changed and save it
    let needsSave = false;

    if (status !== labEntry.activeSession.status) {
        console.log(`[ConnectPage] Updating status from ${labEntry.activeSession.status} to ${status}`);
        labEntry.activeSession.status = status;
        needsSave = true;
    }

    if (status === 'running' && vmPublicIP) {
        guacamoleId = await labManager.syncGuacamoleConnection(
            labEntry.activeSession.vmName || 'unknown',
            vmPublicIP,
            guacamoleId
        );

        // If a new ID was generated, save it
        if (guacamoleId && guacamoleId !== labEntry.activeSession.guacamoleConnectionId) {
            labEntry.activeSession.guacamoleConnectionId = guacamoleId;
            needsSave = true;
        }
    }

    if (needsSave) {
        await user.save();
    }

    // Extract only the needed data to avoid circular references
    const sessionData = {
        id: labEntry.activeSession.id,
        startTime: labEntry.activeSession.startTime,
        expiresAt: labEntry.activeSession.expiresAt,
        guacamoleConnectionId: labEntry.activeSession.guacamoleConnectionId,
        guacamoleUsername: labEntry.activeSession.guacamoleUsername,
        guacamolePassword: labEntry.activeSession.guacamolePassword,
        guacamoleAuthToken: labEntry.activeSession.guacamoleAuthToken,
        azureUsername: labEntry.activeSession.azureUsername,
        azurePassword: labEntry.activeSession.azurePassword,
        azureResourceGroup: labEntry.activeSession.azureResourceGroup,
        launchCount: labEntry.launchCount || 0,
        maxLaunches: labEntry.maxLaunches || 10
    };

    // Get course data to check if it requires Azure Portal
    const course = MOCK_COURSES.find(c => c.id === labEntry.courseId);

    return <LabConnectClient
        purchaseId={purchaseId}
        courseId={labEntry.courseId}
        status={status}
        vmPublicIP={vmPublicIP}
        requiresAzurePortal={course?.requiresAzurePortal}
        sessionData={sessionData}
    />;
}
