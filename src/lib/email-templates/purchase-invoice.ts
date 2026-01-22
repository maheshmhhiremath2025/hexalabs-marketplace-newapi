import { getBaseTemplate } from './base-template';

export interface PurchaseItem {
    courseId: string;
    quantity: number;
    price: number;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: string;
    organizationName: string;
    adminEmail: string;
    items: PurchaseItem[];
    subtotal: number;
    total: number;
}

export function getPurchaseInvoiceTemplate(data: InvoiceData): string {
    const itemsHtml = data.items.map(item => `
        <tr>
            <td>${item.courseId.toUpperCase()}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">$${item.price.toFixed(2)}</td>
            <td style="text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
    `).join('');

    const content = `
        <h2 style="color: #1e293b; margin-bottom: 10px;">Purchase Invoice</h2>
        <p style="color: #64748b; font-size: 16px;">Thank you for your purchase!</p>

        <div class="card">
            <table style="border: none; margin: 0;">
                <tr style="border: none;">
                    <td style="border: none; padding: 4px 0;"><strong>Invoice Number:</strong></td>
                    <td style="border: none; padding: 4px 0; text-align: right;">${data.invoiceNumber}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none; padding: 4px 0;"><strong>Date:</strong></td>
                    <td style="border: none; padding: 4px 0; text-align: right;">${data.date}</td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none; padding: 4px 0;"><strong>Organization:</strong></td>
                    <td style="border: none; padding: 4px 0; text-align: right;">${data.organizationName}</td>
                </tr>
            </table>
        </div>

        <h3 style="color: #1e293b; margin-top: 30px;">Purchase Details</h3>
        <table>
            <thead>
                <tr>
                    <th>Course</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
                <tr class="total-row">
                    <td colspan="3" style="text-align: right; padding-top: 20px;">Subtotal:</td>
                    <td style="text-align: right; padding-top: 20px;">$${data.subtotal.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total:</td>
                    <td style="text-align: right; color: #3b82f6;">$${data.total.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div class="card" style="margin-top: 30px;">
            <h3 style="margin-top: 0; color: #1e293b;">Next Steps</h3>
            <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
                <li>Go to <strong>Team Management</strong> in your dashboard</li>
                <li>Assign labs to your team members</li>
                <li>Track usage and progress in <strong>Analytics</strong></li>
            </ol>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" class="button">
                View Dashboard
            </a>
        </div>

        <p style="color: #64748b; margin-top: 30px; font-size: 14px;">
            Your licenses are now active and ready to be assigned. Each license is valid for 180 days from the purchase date.
        </p>
    `;

    return getBaseTemplate(content);
}
