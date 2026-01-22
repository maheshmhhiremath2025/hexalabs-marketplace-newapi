import Link from 'next/link';
import { Linkedin, Twitter, Facebook } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-white py-12">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div>
                        <div className="mb-4">
                            <img
                                src="/hexalabs-logo.png"
                                alt="Hexalabs"
                                className="h-30 w-auto"
                            />
                        </div>
                        <p className="text-slate-400 text-sm mb-4">
                            Hexalabs Marketplace for Microsoft Partners
                        </p>
                        <p className="text-slate-400 text-xs">
                            7143 State Road 54, #153<br />
                            New Port Richey, FL 34653
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="font-semibold mb-4 uppercase text-sm">Categories</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/catalog" className="hover:text-white transition-colors">Catalog</Link></li>
                        </ul>
                    </div>

                    {/* Information */}
                    <div>
                        <h3 className="font-semibold mb-4 uppercase text-sm">Information</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link></li>
                            <li><Link href="/why-choose-hexalabs" className="hover:text-white transition-colors">Why choose Hexalabs?</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/register" className="hover:text-white transition-colors">Create an account</Link></li>
                            <li><Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link></li>
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div>
                        <h3 className="font-semibold mb-4 uppercase text-sm">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                        </div>

                        {/* Payment Methods */}
                        <div className="mt-6">
                            <div className="flex gap-2 flex-wrap">
                                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">VISA</div>
                                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">MC</div>
                                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">AMEX</div>
                                <div className="bg-white rounded px-2 py-1 text-xs font-semibold text-gray-800">DISC</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
                        <p>Hexalabs – All Rights Reserved | © {new Date().getFullYear()}</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/sla" className="hover:text-white transition-colors">Service Level Agreement</Link>
                            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility Statement</Link>
                            <Link href="/confidentiality" className="hover:text-white transition-colors">Confidentiality Policy</Link>
                            <Link href="/security" className="hover:text-white transition-colors">Security Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
