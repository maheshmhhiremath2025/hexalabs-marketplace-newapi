/**
 * Search utility for REST API
 * Provides search functionality across labs, users, orders, and organizations
 */

import Lab from '@/models/Lab';
import User from '@/models/User';
import Order from '@/models/Order';
import Organization from '@/models/Organization';

export interface SearchOptions {
    query: string;
    types?: ('labs' | 'users' | 'orders' | 'organizations')[];
    limit?: number;
}

export interface SearchResults {
    labs?: any[];
    users?: any[];
    orders?: any[];
    organizations?: any[];
    total: number;
}

/**
 * Search across multiple resource types
 */
export async function search(options: SearchOptions): Promise<SearchResults> {
    const { query, types = ['labs', 'users', 'orders', 'organizations'], limit = 10 } = options;

    const results: SearchResults = { total: 0 };

    // Search labs
    if (types.includes('labs')) {
        const labs = await Lab.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { code: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { topic: { $regex: query, $options: 'i' } },
                { provider: { $regex: query, $options: 'i' } },
            ],
        })
            .limit(limit)
            .select('code title topic provider price difficulty')
            .lean();

        results.labs = labs.map(lab => ({
            id: lab._id,
            type: 'lab',
            code: lab.code,
            title: lab.title,
            topic: lab.topic,
            provider: lab.provider,
            price: lab.price,
            difficulty: lab.difficulty,
        }));

        results.total += labs.length;
    }

    // Search users
    if (types.includes('users')) {
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        })
            .limit(limit)
            .select('name email role organizationId')
            .populate('organizationId', 'name')
            .lean();

        results.users = users.map(user => ({
            id: user._id,
            type: 'user',
            name: user.name,
            email: user.email,
            role: user.role,
            organization: user.organizationId ? (user.organizationId as any).name : null,
        }));

        results.total += users.length;
    }

    // Search orders
    if (types.includes('orders')) {
        const orders = await Order.find({
            $or: [
                { orderNumber: { $regex: query, $options: 'i' } },
                { 'customerInfo.fullName': { $regex: query, $options: 'i' } },
                { 'customerInfo.email': { $regex: query, $options: 'i' } },
                { 'items.labCode': { $regex: query, $options: 'i' } },
            ],
        })
            .limit(limit)
            .select('orderNumber status totals customerInfo createdAt')
            .lean();

        results.orders = orders.map(order => ({
            id: order._id,
            type: 'order',
            orderNumber: order.orderNumber,
            status: order.status,
            total: order.totals.total,
            customerName: order.customerInfo.fullName,
            createdAt: order.createdAt,
        }));

        results.total += orders.length;
    }

    // Search organizations
    if (types.includes('organizations')) {
        const organizations = await Organization.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { slug: { $regex: query, $options: 'i' } },
                { contactEmail: { $regex: query, $options: 'i' } },
            ],
        })
            .limit(limit)
            .select('name slug contactEmail isActive')
            .lean();

        results.organizations = organizations.map(org => ({
            id: org._id,
            type: 'organization',
            name: org.name,
            slug: org.slug,
            contactEmail: org.contactEmail,
            isActive: org.isActive,
        }));

        results.total += organizations.length;
    }

    return results;
}

/**
 * Search labs only
 */
export async function searchLabs(query: string, limit = 20) {
    return Lab.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { code: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { topic: { $regex: query, $options: 'i' } },
            { provider: { $regex: query, $options: 'i' } },
        ],
    })
        .limit(limit)
        .lean();
}

/**
 * Search users only
 */
export async function searchUsers(query: string, limit = 20) {
    return User.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
        ],
    })
        .limit(limit)
        .select('-password')
        .lean();
}

/**
 * Search orders only
 */
export async function searchOrders(query: string, limit = 20) {
    return Order.find({
        $or: [
            { orderNumber: { $regex: query, $options: 'i' } },
            { 'customerInfo.fullName': { $regex: query, $options: 'i' } },
            { 'customerInfo.email': { $regex: query, $options: 'i' } },
        ],
    })
        .limit(limit)
        .lean();
}
