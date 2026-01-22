import { NextRequest, NextResponse } from 'next/server';
import { MOCK_COURSES } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (!query || query.length < 2) {
            return NextResponse.json({ labs: [] });
        }

        // Search in MOCK_COURSES (same as catalog page)
        const searchLower = query.toLowerCase();
        const results = MOCK_COURSES.filter(course => {
            return (
                (course.title?.toLowerCase() || '').includes(searchLower) ||
                (course.code?.toLowerCase() || '').includes(searchLower) ||
                (course.description?.toLowerCase() || '').includes(searchLower) ||
                (course.category?.toLowerCase() || '').includes(searchLower) ||
                (course.provider?.toLowerCase() || '').includes(searchLower)
            );
        }).slice(0, 10); // Limit to 10 results

        // Transform to match expected format
        const labs = results.map(course => ({
            id: course.id,
            title: course.title,
            code: course.code,
            description: course.description,
            topic: course.category,
            provider: course.provider || 'Hexalabs',
            price: course.price,
        }));

        return NextResponse.json({
            labs,
            total: labs.length
        });
    } catch (error: any) {
        console.error('[Search] Error:', error);
        // Return empty results on error instead of 500
        return NextResponse.json({
            labs: [],
            total: 0,
            error: error.message
        });
    }
}
