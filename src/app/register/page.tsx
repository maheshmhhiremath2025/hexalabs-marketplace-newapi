"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);

    // Email validation
    const isEmailValid = formData.email.includes('@') && formData.email.length > 3;

    // Password requirements
    const passwordRequirements = [
        { label: 'At least 8 characters', met: formData.password.length >= 8 },
        { label: 'Contains uppercase', met: /[A-Z]/.test(formData.password) },
        { label: 'Contains lowercase', met: /[a-z]/.test(formData.password) },
        { label: 'Contains number', met: /[0-9]/.test(formData.password) },
    ];

    const passwordStrength = passwordRequirements.filter(req => req.met).length;
    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!isEmailValid) {
            setError('Please enter a valid email address with @');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (passwordStrength < 4) {
            setError('Please meet all password requirements');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Registration failed');
            }

            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'google' | 'azure-ad') => {
        setOauthLoading(provider);
        await signIn(provider, { callbackUrl: '/dashboard' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <div className="hidden lg:block text-white space-y-6">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-medium">Join Thousands of Learners</span>
                    </div>
                    <h1 className="text-5xl font-bold leading-tight">
                        Start Your<br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Learning Journey
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        Get instant access to premium Microsoft training labs
                    </p>
                    <div className="space-y-3 pt-4">
                        {['Free Trial Available', '24/7 Lab Access', 'Certificate of Completion'].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-gray-300">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600">Sign up to get started</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <span className="text-red-700 font-medium">{error}</span>
                        </div>
                    )}

                    {/* OAuth Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => handleOAuthSignIn('google')}
                            disabled={oauthLoading !== null}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            {oauthLoading === 'google' ? (
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span className="font-semibold text-gray-700">Sign up with Google</span>
                        </button>

                        <button
                            onClick={() => handleOAuthSignIn('azure-ad')}
                            disabled={oauthLoading !== null}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            {oauthLoading === 'azure-ad' ? (
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 23 23">
                                    <path fill="#f35325" d="M1 1h10v10H1z" />
                                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                                </svg>
                            )}
                            <span className="font-semibold text-gray-700">Sign up with Microsoft</span>
                        </button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
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
                                    placeholder="you@example.com"
                                />
                                {formData.email.length > 0 && (
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                        {isEmailValid ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                            {formData.email.length > 0 && !isEmailValid && (
                                <p className="mt-1 text-sm text-red-600">Email must contain @</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {formData.password.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= level
                                                        ? passwordStrength === 4
                                                            ? 'bg-green-500'
                                                            : passwordStrength === 3
                                                                ? 'bg-yellow-500'
                                                                : 'bg-red-500'
                                                        : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {passwordRequirements.map((req, i) => (
                                            <div key={i} className={`flex items-center gap-1 ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                                                {req.met ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                <span>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${formData.confirmPassword.length > 0
                                            ? passwordsMatch
                                                ? 'border-green-500 focus:border-green-600'
                                                : 'border-red-500 focus:border-red-600'
                                            : 'border-gray-200 focus:border-blue-500'
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {formData.confirmPassword.length > 0 && (
                                <p className={`mt-1 text-sm flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                                    {passwordsMatch ? (
                                        <><CheckCircle className="w-4 h-4" /> Passwords match</>
                                    ) : (
                                        <><XCircle className="w-4 h-4" /> Passwords do not match</>
                                    )}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || oauthLoading !== null}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
