// Lab Instruction Data Types - Skillable-Style Enhanced

export interface LabInstruction {
    id: string;
    courseId: string;
    title: string;
    description: string;
    scenario: string; // Real-world business context
    estimatedTime: number; // minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';

    // Learning outcomes
    objectives: string[];
    prerequisites: string[];

    // Lab introduction
    introduction: {
        overview: string;
        scenario: string;
        architecture?: string; // Description of what will be built
    };

    // Lab tasks
    tasks: LabTask[];

    // Lab conclusion
    summary: {
        whatYouLearned: string[];
        nextSteps: string[];
        additionalResources?: Resource[];
    };
}

export interface LabTask {
    id: string;
    order: number;
    title: string;
    description: string; // What and why

    // Knowledge blocks (notes, warnings, tips)
    knowledgeBlocks?: KnowledgeBlock[];

    // Structured step-by-step instructions
    instructions: InstructionStep[];

    // Code snippets
    codeSnippets?: CodeSnippet[];

    // Verification
    verification: TaskVerification;

    // Help & resources
    hint?: string;
    troubleshooting?: string[];
    resources?: Resource[];
    solution?: string;
}

export interface InstructionStep {
    step: number;
    action: string; // Single sentence - what to do
    context?: string; // Where/why - optional context
    screenshot?: string; // Path to screenshot
}

export interface KnowledgeBlock {
    type: 'note' | 'warning' | 'tip' | 'important';
    title: string;
    content: string;
}

export interface CodeSnippet {
    language: string;
    code: string;
    filename?: string;
    description?: string;
}

export interface TaskVerification {
    type: 'manual' | 'automated' | 'quiz';
    description: string;
    expectedResult?: string;
    script?: string; // PowerShell script for automated verification
    expectedOutput?: string;
    quiz?: Quiz;
}

export interface Quiz {
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct option
    explanation?: string;
}

export interface Resource {
    title: string;
    url: string;
    type: 'documentation' | 'video' | 'article' | 'tutorial';
}

export interface LabProgress {
    userId: string;
    courseId: string;
    labId: string;
    completedTasks: string[]; // Array of task IDs
    currentTask: string; // Current task ID
    startedAt: Date;
    lastUpdated: Date;
    completed: boolean;
    completedAt?: Date;
    quizScores?: Record<string, boolean>; // taskId -> passed
}

