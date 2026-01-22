import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="flex-1">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container">
                    <nav className="text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Terms and Conditions</span>
                    </nav>
                </div>
            </div>

            <section className="py-16 bg-gray-50">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        Terms and Conditions
                    </h1>

                    <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-600 leading-relaxed">
                                By accessing and using this marketplace, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                Permission is granted to temporarily access the labs and materials purchased through this marketplace for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                <li>Modify or copy the materials</li>
                                <li>Use the materials for any commercial purpose or for any public display</li>
                                <li>Attempt to reverse engineer any software contained in the labs</li>
                                <li>Remove any copyright or other proprietary notations from the materials</li>
                                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Responsibilities</h2>
                            <p className="text-gray-600 leading-relaxed">
                                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password. You must notify us immediately of any unauthorized use of your account.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Policy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Refunds are available within 7 days of purchase if you have not accessed the lab environment. Once a lab has been accessed, no refunds will be provided. All refund requests must be submitted through our support system.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
                            <p className="text-gray-600 leading-relaxed">
                                In no event shall Hexalabs or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this marketplace.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Your use of our marketplace is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Modifications</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through a notice on our website. Your continued use of the marketplace following any changes indicates your acceptance of the new terms.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Last Updated: January 2026
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/contact"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Questions about our terms? Contact us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
