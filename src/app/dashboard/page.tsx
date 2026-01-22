import { MOCK_COURSES } from '@/lib/mock-data';
import Link from 'next/link';
import { Play, Clock, CheckCircle, ArrowRight, BookOpen, Zap, TrendingUp } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { LaunchButton } from '@/components/dashboard/LaunchButton';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';

interface DashboardProps {
    searchParams: Promise<{ payment_success?: string }>;
}

export default async function DashboardPage(props: DashboardProps) {
    const session = await getServerSession(authOptions);
    const searchParams = await props.searchParams;
    const showSuccess = searchParams?.payment_success === 'true';

    if (!session?.user) {
        return <div className="container py-12">Please log in to view dashboard.</div>;
    }

    await dbConnect();
    // @ts-ignore
    const user = await User.findById(session.user.id).lean();

    // Map purchased courseIDs to full course objects with session status
    const myLabs = user?.purchasedLabs?.map((lab: any) => {
        const course = MOCK_COURSES.find(c => c.id === lab.courseId);
        if (!course) return null;
        return {
            ...course,
            purchaseId: lab._id.toString(), // Unique purchase identifier
            purchaseDate: lab.purchaseDate,
            activeSession: lab.activeSession,
            launchCount: lab.launchCount || 0,
            maxLaunches: lab.maxLaunches || 10,
            accessExpiresAt: lab.accessExpiresAt,
            totalTimeSpent: lab.totalTimeSpent || 0,
            snapshotCreatedAt: lab.snapshotCreatedAt
        };
    }).filter(Boolean) || [];

    // Calculate analytics
    const totalLabs = myLabs.length;
    const activeLabs = myLabs.filter((lab: any) => lab.activeSession?.status === 'running').length;
    const totalLaunches = myLabs.reduce((sum: number, lab: any) => sum + (lab.launchCount || 0), 0);
    const totalMinutes = myLabs.reduce((sum: number, lab: any) => sum + (lab.totalTimeSpent || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">My Dashboard</h1>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
                    <AnalyticsCard
                        title="Total Labs"
                        value={totalLabs}
                        icon={<BookOpen className="h-6 w-6" />}
                        color="blue"
                        subtitle="Labs purchased"
                    />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <AnalyticsCard
                        title="Active Labs"
                        value={activeLabs}
                        icon={<Zap className="h-6 w-6" />}
                        color="green"
                        subtitle="Currently running"
                    />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <AnalyticsCard
                        title="Total Launches"
                        value={totalLaunches}
                        icon={<TrendingUp className="h-6 w-6" />}
                        color="purple"
                        subtitle="All time"
                    />
                </div>
            </div>

            {showSuccess && (
                <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-800 animate-fade-in">
                    <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold">Purchase Successful!</h3>
                        <p className="text-sm text-green-700">Your new labs are now active and ready to launch.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="font-semibold text-lg text-gray-700">Active Labs</h2>

                    {myLabs.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 flex flex-col items-center">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <Play className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No active labs</h3>
                            <p className="mb-6 max-w-sm">You haven't purchased any labs yet. Visit the catalog to start your learning journey.</p>
                            <Link href="/catalog" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                                Browse Catalog <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        myLabs.map((lab: any, index: number) => (
                            <div key={`${lab.courseId}-${index}`} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                                <div className="w-full md:w-48 aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold shrink-0 relative overflow-hidden group">
                                    {/* Lab Thumbnail / Placeholder */}
                                    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                                        <span className="text-slate-400">{lab.code}</span>
                                    </div>
                                    {lab.activeSession?.status === 'running' && (
                                        <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                                    )}
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 mb-1">{lab.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {lab.activeSession
                                                    ? `Status: ${lab.activeSession.status}`
                                                    : 'Ready to start'}
                                            </p>
                                        </div>
                                        {lab.activeSession ? (
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${lab.activeSession.status === 'running' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {lab.activeSession.status.toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">NOT STARTED</span>
                                        )}
                                    </div>

                                    {/* Launch Count Badge */}
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                            <span className="text-xs font-medium text-blue-900">
                                                Launches: {lab.launchCount}/{lab.maxLaunches}
                                            </span>
                                            <span className="text-xs text-blue-600">
                                                ({lab.maxLaunches - lab.launchCount} remaining)
                                            </span>
                                        </div>
                                        {lab.launchCount >= lab.maxLaunches && (
                                            <span className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-2 py-1 rounded">
                                                LIMIT REACHED
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress Bar (Mock) */}
                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: lab.activeSession ? '10%' : '0%' }}></div>
                                    </div>

                                    {/* Usage & Snapshot Info */}
                                    <div className="space-y-2 mb-4">
                                        {lab.snapshotCreatedAt && (
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                </svg>
                                                <span>Last saved: {new Date(lab.snapshotCreatedAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        {lab.lastAccessedAt && (
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Clock className="h-4 w-4" />
                                                <span>Last accessed: {new Date(lab.lastAccessedAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between -mx-6 -mb-6 rounded-b-xl">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            {lab.activeSession?.expiresAt ? 'Expiring soon' : '4 hours per session'}
                                        </div>

                                        {lab.activeSession ? (
                                            <Link href={`/lab/${lab.purchaseId}/connect`} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                                                Resume Session <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        ) : (
                                            <LaunchButton
                                                courseId={lab.id}
                                                purchaseId={lab.purchaseId}
                                                launchCount={lab.launchCount}
                                                maxLaunches={lab.maxLaunches}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )))}

                    <h2 className="font-semibold text-lg text-gray-700 mt-8">Completed</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-500">
                        No completed labs yet.
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
                        <h3 className="font-bold text-slate-900 mb-4">Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    <span className="text-gray-700">Hours spent</span>
                                </div>
                                <span className="font-bold text-slate-900">0</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span className="text-gray-700">Labs completed</span>
                                </div>
                                <span className="font-bold text-slate-900">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
