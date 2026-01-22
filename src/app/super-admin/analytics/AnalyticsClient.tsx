'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, BookOpen, TrendingUp, Activity, Package } from 'lucide-react';
import MetricCard from '@/components/analytics/MetricCard';
import ChartCard from '@/components/analytics/ChartCard';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
    metrics: {
        totalUsers: number;
        totalOrganizations: number;
        totalCourseAssignments: number;
        licenseUtilization: string;
        userGrowthPercent: number;
        orgGrowthPercent: number;
    };
    userGrowth: Array<{ date: string; count: number }>;
    orgGrowth: Array<{ month: string; count: number }>;
    courseDistribution: Array<{ courseId: string; count: number }>;
    topOrganizations: Array<{ name: string; users: number; licenses: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function SuperAdminAnalyticsClient({ initialData }: { initialData: AnalyticsData }) {
    const [data, setData] = useState<AnalyticsData>(initialData);

    return (
        <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Users"
                    value={data.metrics.totalUsers}
                    change={data.metrics.userGrowthPercent}
                    icon={Users}
                    iconColor="blue"
                />
                <MetricCard
                    title="Total Organizations"
                    value={data.metrics.totalOrganizations}
                    change={data.metrics.orgGrowthPercent}
                    icon={Building2}
                    iconColor="green"
                />
                <MetricCard
                    title="Course Assignments"
                    value={data.metrics.totalCourseAssignments}
                    icon={BookOpen}
                    iconColor="purple"
                />
                <MetricCard
                    title="License Utilization"
                    value={`${data.metrics.licenseUtilization}%`}
                    icon={Package}
                    iconColor="orange"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <ChartCard title="User Growth" description="New users over the last 30 days">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="New Users" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Organization Growth Chart */}
                <ChartCard title="Organization Growth" description="Organizations created per month">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.orgGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#10b981" name="Organizations" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course Distribution */}
                <ChartCard title="Top Courses" description="Most assigned courses platform-wide">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.courseDistribution}
                                dataKey="count"
                                nameKey="courseId"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={(entry) => `${entry.courseId} (${entry.count})`}
                            >
                                {data.courseDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Top Organizations Table */}
                <ChartCard title="Top Organizations" description="Organizations by user count">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Organization</th>
                                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Users</th>
                                    <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">Licenses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topOrganizations.map((org, idx) => (
                                    <tr key={idx} className="border-b border-slate-100">
                                        <td className="py-2 px-3 text-sm text-slate-900">{org.name}</td>
                                        <td className="py-2 px-3 text-sm text-slate-600">{org.users}</td>
                                        <td className="py-2 px-3 text-sm text-slate-600">{org.licenses}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
}
