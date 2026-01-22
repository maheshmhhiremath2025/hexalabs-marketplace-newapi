import { LifeBuoy, Mail, MessageCircle, FileText } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="container py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">How can we help?</h1>
                    <p className="text-lg text-gray-600">
                        Search our knowledge base or get in touch with our support team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Documentation</h3>
                        <p className="text-gray-500 text-sm mb-4">Detailed guides and FAQs for all labs.</p>
                        <button className="text-blue-600 font-medium text-sm hover:underline">View Docs</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Live Chat</h3>
                        <p className="text-gray-500 text-sm mb-4">Chat with a support agent in real-time.</p>
                        <button className="text-blue-600 font-medium text-sm hover:underline">Start Chat</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">Email Support</h3>
                        <p className="text-gray-500 text-sm mb-4">Get a response within 24 hours.</p>
                        <button className="text-blue-600 font-medium text-sm hover:underline">Contact Us</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
