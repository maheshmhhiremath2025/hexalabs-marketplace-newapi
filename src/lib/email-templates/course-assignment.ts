import { getBaseTemplate } from './base-template';

export interface CourseAssignmentData {
    userName: string;
    userEmail: string;
    courseId: string;
    courseName: string;
    maxLaunches: number;
    expiryDate: string;
    organizationName?: string;
}

export function getCourseAssignmentTemplate(data: CourseAssignmentData): string {
    const content = `
        <h2 style="color: #1e293b; margin-bottom: 10px;">Welcome to Your New Lab! 🎉</h2>
        <p style="color: #64748b; font-size: 16px;">Hi ${data.userName},</p>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Great news! You've been assigned a new course${data.organizationName ? ` by ${data.organizationName}` : ''}. 
            You can now start your hands-on training.
        </p>

        <div class="card">
            <h3 style="margin-top: 0; color: #1e293b; display: flex; align-items: center;">
                📚 ${data.courseName}
            </h3>
            <table style="border: none; margin: 20px 0 0 0;">
                <tr style="border: none;">
                    <td style="border: none; padding: 8px 0; color: #64748b;">Course ID:</td>
                    <td style="border: none; padding: 8px 0; text-align: right;">
                        <span class="highlight">${data.courseId.toUpperCase()}</span>
                    </td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none; padding: 8px 0; color: #64748b;">Launches Available:</td>
                    <td style="border: none; padding: 8px 0; text-align: right;">
                        <span class="highlight">${data.maxLaunches} launches</span>
                    </td>
                </tr>
                <tr style="border: none;">
                    <td style="border: none; padding: 8px 0; color: #64748b;">Access Expires:</td>
                    <td style="border: none; padding: 8px 0; text-align: right;">
                        <span class="highlight">${data.expiryDate}</span>
                    </td>
                </tr>
            </table>
        </div>

        <div class="card" style="background-color: #eff6ff; border-left-color: #3b82f6;">
            <h3 style="margin-top: 0; color: #1e293b;">🚀 Getting Started</h3>
            <ol style="color: #475569; line-height: 1.8; padding-left: 20px; margin: 10px 0 0 0;">
                <li>Log in to your Hexalabs dashboard</li>
                <li>Navigate to <strong>"My Labs"</strong></li>
                <li>Find your course: <strong>${data.courseId.toUpperCase()}</strong></li>
                <li>Click <strong>"Launch Lab"</strong> to begin</li>
            </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
                Access My Labs
            </a>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>💡 Pro Tip:</strong> Each lab launch gives you a fully configured environment. 
                Make the most of your ${data.maxLaunches} launches by completing all exercises!
            </p>
        </div>

        <p style="color: #64748b; margin-top: 30px; font-size: 14px;">
            Need help getting started? Reply to this email or check out our 
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/help" style="color: #3b82f6;">Help Center</a>.
        </p>

        <p style="color: #475569; margin-top: 20px;">
            Happy learning! 🎓<br>
            <strong>The Hexalabs Team</strong>
        </p>
    `;

    return getBaseTemplate(content);
}
