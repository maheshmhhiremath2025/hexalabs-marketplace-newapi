"use client";

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        setLoading(false);

        if (res?.error) {
            setError('Invalid email or password');
        } else {
            router.push('/dashboard');
            router.refresh();
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
                        <span className="text-sm font-medium">Premium Learning Platform</span>
                    </div>
                    <h1 className="text-5xl font-bold leading-tight">
                        Welcome to<br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Hexalabs Marketplace
                        </span>
                    </h1>
                    <p className="text-xl text-gray-300">
                        Access world-class Microsoft training labs and certifications
                    </p>
                    <div className="space-y-3 pt-4">
                        {['Hands-on Lab Environments', 'Expert-Led Courses', 'Industry Certifications'].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-gray-300">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                        <p className="text-gray-600">Continue your learning journey</p>
                    </div>

                    {registered && (
                        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Account created! Please sign in.</span>
                            </div>
                        </div>
                    )}

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
                            <span className="font-semibold text-gray-700">Continue with Google</span>
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
                            <span className="font-semibold text-gray-700">Continue with Microsoft</span>
                        </button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-600">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || oauthLoading !== null}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Sign up
                            </Link>
                        </p>
                        <p className="text-gray-600">
                            Need organization access?{' '}
                            <Link href="/request-organization" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Request here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
