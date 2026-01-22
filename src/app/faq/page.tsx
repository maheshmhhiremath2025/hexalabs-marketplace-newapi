import Link from 'next/link';

export default function FAQPage() {
    const faqs = [
        {
            question: 'How do I access my lab after purchase?',
            answer: 'After completing your purchase, you will receive an email with instructions and a unique access code. You can also access your labs from your dashboard by clicking on "My Labs".',
        },
        {
            question: 'How long do I have access to a lab?',
            answer: 'Lab access duration varies by product. Most labs provide access for 180 days from the date of purchase. Check the product description for specific details.',
        },
        {
            question: 'Can I extend my lab access?',
            answer: 'Yes, you can purchase an extension for most labs. Contact our support team for assistance with extending your lab access.',
        },
        {
            question: 'What are the system requirements?',
            answer: 'Our labs run entirely in your browser. You need a modern web browser (Chrome, Firefox, Edge, or Safari), stable internet connection, and JavaScript enabled.',
        },
        {
            question: 'Do you offer refunds?',
            answer: 'Refunds are available within 7 days of purchase if you have not accessed the lab. Please review our Terms and Conditions for complete refund policy details.',
        },
        {
            question: 'Can I share my lab access with others?',
            answer: 'No, lab access is licensed for individual use only. Sharing access credentials violates our Terms of Service and may result in account suspension.',
        },
    ];

    return (
        <div className="flex-1">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container">
                    <nav className="text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Frequently Asked Questions</span>
                    </nav>
                </div>
            </div>

            <section className="py-16 bg-gray-50">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                        Frequently Asked Questions
                    </h1>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center bg-blue-50 rounded-lg p-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Still have questions?
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Our support team is here to help you with any questions or concerns.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
