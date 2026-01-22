import { NextRequest, NextResponse } from 'next/server';
import { LAB_INSTRUCTIONS } from '@/data/lab-instructions';

// Intelligent chatbot response based on lab data
function getIntelligentResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    const labEntries = Object.entries(LAB_INSTRUCTIONS);

    // List all courses
    if (lowerMessage.includes('what courses') || lowerMessage.includes('which courses') ||
        lowerMessage.includes('available courses') || lowerMessage.includes('courses do you offer')) {
        const courseList = labEntries.map(([_, lab], idx) =>
            `${idx + 1}. **${lab.title}** - ${lab.description} (${lab.difficulty}, ${lab.estimatedTime} mins)`
        ).join('\n\n');
        return `We offer the following hands-on cloud computing labs:\n\n${courseList}\n\nEach lab includes realistic scenarios, step-by-step instructions, and hands-on practice with Azure services. Would you like to know more about any specific course?`;
    }

    // Search for specific course
    const courseMatch = labEntries.find(([courseId, lab]) =>
        lowerMessage.includes(courseId.toLowerCase()) ||
        lowerMessage.includes(lab.title.toLowerCase().split(':')[0]) ||
        (lab.title.toLowerCase().includes('az-400') && lowerMessage.includes('az-400')) ||
        (lab.title.toLowerCase().includes('sc-200') && lowerMessage.includes('sc-200')) ||
        (lab.title.toLowerCase().includes('dp-203') && lowerMessage.includes('dp-203')) ||
        (lab.title.toLowerCase().includes('ai-102') && lowerMessage.includes('ai-102'))
    );

    if (courseMatch) {
        const [_, lab] = courseMatch;
        return `**${lab.title}**\n\n${lab.description}\n\n**Scenario:** ${lab.scenario}\n\n**What you'll learn:**\n${lab.objectives.map(obj => `• ${obj}`).join('\n')}\n\n**Prerequisites:**\n${lab.prerequisites.map(pre => `• ${pre}`).join('\n')}\n\n**Duration:** ${lab.estimatedTime} minutes | **Difficulty:** ${lab.difficulty}\n\nWould you like to know more details about this lab?`;
    }

    // Prerequisites question
    if (lowerMessage.includes('prerequisite') || lowerMessage.includes('requirements') ||
        lowerMessage.includes('what do i need')) {
        const prereqMatch = labEntries.find(([courseId, lab]) =>
            lowerMessage.includes(courseId.toLowerCase()) ||
            lowerMessage.includes(lab.title.toLowerCase().split(':')[0]) ||
            (lab.title.toLowerCase().includes('az-400') && lowerMessage.includes('az-400')) ||
            (lab.title.toLowerCase().includes('sc-200') && lowerMessage.includes('sc-200'))
        );
        if (prereqMatch) {
            const [, lab] = prereqMatch;
            return `**Prerequisites for ${lab.title}:**\n\n${lab.prerequisites.map((pre: string) => `• ${pre}`).join('\n')}\n\nThese prerequisites will help you get the most out of the lab experience.`;
        }
        return 'Prerequisites vary by course. Please specify which course you\'re interested in (e.g., "What are the prerequisites for AZ-400?")';
    }

    // Objectives/Learning outcomes
    if (lowerMessage.includes('what will i learn') || lowerMessage.includes('objectives') ||
        lowerMessage.includes('learning outcomes')) {
        if (courseMatch) {
            const [_, lab] = courseMatch;
            return `**Learning Objectives for ${lab.title}:**\n\n${lab.objectives.map(obj => `• ${obj}`).join('\n')}\n\nThis lab provides hands-on experience with real-world scenarios.`;
        }
        return 'Please specify which course you\'re interested in (e.g., "What will I learn in AZ-400?")';
    }

    // Difficulty level
    if (lowerMessage.includes('difficulty') || lowerMessage.includes('how hard') ||
        lowerMessage.includes('is it difficult')) {
        if (courseMatch) {
            const [_, lab] = courseMatch;
            return `**${lab.title}** is rated as **${lab.difficulty}** difficulty.\n\nEstimated completion time: ${lab.estimatedTime} minutes\n\nMake sure you meet the prerequisites for the best learning experience.`;
        }
        return 'Please specify which course you\'re asking about (e.g., "How difficult is SC-200?")';
    }

    // Lab launch questions
    if (lowerMessage.includes('launch') || lowerMessage.includes('start a lab') ||
        lowerMessage.includes('how to start')) {
        return 'To launch a lab:\n\n1. Go to your **Dashboard**\n2. Find the lab you purchased\n3. Click **"Launch Lab"**\n4. Wait 2-3 minutes for the VM to be provisioned\n5. Access it via the web-based RDP console\n\nEach lab includes 10 launches with 4-hour sessions. Need help with a specific lab?';
    }

    // Payment questions
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') ||
        lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return 'We accept payments via:\n• **Razorpay** (UPI, Cards, Net Banking, Wallets)\n• **Purchase Orders** for organizations\n\nAll payments are secure and encrypted. For bulk purchases or organization accounts, contact sales@hexalabs.com';
    }

    // License questions
    if (lowerMessage.includes('license') || lowerMessage.includes('validity') ||
        lowerMessage.includes('expire') || lowerMessage.includes('how long')) {
        return 'Lab licenses are valid for **180 days** from purchase. Each lab includes:\n• 10 launches\n• 4-hour sessions per launch\n\nYou can check your remaining launches in the Dashboard.';
    }

    // VM/Connection issues
    if (lowerMessage.includes('vm') || lowerMessage.includes('rdp') ||
        lowerMessage.includes('connect') || lowerMessage.includes('access') ||
        lowerMessage.includes('not working')) {
        return 'If you\'re having trouble connecting to your VM:\n\n1. Ensure the VM status shows "Running"\n2. Wait 2-3 minutes after launch for Windows to boot\n3. Try refreshing the page\n4. Clear your browser cache\n\nIf issues persist, contact support@hexalabs.com or call +91 88849 07660.';
    }

    // Support/Contact
    if (lowerMessage.includes('support') || lowerMessage.includes('contact') ||
        lowerMessage.includes('help') || lowerMessage.includes('phone') ||
        lowerMessage.includes('email')) {
        return 'You can reach our support team:\n\n📧 **Email:** support@hexalabs.com\n📞 **Phone:** +91 88849 07660\n⏰ **Hours:** 9 AM - 6 PM IST\n💬 **Live Chat:** Available during business hours\n\nHow can I help you today?';
    }

    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') ||
        lowerMessage.includes('hey') || lowerMessage === 'hi' || lowerMessage === 'hello') {
        return 'Hello! 👋 Welcome to Hexalabs support. I can help you with:\n\n• Course information and details\n• Lab launches and VM access\n• Payment and licensing questions\n• Technical support\n\nWhat would you like to know?';
    }

    // Thanks
    if (lowerMessage.includes('thank')) {
        return 'You\'re welcome! Is there anything else I can help you with? 😊';
    }

    // Default response
    return `I'm here to help! I can assist with:\n\n• **Course Information** - "What courses do you offer?"\n• **Lab Details** - "Tell me about AZ-400"\n• **Prerequisites** - "What do I need for SC-200?"\n• **Lab Launches** - "How do I launch a lab?"\n• **Payments & Licenses** - "How long are licenses valid?"\n• **Technical Support** - "I need help with VM connection"\n\nFor specific issues, contact support@hexalabs.com or call +91 88849 07660.`;
}

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Use intelligent response system
        const response = getIntelligentResponse(message);
        return NextResponse.json({ response });

    } catch (error) {
        console.error('Chat API error:', error);

        return NextResponse.json(
            {
                response: "I'm having trouble processing your request right now. For immediate assistance, please contact our support team at support@hexalabs.com or call +91 88849 07660 (9 AM - 6 PM IST)."
            },
            { status: 200 }
        );
    }
}
