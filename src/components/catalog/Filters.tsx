'use client';

import { MOCK_COURSES } from '@/lib/mock-data';

interface FiltersProps {
    selectedTopics: string[];
    onTopicChange: (topics: string[]) => void;
}

export function Filters({ selectedTopics, onTopicChange }: FiltersProps) {
    // Get unique categories from courses
    const uniqueCategories = Array.from(new Set(MOCK_COURSES.map(course => course.category))).sort();

    const handleTopicToggle = (topic: string) => {
        if (selectedTopics.includes(topic)) {
            onTopicChange(selectedTopics.filter(t => t !== topic));
        } else {
            onTopicChange([...selectedTopics, topic]);
        }
    };

    const clearAllTopics = () => {
        onTopicChange([]);
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-24 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Topic</h3>
                    {selectedTopics.length > 0 && (
                        <button
                            onClick={clearAllTopics}
                            className="text-xs text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    {uniqueCategories.map((topic) => (
                        <label key={topic} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedTopics.includes(topic)}
                                onChange={() => handleTopicToggle(topic)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-200 select-none">
                                {topic}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-4">Level</h3>
                <div className="space-y-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                        <label key={level} className="flex items-center gap-3 cursor-not-allowed group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                disabled
                            />
                            <span className="text-sm text-gray-400 select-none">
                                {level}
                            </span>
                        </label>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">Coming soon</p>
            </div>

            <div>
                <h3 className="font-semibold text-slate-900 mb-4">Price</h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-not-allowed group">
                        <input
                            type="radio"
                            name="price"
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            defaultChecked
                            disabled
                        />
                        <span className="text-sm text-gray-400 select-none">Any</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-not-allowed group">
                        <input
                            type="radio"
                            name="price"
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled
                        />
                        <span className="text-sm text-gray-400 select-none">Under $50</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-not-allowed group">
                        <input
                            type="radio"
                            name="price"
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled
                        />
                        <span className="text-sm text-gray-400 select-none">$50 - $100</span>
                    </label>
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">Coming soon</p>
            </div>
        </div>
    );
}
