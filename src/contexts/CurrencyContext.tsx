'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode } from '@/lib/currency';

interface CurrencyContextType {
    selectedCurrency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    // Always initialize with INR (default currency)
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR');
    const [isHydrated, setIsHydrated] = useState(false);

    // Load currency from localStorage only on client after hydration
    useEffect(() => {
        setIsHydrated(true);
        const saved = localStorage.getItem('selectedCurrency');
        if (saved) {
            setSelectedCurrency(saved as CurrencyCode);
        } else {
            // Set default to INR if nothing saved
            setSelectedCurrency('INR');
        }
    }, []);

    // Save currency to localStorage when it changes (only after hydration)
    const setCurrency = (currency: CurrencyCode) => {
        setSelectedCurrency(currency);
        if (isHydrated) {
            localStorage.setItem('selectedCurrency', currency);
        }
    };

    return (
        <CurrencyContext.Provider value={{ selectedCurrency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
