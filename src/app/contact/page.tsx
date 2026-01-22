"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        alert('Thank you for your message. We will get back to you soon!');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="flex-1">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container">
                    <nav className="text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Contact Us</span>
                    </nav>
                </div>
            </div>

            <section className="py-16 bg-gray-50">
                <div className="container max-w-5xl">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                        Contact Us
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Form */}
                        <div className="bg-white rounded-lg border border-gray-200 p-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Send us a message
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                    Get in Touch
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                                        <p className="text-gray-600">
                                            7143 State Road 54, #153<br />
                                            New Port Richey, FL 34653<br />
                                            United States
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                                        <a href="mailto:support@hexalabs.com" className="text-blue-600 hover:text-blue-700">
                                            support@hexalabs.com
                                        </a>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Support Hours</h3>
                                        <p className="text-gray-600">
                                            Monday - Friday: 9:00 AM - 5:00 PM EST<br />
                                            Saturday - Sunday: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Need immediate help?
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Check out our FAQ page for quick answers to common questions.
                                </p>
                                <Link
                                    href="/faq"
                                    className="inline-block text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Visit FAQ →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
