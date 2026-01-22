'use client';

import { MOCK_COURSES } from '@/lib/mock-data';
import { ArrowLeft, CheckCircle, Clock, Shield, Award } from 'lucide-react';
import Link from 'next/link';
import { AddToCartButton } from '@/components/catalog/AddToCartButton';
import { useCurrency } from '@/contexts/CurrencyContext';
import { convertPrice, formatPrice } from '@/lib/currency';
import { useCart } from '@/lib/store/cart';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function CourseDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const { selectedCurrency } = useCurrency();
    const { addItem } = useCart();
    const router = useRouter();

    const course = MOCK_COURSES.find(c => c.id === params.id) || MOCK_COURSES[0]; // Fallback for demo

    const handleBuyNow = () => {
        // Add to cart
        addItem({
            id: course.id,
            title: course.title,
            price: course.price,
            code: course.code,
        });
        // Navigate to checkout
        router.push('/checkout');
    };

    return (
        <div className="bg-gray-50 pb-12">
            {/* Breadcrumb / Back */}
            <div className="bg-slate-900 text-white pt-8 pb-16">
                <div className="container">
                    <Link href="/catalog" className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 text-sm font-medium">
                        <ArrowLeft className="h-4 w-4" /> Back to Catalog
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                            <div className="flex gap-2 mb-4">
                                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                    {course.tags[0]}
                                </span>
                                <span className="bg-slate-700 text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                    {course.level}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                            <p className="text-slate-300 text-lg max-w-2xl">{course.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* What you'll learn */}
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Award className="h-6 w-6 text-blue-600" />
                            What you'll learn
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                'Implement and manage storage',
                                'Deploy and manage Azure compute resources',
                                'Configure and manage virtual networking',
                                'Monitor and back up Azure resources'
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lab Description */}
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">About this Lab</h3>
                        <div className="prose text-gray-600 leading-relaxed">
                            <p className="mb-4">
                                This hands-on lab provides you with a real-world environment to practice your skills.
                                You will have access to a fully configured cloud sandbox where you can safely perform administrative tasks without risk.
                            </p>
                            <p>
                                Scenarios include configuring Role-Based Access Control (RBAC), creating and managing virtual machines,
                                and setting up secure storage accounts according to best practices.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Action Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <span className="text-gray-500 text-sm">Price</span>
                            <div className="text-4xl font-bold text-slate-900 mt-1">
                                {formatPrice(convertPrice(course.price, selectedCurrency), selectedCurrency)}
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <AddToCartButton course={course} />
                            <button
                                onClick={handleBuyNow}
                                className="w-full bg-white hover:bg-gray-50 text-slate-700 font-bold py-3.5 px-4 rounded-lg border-2 border-slate-200 transition-all hover:border-blue-500 hover:text-blue-600"
                            >
                                Buy Now
                            </button>
                        </div>

                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-slate-400" />
                                <span>Duration: <strong>2 Hours</strong></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-slate-400" />
                                <span>Access: <strong>30 Days</strong></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Award className="h-5 w-5 text-slate-400" />
                                <span>Certificate of Completion</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
