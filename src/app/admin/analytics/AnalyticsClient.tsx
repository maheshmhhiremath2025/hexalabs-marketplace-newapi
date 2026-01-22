'use client';

import { useEffect, useState } from 'react';
import { Users, Package, Activity, TrendingUp, Award, Clock } from 'lucide-react';
import MetricCard from '@/components/analytics/MetricCard';
import ChartCard from '@/components/analytics/ChartCard';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
    metrics: {
        totalMembers: number;
        totalLicenses: number;
        usedLicenses: number;
        availableLicenses: number;
        totalLaunches: number;
        activeUsers: number;
        memberGrowthPercent: number;
    };
    teamGrowth: Array<{ date: string; count: number }>;
    licenseUsage: Array<{ date: string; used: number }>;
    courseDistribution: Array<{ courseId: string; count: number }>;
    topUsers: Array<{ name: string; email: string; launches: number; courses: number }>;
    launchHistory: Array<{ date: string; launches: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function OrgAdminAnalyticsClient({ initialData }: { initialData: AnalyticsData }) {
    const [data, setData] = useState<AnalyticsData>(initialData);

    return (
        <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                    title="Team Members"
                    value={data.metrics.totalMembers}
                    change={data.metrics.memberGrowthPercent}
                    icon={Users}
                    iconColor="blue"
                />
                <MetricCard
                    title="Licenses Available"
                    value={`${data.metrics.usedLicenses}/${data.metrics.totalLicenses}`}
                    icon={Package}
                    iconColor="green"
                />
                <MetricCard
                    title="Total Launches"
                    value={data.metrics.totalLaunches}
                    icon={Activity}
                    iconColor="purple"
                />
                <MetricCard
                    title="Active Users"
                    value={data.metrics.activeUsers}
                    icon={TrendingUp}
                    iconColor="orange"
                />
                <MetricCard
                    title="Avg Launches/User"
                    value={data.metrics.totalMembers > 0
                        ? (data.metrics.totalLaunches / data.metrics.totalMembers).toFixed(1)
                        : '0'}
                    icon={Award}
                    iconColor="red"
                />
                <MetricCard
                    title="License Utilization"
                    value={`${data.metrics.totalLicenses > 0
                        ? ((data.metrics.usedLicenses / data.metrics.totalLicenses) * 100).toFixed(1)
                        : '0'}%`}
                    icon={Clock}
                    iconColor="blue"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Growth Chart */}
                <ChartCard title="Team Growth" description="New members over the last 30 days">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.teamGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="New Members" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Launch History Chart */}
                <ChartCard title="Lab Launches" description="Daily lab launches over the last 30 days">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.launchHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="launches" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Launches" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course Distribution */}
                <ChartCard title="Course Distribution" description="Most used courses by your team">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.courseDistribution}
                                dataKey="count"
                                nameKey="courseId"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {data.courseDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Top Users */}
                <ChartCard title="Top Users" description="Most active team members by launches">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.topUsers.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="launches" fill="#8b5cf6" name="Launches" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Top Users Table */}
            <ChartCard title="Team Performance" description="Detailed user activity breakdown">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Courses</th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-700">Launches</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topUsers.map((user, idx) => (
                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{user.name}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                            {user.courses}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                            {user.launches}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ChartCard>
        </div>
    );
}
