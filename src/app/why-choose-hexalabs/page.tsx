import Link from 'next/link';
import { CheckCircle, Cloud, Shield, Users, Zap } from 'lucide-react';

export default function WhyChooseHexalabsPage() {
    const benefits = [
        {
            icon: Cloud,
            title: 'Cloud-Based Labs',
            description: 'Access real Azure, AWS, and cloud environments directly in your browser. No setup required, start learning immediately.',
        },
        {
            icon: Shield,
            title: 'Secure & Isolated',
            description: 'Each lab runs in a secure, isolated environment. Practice safely without worrying about affecting production systems.',
        },
        {
            icon: Users,
            title: 'Microsoft Partner Trusted',
            description: 'Trusted by Microsoft Partners worldwide for official certification training and hands-on skill development.',
        },
        {
            icon: Zap,
            title: 'Instant Access',
            description: 'Purchase and start your lab within minutes. No waiting, no downloads, no complex installations.',
        },
    ];

    const features = [
        'Real-world scenarios designed by industry experts',
        'Up-to-date content aligned with latest certifications',
        'Flexible access periods to learn at your own pace',
        'Comprehensive lab guides and documentation',
        'Technical support when you need it',
        'Progress tracking and completion certificates',
    ];

    return (
        <div className="flex-1">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container">
                    <nav className="text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Why Choose Hexalabs?</span>
                    </nav>
                </div>
            </div>

            <section className="py-16 bg-gray-50">
                <div className="container max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Hexalabs?
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            The premier platform for hands-on technical training and certification preparation trusted by Microsoft Partners worldwide.
                        </p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={index} className="bg-white rounded-lg border border-gray-200 p-8">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 rounded-lg p-3">
                                            <Icon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Features List */}
                    <div className="bg-white rounded-lg border border-gray-200 p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                            What You Get with Hexalabs
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-16 text-center bg-blue-600 rounded-lg p-12 text-white">
                        <h2 className="text-3xl font-bold mb-4">
                            Ready to Start Learning?
                        </h2>
                        <p className="text-xl mb-8 text-blue-100">
                            Browse our catalog of hands-on labs and start your certification journey today.
                        </p>
                        <Link
                            href="/catalog"
                            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
