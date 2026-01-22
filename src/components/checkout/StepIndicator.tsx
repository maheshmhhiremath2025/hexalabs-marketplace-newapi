'use client';

import { Check } from 'lucide-react';

interface Step {
    number: number;
    title: string;
    description: string;
}

interface StepIndicatorProps {
    currentStep: number;
    steps: Step[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
    return (
        <div className="w-full py-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step.number < currentStep
                                        ? 'bg-green-600 text-white'
                                        : step.number === currentStep
                                            ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {step.number < currentStep ? (
                                    <Check className="h-6 w-6" />
                                ) : (
                                    step.number
                                )}
                            </div>

                            {/* Step Label */}
                            <div className="mt-2 text-center">
                                <div
                                    className={`text-sm font-semibold ${step.number === currentStep
                                            ? 'text-blue-600'
                                            : step.number < currentStep
                                                ? 'text-green-600'
                                                : 'text-gray-500'
                                        }`}
                                >
                                    {step.title}
                                </div>
                                <div className="text-xs text-gray-500 hidden md:block">
                                    {step.description}
                                </div>
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-1 mx-4 -mt-12">
                                <div
                                    className={`h-full transition-all duration-300 ${step.number < currentStep
                                            ? 'bg-green-600'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
