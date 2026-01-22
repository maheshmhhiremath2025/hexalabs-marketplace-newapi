import axios from 'axios';

// Zoho Books Configuration for India
const ZOHO_CONFIG = {
    clientId: '1000.5PIAMTZQTJSQEECLY86RN4KXM4ANJC',
    clientSecret: '958aa25c472ed21128e8bc08855aa46e8eb4d672eb',
    refreshToken: '1000.228d52e3cecb763bc7fe02474ade5498.64a177ddb3f94090836b6166ee87f060',
    organizationId: '60063425642',
    authDomain: 'https://accounts.zoho.in',
    apiDomain: 'https://www.zohoapis.in',
};

class ZohoBooksService {
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    async getAccessToken(): Promise<string> {
        // Refresh token if expired or not available
        if (!this.accessToken || Date.now() >= this.tokenExpiry) {
            await this.refreshAccessToken();
        }
        return this.accessToken!;
    }

    private async refreshAccessToken(): Promise<void> {
        try {
            const response = await axios.post(
                `${ZOHO_CONFIG.authDomain}/oauth/v2/token`,
                null,
                {
                    params: {
                        refresh_token: ZOHO_CONFIG.refreshToken,
                        client_id: ZOHO_CONFIG.clientId,
                        client_secret: ZOHO_CONFIG.clientSecret,
                        grant_type: 'refresh_token',
                    },
                }
            );

            this.accessToken = response.data.access_token;
            // Set expiry to 50 minutes (tokens last 1 hour)
            this.tokenExpiry = Date.now() + (50 * 60 * 1000);

            console.log('[Zoho Books] Access token refreshed');
        } catch (error: any) {
            console.error('[Zoho Books] Token refresh error:', error.response?.data || error.message);
            throw new Error('Failed to refresh Zoho Books access token');
        }
    }

    async createCustomer(data: {
        name: string;
        email: string;
        address?: any;
    }): Promise<any> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.post(
                `${ZOHO_CONFIG.apiDomain}/books/v3/contacts`,
                {
                    contact_name: data.name,
                    contact_type: 'customer',
                    email: data.email,
                    billing_address: data.address || {},
                },
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${token}`,
                    },
                    params: {
                        organization_id: ZOHO_CONFIG.organizationId,
                    },
                }
            );

            console.log(`[Zoho Books] Customer created: ${data.name}`);
            return response.data.contact;
        } catch (error: any) {
            console.error('[Zoho Books] Create customer error:', error.response?.data || error.message);
            throw error;
        }
    }

    async createInvoice(data: {
        customerId: string;
        items: Array<{
            name: string;
            description?: string;
            quantity: number;
            price: number;
        }>;
    }): Promise<any> {
        try {
            const token = await this.getAccessToken();

            // Calculate totals
            let subtotal = 0;
            const lineItems = data.items.map(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                return {
                    name: item.name,
                    description: item.description || '',
                    quantity: item.quantity,
                    rate: item.price,
                };
            });

            // Calculate GST (18%)
            const gstAmount = Math.round(subtotal * 0.18);
            const grandTotal = subtotal + gstAmount;

            const response = await axios.post(
                `${ZOHO_CONFIG.apiDomain}/books/v3/invoices`,
                {
                    customer_id: data.customerId,
                    line_items: lineItems,
                    payment_terms: 0, // Due on receipt
                    notes: `Thank you for your purchase from Hexalabs!\n\nTax Breakdown:\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}\nGST (18%): ₹${gstAmount.toLocaleString('en-IN')}\nTotal: ₹${grandTotal.toLocaleString('en-IN')}`,
                    terms: 'GST (18%) is included in the total amount.',
                },
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${token}`,
                    },
                    params: {
                        organization_id: ZOHO_CONFIG.organizationId,
                    },
                }
            );

            console.log(`[Zoho Books] Invoice created: ${response.data.invoice.invoice_number} (Subtotal: ₹${subtotal}, GST: ₹${gstAmount}, Total: ₹${grandTotal})`);
            return response.data.invoice;
        } catch (error: any) {
            console.error('[Zoho Books] Create invoice error:', error.response?.data || error.message);
            throw error;
        }
    }

    async markInvoiceAsSent(invoiceId: string): Promise<void> {
        try {
            const token = await this.getAccessToken();

            await axios.post(
                `${ZOHO_CONFIG.apiDomain}/books/v3/invoices/${invoiceId}/status/sent`,
                {},
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${token}`,
                    },
                    params: {
                        organization_id: ZOHO_CONFIG.organizationId,
                    },
                }
            );

            console.log(`[Zoho Books] Invoice ${invoiceId} marked as sent`);
        } catch (error: any) {
            console.error('[Zoho Books] Mark invoice as sent error:', error.response?.data || error.message);
            // Don't throw - this is not critical
        }
    }

    async emailInvoice(invoiceId: string, email: string): Promise<void> {
        try {
            const token = await this.getAccessToken();

            await axios.post(
                `${ZOHO_CONFIG.apiDomain}/books/v3/invoices/${invoiceId}/email`,
                {
                    to_mail_ids: [email],
                    subject: 'Invoice from Hexalabs',
                    body: 'Thank you for your purchase! Please find your invoice attached.',
                },
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${token}`,
                    },
                    params: {
                        organization_id: ZOHO_CONFIG.organizationId,
                    },
                }
            );

            console.log(`[Zoho Books] Invoice ${invoiceId} emailed to ${email}`);
        } catch (error: any) {
            console.error('[Zoho Books] Email invoice error:', error.response?.data || error.message);
            throw error;
        }
    }

    async recordPayment(invoiceId: string, amount: number, paymentId: string): Promise<void> {
        try {
            const token = await this.getAccessToken();

            // First, get invoice details to get customer_id
            const invoiceResponse = await axios.get(
                `${ZOHO_CONFIG.apiDomain}/books/v3/invoices/${invoiceId}`,
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${token}`,
                    },
                    params: {
                        organization_id: ZOHO_CONFIG.organizationId,
                    },
                }
            );

            const customerId = invoiceResponse.data.invoice.customer_id;

            // Create payment
            const paymentResponse = await axios.post(
                `${ZOHO_CONFIG.apiDomain}/books/v3/customerpayments`,
                {
                    customer_id: customerId,
                    payment_mode: 'razorpay',
                    amount: amount,
                    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                    reference_number: paymentId,
                    invoices: [
                        {
                            invoice_id: invoiceId,
                            amount_applied: amount,
                        }
                    ],
                },
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${token}`,
                    },
                    params: {
                        organization_id: ZOHO_CONFIG.organizationId,
                    },
                }
            );

            console.log(`[Zoho Books] Payment recorded for invoice ${invoiceId}: ₹${amount}`);
        } catch (error: any) {
            console.error('[Zoho Books] Record payment error:');
            console.error('Error message:', error.message);
            console.error('Error response:', JSON.stringify(error.response?.data, null, 2));
            console.error('Invoice ID:', invoiceId);
            console.error('Amount:', amount);
            console.error('Payment ID:', paymentId);
            // Don't throw - invoice is already created and sent
        }
    }
}

export const zohoBooksService = new ZohoBooksService();
