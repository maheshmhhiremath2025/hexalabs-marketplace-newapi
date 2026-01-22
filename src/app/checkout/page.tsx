'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/store/cart';
import { StepIndicator } from '@/components/checkout/StepIndicator';
import { CustomerInfoStep } from '@/components/checkout/CustomerInfoStep';
import { BillingAddressStep } from '@/components/checkout/BillingAddressStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { ReviewStep } from '@/components/checkout/ReviewStep';
import Link from 'next/link';

const STEPS = [
    { number: 1, title: 'Customer Info', description: 'Your details' },
    { number: 2, title: 'Billing', description: 'Address' },
    { number: 3, title: 'Payment', description: 'Method' },
    { number: 4, title: 'Review', description: 'Confirm order' },
];

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { items } = useCart();
    const [currentStep, setCurrentStep] = useState(1);
    const [mounted, setMounted] = useState(false);
    const hasPrefilledRef = useRef(false);

    const [checkoutData, setCheckoutData] = useState({
        customerInfo: {
            fullName: '',
            email: '',
            company: '',
            phone: '',
        },
        billingAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
        },
        payment: {
            method: '' as 'credit_card' | 'purchase_order' | '',
            poNumber: '',
        },
    });

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Pre-fill email from session (only once)
    useEffect(() => {
        if (session?.user?.email && !hasPrefilledRef.current) {
            hasPrefilledRef.current = true;
            setCheckoutData((prev) => ({
                ...prev,
                customerInfo: {
                    ...prev.customerInfo,
                    email: session.user?.email || '',
                    fullName: session.user?.name || '',
                },
            }));
        }
    }, [session]);

    // Save checkout data to sessionStorage for Razorpay handler
    useEffect(() => {
        if (mounted) {
            sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        }
    }, [checkoutData, mounted]);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?redirect=/checkout');
        }
    }, [status, router]);

    // Redirect if cart is empty
    useEffect(() => {
        if (mounted && items.length === 0) {
            router.push('/cart');
        }
    }, [mounted, items.length, router]);

    const handleSubmitOrder = async () => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...checkoutData,
                    items: items.map(item => ({
                        labId: item.id,
                        labCode: item.code,
                        labTitle: item.title,
                        quantity: item.quantity,
                        priceUSD: item.price,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const order = await response.json();

            // Clear cart
            const { useCart: getCart } = await import('@/lib/store/cart');
            getCart.getState().clearCart();

            // Redirect to confirmation page
            router.push(`/order-confirmation/${order.orderNumber}`);
        } catch (error) {
            console.error('Order submission error:', error);
            throw error;
        }
    };

    if (!mounted || status === 'loading') {
        return (
            <div className="container py-12 text-center">
                <div className="animate-pulse">Loading checkout...</div>
            </div>
        );
    }

    if (!session) {
        return null; // Will redirect
    }

    if (items.length === 0) {
        return null; // Will redirect
    }

    return (
        <div className="flex-1 bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container">
                    <nav className="text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/cart" className="hover:text-blue-600">Cart</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Checkout</span>
                    </nav>
                </div>
            </div>

            <div className="container py-8">
                <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                <p className="text-gray-600 mb-8">Complete your purchase in a few simple steps</p>

                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} steps={STEPS} />

                {/* Step Content */}
                <div className="mt-8">
                    {currentStep === 1 && (
                        <CustomerInfoStep
                            data={checkoutData.customerInfo}
                            onUpdate={(data) => setCheckoutData({ ...checkoutData, customerInfo: data })}
                            onNext={() => setCurrentStep(2)}
                        />
                    )}

                    {currentStep === 2 && (
                        <BillingAddressStep
                            data={checkoutData.billingAddress}
                            onUpdate={(data) => setCheckoutData({ ...checkoutData, billingAddress: data })}
                            onNext={() => setCurrentStep(3)}
                            onBack={() => setCurrentStep(1)}
                        />
                    )}

                    {currentStep === 3 && (
                        <PaymentStep
                            data={checkoutData.payment}
                            onUpdate={(data) => setCheckoutData({ ...checkoutData, payment: data })}
                            onNext={() => setCurrentStep(4)}
                            onBack={() => setCurrentStep(2)}
                        />
                    )}

                    {currentStep === 4 && (
                        <ReviewStep
                            customerInfo={checkoutData.customerInfo}
                            billingAddress={checkoutData.billingAddress}
                            payment={checkoutData.payment}
                            onBack={() => setCurrentStep(3)}
                            onSubmit={handleSubmitOrder}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
