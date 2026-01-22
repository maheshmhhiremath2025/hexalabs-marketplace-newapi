"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const navigationLinks = [
  { label: 'CATALOG', href: '/catalog' },
  { label: 'TERMS AND CONDITIONS', href: '/terms' },
  { label: 'WHY CHOOSE HEXALABS?', href: '/why-choose-hexalabs' },
  { label: 'FREQUENTLY ASKED QUESTIONS', href: '/faq' },
  { label: 'CONTACT US', href: '/contact' },
  { label: 'CREATE AN ACCOUNT', href: '/register' },
];

export function NavigationBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container">
        <ul className="flex items-center justify-start gap-8 py-3 overflow-x-auto">
          {/* Dashboard link - only show when logged in */}
          {session?.user && (
            <li className="whitespace-nowrap">
              <Link
                href="/dashboard"
                className={`text-xs font-semibold transition-colors tracking-wide ${pathname === '/dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-700 hover:text-blue-600'
                  }`}
              >
                DASHBOARD
              </Link>
            </li>
          )}

          {/* Super Admin link - only show for super admins */}
          {session?.user && (session.user as any).role === 'super_admin' && (
            <li className="whitespace-nowrap">
              <Link
                href="/super-admin"
                className={`text-xs font-semibold transition-colors tracking-wide ${pathname?.startsWith('/super-admin')
                  ? 'text-purple-600 border-b-2 border-purple-600 pb-1'
                  : 'text-gray-700 hover:text-purple-600'
                  }`}
              >
                SUPER ADMIN
              </Link>
            </li>
          )}

          {/* Org Admin link - only show for org admins */}
          {session?.user && (session.user as any).role === 'org_admin' && (
            <li className="whitespace-nowrap">
              <Link
                href="/admin"
                className={`text-xs font-semibold transition-colors tracking-wide ${pathname?.startsWith('/admin')
                  ? 'text-green-600 border-b-2 border-green-600 pb-1'
                  : 'text-gray-700 hover:text-green-600'
                  }`}
              >
                ADMIN
              </Link>
            </li>
          )}

          {navigationLinks.map((link) => {
            // Hide catalog ONLY for regular organization users (not admins)
            // Org admins can access catalog to purchase licenses
            if (link.href === '/catalog' && session?.user && (session.user as any).organizationId && (session.user as any).role === 'user') {
              return null;
            }

            return (
              <li key={link.href} className="whitespace-nowrap">
                <Link
                  href={link.href}
                  className={`text-xs font-semibold transition-colors tracking-wide ${pathname === link.href
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-700 hover:text-blue-600'
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
