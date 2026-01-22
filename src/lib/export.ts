/**
 * Export utility for REST API
 * Provides CSV and JSON export functionality
 */

/**
 * Convert array of objects to CSV string
 */
export function toCSV(data: any[], headers?: string[]): string {
    if (!data || data.length === 0) {
        return '';
    }

    // Get headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0]);

    // Create header row
    const headerRow = csvHeaders.join(',');

    // Create data rows
    const dataRows = data.map(item => {
        return csvHeaders.map(header => {
            const value = item[header];

            // Handle different value types
            if (value === null || value === undefined) {
                return '';
            }

            if (typeof value === 'object') {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }

            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }

            return value;
        }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
}

/**
 * Convert array of objects to JSON string
 */
export function toJSON(data: any[], pretty = false): string {
    return JSON.stringify(data, null, pretty ? 2 : 0);
}

/**
 * Flatten nested objects for CSV export
 */
export function flattenObject(obj: any, prefix = ''): any {
    const flattened: any = {};

    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
            flattened[newKey] = value.join('; ');
        } else {
            flattened[newKey] = value;
        }
    });

    return flattened;
}

/**
 * Flatten array of nested objects
 */
export function flattenArray(data: any[]): any[] {
    return data.map(item => flattenObject(item));
}

/**
 * Export data with appropriate format
 */
export function exportData(data: any[], format: 'csv' | 'json', flatten = false): string {
    const exportData = flatten ? flattenArray(data) : data;

    if (format === 'csv') {
        return toCSV(exportData);
    } else {
        return toJSON(exportData, true);
    }
}

/**
 * Get content type for format
 */
export function getContentType(format: 'csv' | 'json'): string {
    return format === 'csv' ? 'text/csv' : 'application/json';
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: 'csv' | 'json'): string {
    return format;
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, format: 'csv' | 'json'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    return `${prefix}_${timestamp}.${getFileExtension(format)}`;
}
