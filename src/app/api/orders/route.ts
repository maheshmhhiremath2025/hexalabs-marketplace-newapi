import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Connect to database
        await dbConnect();

        // Parse request body
        const body = await request.json();
        const { customerInfo, billingAddress, payment, items } = body;

        // Validate required fields
        if (!customerInfo || !billingAddress || !payment || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Calculate totals
        const subtotal = items.reduce((sum: number, item: any) =>
            sum + (item.priceUSD * item.quantity), 0
        );
        const tax = 0; // Tax calculation can be added later
        const total = subtotal + tax;

        // Create order
        const order = new Order({
            userId: (session.user as any).id || (session.user as any)._id,
            items,
            customerInfo,
            billingAddress,
            payment: {
                method: payment.method,
                status: 'pending',
                poNumber: payment.poNumber,
            },
            totals: {
                subtotal,
                tax,
                total,
                currency: 'USD',
            },
            status: 'pending',
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
                            price: item.priceUSD || 99,
                        })),
                        subtotal,
                        total,
                    };

                    const html = getPurchaseInvoiceTemplate(invoiceData);

                    await sendEmail({
                        to: user.email,
                        subject: `Purchase Invoice - ${invoiceData.invoiceNumber}`,
                        html,
                    });

                    console.log(`[Email] Purchase invoice sent to ${user.email}`);
                } catch (emailError) {
                    console.error('[Email] Failed to send purchase invoice:', emailError);
                    // Don't fail the order if email fails
                }

                // Zoho Books Integration - Create Invoice
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

                    // Create invoice in Zoho Books
                    const zohoInvoice = await zohoBooksService.createInvoice({
                        customerId: zohoCustomerId,
                        items: items.map((item: any) => ({
                            name: `${item.labId.toUpperCase()} Lab License`,
                            description: `Microsoft Certification Lab - ${item.labTitle}`,
                            quantity: item.quantity || 1,
                            price: item.priceUSD || 99,
                        })),
                    });

                    // Mark invoice as sent
                    await zohoBooksService.markInvoiceAsSent(zohoInvoice.invoice_id);

                    // Email invoice via Zoho Books
                    await zohoBooksService.emailInvoice(zohoInvoice.invoice_id, user.email);

                    // Store Zoho invoice details in order
                    order.zohoInvoiceId = zohoInvoice.invoice_id;
                    order.zohoInvoiceNumber = zohoInvoice.invoice_number;
                    await order.save();

                    console.log(`[Zoho Books] Invoice ${zohoInvoice.invoice_number} created and emailed`);
                } catch (zohoError: any) {
                    console.error('[Zoho Books] Failed to create invoice:', zohoError.message);
                    // Don't fail the order if Zoho fails - we already sent email invoice
                }
            }
        } else {
            // Regular user - add to personal purchasedLabs
            const labEntries: any[] = [];
            items.forEach((item: any) => {
                const quantity = item.quantity || 1;
                // Create 'quantity' number of lab entries for this item
                for (let i = 0; i < quantity; i++) {
                    const purchaseDate = new Date();
                    const accessExpiresAt = new Date(purchaseDate);
                    accessExpiresAt.setDate(accessExpiresAt.getDate() + 180); // 180 days

                    labEntries.push({
                        courseId: item.labId,
                        purchaseDate: purchaseDate,
                        accessExpiresAt: accessExpiresAt,
                        launchCount: 0,
                        maxLaunches: 10,
                        sessionDurationHours: 4,
                    });
                }
            });

            if (user) {
                user.purchasedLabs = user.purchasedLabs || [];
                user.purchasedLabs.push(...labEntries);
                await user.save();
            }
        }

        return NextResponse.json({
            success: true,
            orderId: order._id,
            message: user && (user.role === 'org_admin' || user.role === 'super_admin') && user.organizationId
                ? 'Order placed successfully! Licenses added to your organization.'
                : 'Order placed successfully! Labs added to your account.',
        }, { status: 201 });

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Connect to database
        await dbConnect();

        // Get user's orders
        const orders = await Order.find({
            userId: (session.user as any).id || (session.user as any)._id,
        }).sort({ createdAt: -1 });

        return NextResponse.json({ orders }, { status: 200 });

    } catch (error) {
        console.error('Orders fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
