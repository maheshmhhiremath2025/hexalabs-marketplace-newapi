"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { LabInstruction } from '@/types/lab-instructions';
import { getLabInstructions } from '@/data/lab-instructions';
import TaskItem from './TaskItem';
import { BookOpen, Clock, Target, CheckCircle2, ChevronDown, ChevronRight, Wifi, Copy, Loader2, Check, AlertCircle, FileText, Download } from 'lucide-react';
import LabControls from './LabControls';
import AzurePortalAccess from './AzurePortalAccess';

interface LabInstructionsProps {
    purchaseId: string;
    courseId: string;
    vmPublicIP?: string;
    labId: string;
    launchCount?: number;
    maxLaunches?: number;
    sessionExpiresAt?: Date;
    azureUsername?: string;
    azurePassword?: string;
    azureResourceGroup?: string;
    requiresAzurePortal?: boolean; // NEW: Flag to show/hide Azure Portal Access
}

export default function LabInstructions({
    purchaseId,
    courseId,
    vmPublicIP,
    labId,
    launchCount,
    maxLaunches,
    sessionExpiresAt,
    azureUsername,
    azurePassword,
    azureResourceGroup,
    requiresAzurePortal = false // Default to false
}: LabInstructionsProps) {
    const [instructions, setInstructions] = useState<LabInstruction | null>(null);
    const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [showCredentials, setShowCredentials] = useState(false);
    const [showObjectives, setShowObjectives] = useState(false);
    const [showGettingStarted, setShowGettingStarted] = useState(true);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load progress from API (with localStorage fallback)
    useEffect(() => {
        const labInstructions = getLabInstructions(courseId);
        if (labInstructions) {
            setInstructions(labInstructions);
            loadProgress();
        }
    }, [courseId, purchaseId]);

    const loadProgress = async () => {
        try {
            // Try to load from API first
            const response = await fetch(`/api/labs/progress?purchaseId=${purchaseId}`);
            if (response.ok) {
                const data = await response.json();
                setCompletedTasks(new Set(data.completedTasks || []));
                setCurrentTaskIndex(data.currentTaskIndex || 0);
                console.log('[LabInstructions] Loaded progress from API:', data);
                return;
            }
        } catch (error) {
            console.error('[LabInstructions] Failed to load from API:', error);
        }

        // Fallback to localStorage
        const savedProgress = localStorage.getItem(`lab-progress-${courseId}`);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            setCompletedTasks(new Set(progress.completedTasks));
            setCurrentTaskIndex(progress.currentTaskIndex || 0);
            console.log('[LabInstructions] Loaded progress from localStorage');
        }
    };

    // Debounced save to API
    const saveProgressToAPI = useCallback(async (tasks: string[], taskIndex: number) => {
        try {
            setSyncStatus('saving');
            const response = await fetch('/api/labs/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchaseId,
                    completedTasks: tasks,
                    currentTaskIndex: taskIndex
                })
            });

            if (response.ok) {
                setSyncStatus('saved');
                setTimeout(() => setSyncStatus('idle'), 2000);
                console.log('[LabInstructions] Progress saved to API');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('[LabInstructions] Failed to save to API:', error);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus('idle'), 3000);
        }
    }, [purchaseId]);

    const handleToggleComplete = (taskId: string) => {
        setCompletedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
                // Move to next task
                const taskIndex = instructions?.tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== undefined && taskIndex < (instructions?.tasks.length || 0) - 1) {
                    setCurrentTaskIndex(taskIndex + 1);
                }
            }

            const tasksArray = Array.from(newSet);
            const newTaskIndex = currentTaskIndex;

            // Save to localStorage immediately (instant feedback)
            localStorage.setItem(`lab-progress-${courseId}`, JSON.stringify({
                completedTasks: tasksArray,
                currentTaskIndex: newTaskIndex
            }));

            // Debounce API save (wait 2 seconds after last change)
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                saveProgressToAPI(tasksArray, newTaskIndex);
            }, 2000);

            return newSet;
        });
    };

    if (!instructions) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">No lab instructions available for this course</p>
                </div>
            </div>
        );
    }

    const progress = (completedTasks.size / instructions.tasks.length) * 100;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Compact Progress Header */}
            <div className="border-b border-slate-200 p-2 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">{completedTasks.size}/{instructions.tasks.length} Complete</span>
                        {/* Sync Status Indicator */}
                        {syncStatus === 'saving' && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-600">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Saving...</span>
                            </div>
                        )}
                        {syncStatus === 'saved' && (
                            <div className="flex items-center gap-1 text-[10px] text-green-600">
                                <Check className="w-3 h-3" />
                                <span>Saved</span>
                            </div>
                        )}
                        {syncStatus === 'error' && (
                            <div className="flex items-center gap-1 text-[10px] text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                <span>Error</span>
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-slate-600">{instructions.estimatedTime}m</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Getting Started - Collapsible */}
                <div className="border-b border-slate-200">
                    <button
                        onClick={() => setShowGettingStarted(!showGettingStarted)}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-sm text-slate-900">Getting Started</span>
                        </div>
                        {showGettingStarted ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                    </button>

                    {showGettingStarted && (
                        <div className="px-3 pb-3 bg-slate-50">
                            <h3 className="text-sm font-bold text-slate-900 mb-1">{instructions.title}</h3>
                            <p className="text-xs text-slate-600 mb-2">{instructions.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Target className="w-3 h-3" />
                                <span className="capitalize">{instructions.difficulty}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* VM Credentials - Collapsible */}
                <div className="border-b border-slate-200">
                    <button
                        onClick={() => setShowCredentials(!showCredentials)}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Wifi className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-sm text-slate-900">VM Credentials</span>
                        </div>
                        {showCredentials ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                    </button>

                    {showCredentials && (
                        <div className="px-3 pb-3 space-y-2 bg-slate-50">
                            {vmPublicIP ? (
                                <>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">VM IP:</span>
                                        <span className="font-mono text-blue-600 font-bold">{vmPublicIP}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Port:</span>
                                        <span className="font-mono text-slate-700">3389</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Username:</span>
                                        <span className="font-mono text-green-600">azureuser</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Password:</span>
                                        <span className="font-mono text-yellow-600">P@ssw0rd1234!</span>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-slate-200">
                                        <LabControls
                                            purchaseId={purchaseId}
                                            courseId={courseId}
                                            launchCount={launchCount}
                                            maxLaunches={maxLaunches}
                                            sessionExpiresAt={sessionExpiresAt}
                                        />
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-slate-500">Waiting for VM...</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Cloud Slice Restrictions PDF - Only show for Cloud Slice courses */}
                {requiresAzurePortal && (
                    <div className="border-b border-slate-200">
                        <div className="p-3 bg-amber-50 border-l-4 border-amber-500">
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-amber-900 mb-1">
                                        Cloud Slice Restrictions
                                    </h4>
                                    <p className="text-xs text-amber-700 mb-2">
                                        Please review the Azure resource restrictions and guidelines before starting your lab.
                                    </p>
                                    <a
                                        href="/docs/cloud-slice-restrictions.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-md transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        View Restrictions PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Azure Portal Access - Only show for Cloud Slice courses */}
                {requiresAzurePortal && (
                    <div className="border-b border-slate-200 p-3">
                        <AzurePortalAccess
                            courseId={courseId}
                            azureUsername={azureUsername}
                            azurePassword={azurePassword}
                            azureResourceGroup={azureResourceGroup}
                        />
                    </div>
                )}

                {/* Learning Objectives - Collapsible */}
                <div className="border-b border-slate-200">
                    <button
                        onClick={() => setShowObjectives(!showObjectives)}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-sm text-slate-900">Learning Objectives</span>
                        </div>
                        {showObjectives ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                    </button>

                    {showObjectives && (
                        <div className="px-3 pb-3 bg-slate-50">
                            <ul className="space-y-1">
                                {instructions.objectives.map((objective, index) => (
                                    <li key={index} className="text-xs text-slate-600 flex items-start gap-2">
                                        <span className="text-blue-500 mt-0.5">•</span>
                                        <span>{objective}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Tasks - Scrollable with custom scrollbar */}
                <div className="border-b border-slate-200">
                    <div className="p-3 pb-0">
                        <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Tasks
                        </h3>
                    </div>
                    <div className="px-3 pb-3 max-h-[500px] overflow-y-auto" style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#cbd5e1 #f1f5f9'
                    }}>
                        {instructions.tasks.map((task, index) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                isCompleted={completedTasks.has(task.id)}
                                isCurrent={index === currentTaskIndex && !completedTasks.has(task.id)}
                                onToggleComplete={handleToggleComplete}
                            />
                        ))}
                    </div>
                </div>

                {/* Completion Message */}
                {completedTasks.size === instructions.tasks.length && (
                    <div className="border-t border-slate-200 p-3 bg-green-50">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <div>
                                <h3 className="font-bold text-sm text-green-900">Lab Completed! 🎉</h3>
                                <p className="text-xs text-green-700">Great job!</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
