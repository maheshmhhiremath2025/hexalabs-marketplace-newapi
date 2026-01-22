'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2, Mail, Phone, Users, Briefcase, MessageSquare,
    ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Check, X
} from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Company', icon: Building2 },
    { id: 2, title: 'Contact', icon: Mail },
    { id: 3, title: 'Details', icon: MessageSquare },
];

export default function RequestOrganizationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitClicked, setIsSubmitClicked] = useState(false);

    const [formData, setFormData] = useState({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        estimatedUsers: '',
        industry: '',
        message: '',
    });

    // Validation
    const isEmailValid = formData.email.includes('@') && formData.email.length > 3;
    const isPhoneValid = /^\d{10}$/.test(formData.phone); // Exactly 10 digits

    useEffect(() => {
        const saved = localStorage.getItem('org-request-draft');
        if (saved) {
            try {
                setFormData(JSON.parse(saved));
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (!success) {
            localStorage.setItem('org-request-draft', JSON.stringify(formData));
        }
    }, [formData, success]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentStep !== 3 || !isSubmitClicked) {
            setIsSubmitClicked(false);
            return;
        }

        // Final validation
        if (!isEmailValid) {
            setError('Please enter a valid email address with @');
            setIsSubmitClicked(false);
            return;
        }

        if (formData.phone && !isPhoneValid) {
            setError('Phone number must be exactly 10 digits without country code');
            setIsSubmitClicked(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/organization-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit request');
            }

            setSuccess(true);
            localStorage.removeItem('org-request-draft');
        } catch (err) {
            setError('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
            setIsSubmitClicked(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentStep < 3 && canProceed()) {
                nextStep();
            }
        }
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const canProceed = () => {
        if (currentStep === 1) {
            return formData.organizationName.trim().length > 0;
        }
        if (currentStep === 2) {
            return formData.contactName.trim().length > 0 && isEmailValid;
        }
        return true;
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Request Submitted!</h2>
                        <p className="text-gray-600 text-lg">
                            Thank you for your interest. Our team will review your request and contact you within 24-48 hours.
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                        <h3 className="font-bold text-gray-900 mb-4">What happens next?</h3>
                        <div className="space-y-3 text-left">
                            {[
                                'Our team reviews your request',
                                'We prepare a custom quote',
                                'You receive an email with next steps',
                                'Schedule a demo call (optional)'
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <span className="text-gray-700">{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                        >
                            Back to Home
                        </Link>
                        <Link
                            href="/catalog"
                            className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all"
                        >
                            Browse Catalog
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full mb-4">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-600">Enterprise Access</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Request Organization Access</h2>
                        <p className="text-gray-600">Fill out the form below to get started with enterprise learning</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-4">
                            {STEPS.map((step) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <div key={step.id} className="flex flex-col items-center flex-1">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isActive
                                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                                    : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                        </div>
                                        <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                                style={{ width: `${(currentStep / 3) * 100}%` }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <span className="text-red-700 font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
                        {/* Step 1 */}
                        {currentStep === 1 && (
                            <div className="space-y-5 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Organization Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.organizationName}
                                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="Acme Corporation"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="Technology, Healthcare, Finance..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Users</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.estimatedUsers}
                                            onChange={(e) => setFormData({ ...formData, estimatedUsers: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="50"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2 */}
                        {currentStep === 2 && (
                            <div className="space-y-5 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contact Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${formData.email.length > 0
                                                    ? isEmailValid
                                                        ? 'border-green-500 focus:border-green-600'
                                                        : 'border-red-500 focus:border-red-600'
                                                    : 'border-gray-200 focus:border-blue-500'
                                                }`}
                                            placeholder="john@acme.com"
                                        />
                                        {formData.email.length > 0 && (
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                {isEmailValid ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <X className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {formData.email.length > 0 && !isEmailValid && (
                                        <p className="mt-1 text-sm text-red-600">Email must contain @</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number (10 digits, no country code)
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 10) {
                                                    setFormData({ ...formData, phone: value });
                                                }
                                            }}
                                            className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${formData.phone.length > 0
                                                    ? isPhoneValid
                                                        ? 'border-green-500 focus:border-green-600'
                                                        : 'border-red-500 focus:border-red-600'
                                                    : 'border-gray-200 focus:border-blue-500'
                                                }`}
                                            placeholder="9876543210"
                                            maxLength={10}
                                        />
                                        {formData.phone.length > 0 && (
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                {isPhoneValid ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <X className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {formData.phone.length > 0 && (
                                        <p className={`mt-1 text-sm ${isPhoneValid ? 'text-green-600' : 'text-red-600'}`}>
                                            {isPhoneValid
                                                ? '✓ Valid phone number'
                                                : `Must be exactly 10 digits (${formData.phone.length}/10)`
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        {currentStep === 3 && (
                            <div className="space-y-5 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tell us about your requirements
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={5}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        placeholder="What are your training goals? Which courses are you interested in?"
                                    />
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                                    <h4 className="font-bold text-gray-900 mb-3">Request Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Organization:</span>
                                            <span className="font-semibold text-gray-900">{formData.organizationName || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Contact:</span>
                                            <span className="font-semibold text-gray-900">{formData.contactName || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-semibold text-gray-900">{formData.email || '-'}</span>
                                        </div>
                                        {formData.phone && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phone:</span>
                                                <span className="font-semibold text-gray-900">{formData.phone}</span>
                                            </div>
                                        )}
                                        {formData.estimatedUsers && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Est. Users:</span>
                                                <span className="font-semibold text-gray-900">{formData.estimatedUsers}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 pt-4">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>Continue</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    onClick={() => setIsSubmitClicked(true)}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span>Submit Request</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
