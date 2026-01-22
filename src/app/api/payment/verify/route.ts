import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyPaymentSignature } from '@/lib/razorpay';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            items,
            customerInfo,
            billingAddress,
            breakdown,
        } = body;

        // Verify payment signature
        const isValid = verifyPaymentSignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Create order with payment details
        const order = new Order({
            userId: (session.user as any).id || (session.user as any)._id,
            items,
            customerInfo,
            billingAddress,
            payment: {
                method: 'razorpay',
                status: 'completed',
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
            },
            totals: {
                subtotal: breakdown.subtotalINR,
                tax: breakdown.tax,
                total: breakdown.total,
                currency: 'INR',
            },
            status: 'completed',
        });

        await order.save();

        // Get user to check if they're an org admin
        const user = await User.findById((session.user as any).id || (session.user as any)._id);

        // If user is org admin, add purchases as organization licenses
        if (user && (user.role === 'org_admin' || user.role === 'super_admin') && user.organizationId) {
            const Organization = (await import('@/models/Organization')).default;
            const organization = await Organization.findById(user.organizationId);

            if (organization) {
                // Add each item as organization license
                items.forEach((item: any) => {
                    const quantity = item.quantity || 1;
                    const purchaseDate = new Date();
                    const expiresAt = new Date(purchaseDate);
                    expiresAt.setDate(expiresAt.getDate() + 180); // 180 days

                    // Check if license already exists for this course
                    const existingLicense = organization.labLicenses.find((l: any) => l.courseId === item.labId);

                    if (existingLicense) {
                        // Add to existing license
                        existingLicense.totalLicenses += quantity;
                        // Extend expiry if new expiry is later
                        if (new Date(existingLicense.expiresAt) < expiresAt) {
                            existingLicense.expiresAt = expiresAt;
                        }
                    } else {
                        // Create new license
                        organization.labLicenses.push({
                            courseId: item.labId,
                            totalLicenses: quantity,
                            usedLicenses: 0,
                            purchaseDate,
                            expiresAt
                        });
                    }
                });

                await organization.save();
                console.log(`[Order] Added ${items.length} lab licenses to organization ${organization.name}`);

                // Send purchase invoice email
                try {
                    const { sendEmail } = await import('@/lib/email');
                    const { getPurchaseInvoiceTemplate } = await import('@/lib/email-templates/purchase-invoice');

                    const invoiceData = {
                        invoiceNumber: `INV-${new Date().getFullYear()}-${order._id.toString().slice(-6).toUpperCase()}`,
                        date: new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        organizationName: organization.name,
                        adminEmail: user.email,
                        items: items.map((item: any) => ({
                            courseId: item.labId,
                            quantity: item.quantity || 1,
                            price: Math.round(item.priceUSD * (breakdown.exchangeRate || 83)), // Use live exchange rate
                        })),
                        subtotal: breakdown.subtotalINR,
                        total: breakdown.total,
                    };

                    const html = getPurchaseInvoiceTemplate(invoiceData);

                    await sendEmail({
                        to: user.email,
                        subject: `Purchase Invoice - ${invoiceData.invoiceNumber} - PAID`,
                        html,
                    });

                    console.log(`[Email] Purchase invoice sent to ${user.email}`);
                } catch (emailError) {
                    console.error('[Email] Failed to send purchase invoice:', emailError);
                }

                // Zoho Books Integration - Create Invoice and Mark as Paid
                try {
                    const { zohoBooksService } = await import('@/lib/zoho-books');

                    // Create or get customer in Zoho Books
                    let zohoCustomerId = organization.zohoCustomerId;

                    if (!zohoCustomerId) {
                        const zohoCustomer = await zohoBooksService.createCustomer({
                            name: organization.name,
                            email: user.email,
                            address: billingAddress,
                        });

                        zohoCustomerId = zohoCustomer.contact_id;
                        organization.zohoCustomerId = zohoCustomerId;
                        organization.zohoCustomerName = zohoCustomer.contact_name;
                        await organization.save();

                        console.log(`[Zoho Books] Customer created: ${organization.name}`);
                    }


                    // Create invoice in Zoho Books with INR amounts
                    const zohoInvoice = await zohoBooksService.createInvoice({
                        customerId: zohoCustomerId,
                        items: items.map((item: any) => ({
                            name: `${item.labId.toUpperCase()} Lab License`,
                            description: `Microsoft Certification Lab - ${item.labTitle}`,
                            quantity: item.quantity || 1,
                            price: Math.round(item.priceUSD * (breakdown.exchangeRate || 83)), // Use live exchange rate
                        })),
                    });

                    // Mark invoice as sent
                    await zohoBooksService.markInvoiceAsSent(zohoInvoice.invoice_id);

                    // Record payment in Zoho Books
                    // Use the invoice total from Zoho (which includes tax calculation)
                    await zohoBooksService.recordPayment(
                        zohoInvoice.invoice_id,
                        zohoInvoice.total, // Use Zoho's calculated total
                        razorpayPaymentId
                    );

                    // Email invoice via Zoho Books
                    await zohoBooksService.emailInvoice(zohoInvoice.invoice_id, user.email);

                    // Store Zoho invoice details in order
                    order.zohoInvoiceId = zohoInvoice.invoice_id;
                    order.zohoInvoiceNumber = zohoInvoice.invoice_number;
                    await order.save();

                    console.log(`[Zoho Books] Invoice ${zohoInvoice.invoice_number} created, marked as PAID, and emailed`);
                } catch (zohoError: any) {
                    console.error('[Zoho Books] Failed to create invoice:', zohoError.message);
                }
            }
        } else {
            // Regular user (not org admin) - add labs to their personal purchasedLabs
            if (user) {
                items.forEach((item: any) => {
                    const quantity = item.quantity || 1;
                    const purchaseDate = new Date();
                    const accessExpiresAt = new Date(purchaseDate);
                    accessExpiresAt.setDate(accessExpiresAt.getDate() + 180); // 180 days access

                    // Add each quantity as a separate purchase
                    for (let i = 0; i < quantity; i++) {
                        user.purchasedLabs.push({
                            courseId: item.labId,
                            purchaseDate,
                            accessExpiresAt,
                            launchCount: 0,
                            maxLaunches: 10,
                            activeSession: null,
                            totalTimeSpent: 0,
                        });
                    }
                });

                await user.save();
                console.log(`[Order] Added ${items.length} labs to user ${user.email}`);
            }
        }

        return NextResponse.json({
            success: true,
            orderId: order._id,
            orderNumber: order.orderNumber,
            message: user?.role === 'org_admin' || user?.role === 'super_admin'
                ? 'Payment successful! Licenses added to your organization.'
                : 'Payment successful! Labs added to your dashboard.',
        }, { status: 201 });

    } catch (error: any) {
        console.error('[Payment] Verify error:', error);
        return NextResponse.json(
            { error: 'Payment verification failed' },
            { status: 500 }
        );
    }
}
