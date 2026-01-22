import Papa from 'papaparse';

export interface CSVUser {
    name: string;
    email: string;
    role: 'org_admin' | 'org_member' | 'user';
}

export interface CSVParseResult {
    valid: CSVUser[];
    errors: Array<{
        row: number;
        email: string;
        error: string;
    }>;
}

export function parseUserCSV(csvContent: string): CSVParseResult {
    const result: CSVParseResult = {
        valid: [],
        errors: [],
    };

    const parsed = Papa.parse<any>(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
    });

    parsed.data.forEach((row, index) => {
        const rowNumber = index + 2; // +2 because index starts at 0 and header is row 1

        // Validate required fields
        if (!row.name || !row.email) {
            result.errors.push({
                row: rowNumber,
                email: row.email || 'Unknown',
                error: 'Missing required fields (name, email)',
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
            result.errors.push({
                row: rowNumber,
                email: row.email,
                error: 'Invalid email format',
            });
            return;
        }

        // Validate role
        const validRoles = ['org_admin', 'org_member', 'user'];
        const role = row.role?.toLowerCase() || 'org_member';
        if (!validRoles.includes(role)) {
            result.errors.push({
                row: rowNumber,
                email: row.email,
                error: `Invalid role: ${row.role}. Must be one of: ${validRoles.join(', ')}`,
            });
            return;
        }

        // Add valid user
        result.valid.push({
            name: row.name.trim(),
            email: row.email.trim().toLowerCase(),
            role: role as 'org_admin' | 'org_member' | 'user',
        });
    });

    return result;
}

export function generateCSVTemplate(): string {
    return `name,email,role
John Doe,john@company.com,org_member
Jane Smith,jane@company.com,org_member
Bob Admin,bob@company.com,org_admin`;
}
