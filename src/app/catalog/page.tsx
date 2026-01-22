'use client';

import Link from 'next/link';
import { Filters } from '@/components/catalog/Filters';
import { ProductCard } from '@/components/catalog/ProductCard';
import { MOCK_COURSES } from '@/lib/mock-data';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 9;

export default function CatalogPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Redirect ONLY regular organization users (not admins) to dashboard
    // Org admins can purchase from catalog, which becomes licenses
    useEffect(() => {
        if (session?.user && (session.user as any).organizationId && (session.user as any).role === 'user') {
            router.push('/dashboard');
        }
    }, [session, router]);

    // Don't render catalog for regular organization users (but allow org admins)
    if (session?.user && (session.user as any).organizationId && (session.user as any).role === 'user') {
        return null;
    }

    // Filter courses based on search and topic filters
    const filteredCourses = useMemo(() => {
        return MOCK_COURSES.filter(course => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Topic filter
            const matchesTopic = selectedTopics.length === 0 ||
                selectedTopics.includes(course.category);

            return matchesSearch && matchesTopic;
        });
    }, [searchQuery, selectedTopics]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleTopicChange = (topics: string[]) => {
        setSelectedTopics(topics);
        setCurrentPage(1);
    };

    return (
        <div className="flex-1">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4 animate-fade-in">
                <div className="container">
                    <nav className="text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Catalog</span>
                    </nav>
                </div>
            </div>

            <div className="container py-12">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 gap-4 animate-slide-up">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase">Catalog</h1>
                        <p className="text-gray-600">
                            Explore our complete collection of hands-on labs and certifications.
                        </p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Search labs..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-1 animate-slide-in-left">
                        <Filters
                            selectedTopics={selectedTopics}
                            onTopicChange={handleTopicChange}
                        />
                    </aside>

                    {/* Course Grid */}
                    <div className="lg:col-span-3">
                        {/* Results count */}
                        <div className="mb-4 text-sm text-gray-600 animate-fade-in">
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length} labs
                        </div>

                        {paginatedCourses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {paginatedCourses.map((course, index) => (
                                        <div
                                            key={course.id}
                                            className="animate-fade-in-up"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <ProductCard course={course} />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>

                                        <div className="flex gap-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-4 py-2 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 ${currentPage === page
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 animate-fade-in">
                                <p className="text-gray-500 text-lg mb-2">No labs found matching your criteria.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedTopics([]);
                                        setCurrentPage(1);
                                    }}
                                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
