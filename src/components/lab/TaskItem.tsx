"use client";

import { useState } from 'react';
import { LabTask, CodeSnippet } from '@/types/lab-instructions';
import { Check, Circle, ChevronDown, ChevronRight, Copy, Eye, EyeOff, Lightbulb } from 'lucide-react';

interface TaskItemProps {
    task: LabTask;
    isCompleted: boolean;
    isCurrent: boolean;
    onToggleComplete: (taskId: string) => void;
}

export default function TaskItem({ task, isCompleted, isCurrent, onToggleComplete }: TaskItemProps) {
    const [isExpanded, setIsExpanded] = useState(isCurrent);
    const [showHint, setShowHint] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);

    const copyToClipboard = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedSnippet(index);
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    // Helper function to render simple markdown (bold text)
    const renderMarkdown = (text: string): string => {
        // Convert **text** to <strong>text</strong>
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    return (
        <div className={`border rounded-lg mb-3 transition-all ${isCurrent ? 'border-blue-500 bg-blue-50/50' :
            isCompleted ? 'border-green-500 bg-green-50/30' :
                'border-slate-300'
            }`}>
            {/* Task Header */}
            <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                    {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                    ) : isCurrent ? (
                        <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
                            <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                    )}
                </div>

                {/* Task Title */}
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                        {task.order}. {task.title}
                    </h3>
                    <p className="text-sm text-slate-600">{task.description}</p>
                </div>

                {/* Expand Icon */}
                {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
            </div>

            {/* Task Details */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
                    {/* Instructions */}
                    <div className="mt-4">
                        <h4 className="font-semibold text-sm text-slate-700 mb-2">Instructions:</h4>
                        <ol className="space-y-3 list-none">
                            {task.instructions.map((instruction, index) => (
                                <li key={index} className="flex gap-3">
                                    {/* Step Number */}
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                                        {typeof instruction === 'object' ? instruction.step : index + 1}
                                    </div>
                                    {/* Step Content */}
                                    <div className="flex-1 pt-0.5">
                                        <div
                                            className="text-sm text-slate-700 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: renderMarkdown(typeof instruction === 'object' ? instruction.action : instruction)
                                            }}
                                        />
                                        {typeof instruction === 'object' && instruction.context && (
                                            <div className="mt-1 text-xs text-slate-500 italic">
                                                💡 {instruction.context}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Knowledge Blocks */}
                    {task.knowledgeBlocks && task.knowledgeBlocks.length > 0 && (
                        <div className="space-y-2">
                            {task.knowledgeBlocks.map((block, index) => (
                                <div
                                    key={index}
                                    className={`border-l-4 p-3 rounded-r-lg ${block.type === 'note' ? 'bg-blue-50 border-blue-500' :
                                        block.type === 'warning' ? 'bg-red-50 border-red-500' :
                                            block.type === 'tip' ? 'bg-green-50 border-green-500' :
                                                'bg-yellow-50 border-yellow-500'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg">
                                            {block.type === 'note' ? '📘' :
                                                block.type === 'warning' ? '⚠️' :
                                                    block.type === 'tip' ? '💡' : '❗'}
                                        </span>
                                        <div className="flex-1">
                                            <h5 className={`font-semibold text-sm mb-1 ${block.type === 'note' ? 'text-blue-900' :
                                                block.type === 'warning' ? 'text-red-900' :
                                                    block.type === 'tip' ? 'text-green-900' :
                                                        'text-yellow-900'
                                                }`}>
                                                {block.title}
                                            </h5>
                                            <p className={`text-sm ${block.type === 'note' ? 'text-blue-800' :
                                                block.type === 'warning' ? 'text-red-800' :
                                                    block.type === 'tip' ? 'text-green-800' :
                                                        'text-yellow-800'
                                                }`}>
                                                {block.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Code Snippets */}
                    {task.codeSnippets && task.codeSnippets.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Code:</h4>
                            {task.codeSnippets.map((snippet, index) => (
                                <div key={index} className="mb-3">
                                    {snippet.description && (
                                        <p className="text-xs text-slate-600 mb-1">{snippet.description}</p>
                                    )}
                                    <div className="relative group">
                                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                                            <code className={`language-${snippet.language}`}>
                                                {snippet.code}
                                            </code>
                                        </pre>
                                        <button
                                            onClick={() => copyToClipboard(snippet.code, index)}
                                            className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {copiedSnippet === index ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Verification */}
                    {task.verification && (
                        <div className={`border rounded-lg p-3 ${task.verification.type === 'quiz' ? 'bg-purple-50 border-purple-200' :
                            'bg-blue-50 border-blue-200'
                            }`}>
                            <h4 className={`font-semibold text-sm mb-1 ${task.verification.type === 'quiz' ? 'text-purple-900' : 'text-blue-900'
                                }`}>
                                {task.verification.type === 'quiz' ? 'Knowledge Check:' : 'Verification:'}
                            </h4>
                            <p className={`text-sm ${task.verification.type === 'quiz' ? 'text-purple-800' : 'text-blue-800'
                                }`}>
                                {task.verification.description}
                            </p>
                            {task.verification.expectedResult && (
                                <div className="mt-2 pt-2 border-t border-blue-300">
                                    <p className="text-xs font-semibold text-blue-900 mb-1">Expected Result:</p>
                                    <p className="text-xs text-blue-800">{task.verification.expectedResult}</p>
                                </div>
                            )}
                            {task.verification.quiz && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-sm font-semibold text-purple-900">{task.verification.quiz.question}</p>
                                    <div className="space-y-1">
                                        {task.verification.quiz.options.map((option, idx) => (
                                            <div
                                                key={idx}
                                                className="text-sm text-purple-800 pl-4"
                                            >
                                                {String.fromCharCode(65 + idx)}. {option}
                                            </div>
                                        ))}
                                    </div>
                                    {task.verification.quiz.explanation && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-purple-700 cursor-pointer hover:text-purple-900">
                                                Show Answer & Explanation
                                            </summary>
                                            <div className="mt-2 p-2 bg-purple-100 rounded text-xs text-purple-900">
                                                <p className="font-semibold">
                                                    Answer: {String.fromCharCode(65 + task.verification.quiz.correctAnswer)}
                                                </p>
                                                <p className="mt-1">{task.verification.quiz.explanation}</p>
                                            </div>
                                        </details>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Troubleshooting */}
                    {task.troubleshooting && task.troubleshooting.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm text-orange-900 mb-2">🔧 Troubleshooting:</h4>
                            <ul className="space-y-1 list-disc list-inside">
                                {task.troubleshooting.map((item, index) => (
                                    <li key={index} className="text-sm text-orange-800">{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Resources */}
                    {task.resources && task.resources.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">📚 Additional Resources:</h4>
                            <ul className="space-y-1">
                                {task.resources.map((resource, index) => (
                                    <li key={index}>
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                        >
                                            <span>{resource.type === 'video' ? '🎥' : resource.type === 'tutorial' ? '📖' : '📄'}</span>
                                            {resource.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Hint */}
                    {task.hint && (
                        <div>
                            <button
                                onClick={() => setShowHint(!showHint)}
                                className="flex items-center gap-2 text-sm text-yellow-700 hover:text-yellow-800 font-medium"
                            >
                                <Lightbulb className="w-4 h-4" />
                                {showHint ? 'Hide Hint' : 'Show Hint'}
                            </button>
                            {showHint && (
                                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-900">{task.hint}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Solution */}
                    {task.solution && (
                        <div>
                            <button
                                onClick={() => setShowSolution(!showSolution)}
                                className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-800 font-medium"
                            >
                                {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {showSolution ? 'Hide Solution' : 'Show Solution'}
                            </button>
                            {showSolution && (
                                <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-sm text-purple-900">{task.solution}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mark Complete Button */}
                    <div className="pt-2">
                        <button
                            onClick={() => onToggleComplete(task.id)}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${isCompleted
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
