"use client";

import Link from 'next/link';
import { Search, ShoppingCart, User, LogOut, ChevronDown, Package } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CURRENCIES, CurrencyCode } from '@/lib/currency';
import { useCart } from '@/lib/store/cart';
import { useMemo, useState, useRef, useEffect } from 'react';

export function Header() {
  const { data: session } = useSession();
  const { selectedCurrency, setCurrency } = useCurrency();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use stable selector - directly access items array
  const items = useCart((state) => state.items);
  // Calculate count in useMemo to avoid recalculation
  const itemCount = useMemo(() =>
    items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/labs/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data.labs || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // Close search results when clicking outside - use setTimeout to allow link clicks to work
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        // Delay closing to allow link navigation to complete
        setTimeout(() => {
          setShowSearchResults(false);
        }, 100);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img
            src="/hexalabs-logo.png"
            alt="Hexalabs"
            className="h-30 w-auto"
          />
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative search-container">
          <input
            type="text"
            placeholder="Search labs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
              {searchLoading ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((lab) => (
                    <Link
                      key={lab.id}
                      href={`/catalog/${lab.code || lab.id}`}
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
                    >
                      <div className="font-medium text-gray-900">{lab.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {lab.code} • {lab.topic}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No labs found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">

          <div className="flex items-center gap-4">
            {/* Currency Selector - Hidden for now (only INR active) */}
            {/* Uncomment when multi-currency support is needed */}
            {/* <select
              className="text-sm font-medium text-gray-600 bg-transparent border-none cursor-pointer hover:text-blue-600 focus:outline-none"
              value={selectedCurrency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select> */}

            {/* Show INR label (static) */}
            <span className="text-sm font-medium text-gray-600">INR</span>

            <Link href="/cart" className="relative group p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {session?.user ? (
              <div className="relative pl-4 border-l border-gray-200" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block">{session.user.name}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <Link
                      href="/orders"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          import('@/lib/store/cart').then(({ useCart }) => {
                            useCart.getState().clearCart();
                            signOut({ callbackUrl: '/' });
                          });
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
