export function getBaseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hexalabs</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .footer {
            background-color: #f1f5f9;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #3b82f6;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #2563eb;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #475569;
        }
        .card {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
        .highlight {
            color: #3b82f6;
            font-weight: 600;
        }
        .total-row {
            font-weight: 700;
            font-size: 18px;
            color: #1e293b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 HEXALABS</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>Hexalabs</strong> - Cloud Lab Training Platform</p>
            <p>Need help? Reply to this email or contact support@hexalabs.com</p>
            <p style="margin-top: 20px; font-size: 12px;">
                © ${new Date().getFullYear()} Hexalabs. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}
