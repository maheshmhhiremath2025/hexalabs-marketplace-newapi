import Link from 'next/link';
import { Course } from '@/lib/mock-data';
import { AddToCartButton } from '@/components/catalog/AddToCartButton';

export function CourseCard({ course }: { course: Course }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col h-full">
            <div className="aspect-video bg-slate-100 relative items-center justify-center flex">
                {/* Placeholder for Image */}
                <div className="text-slate-400 font-medium text-lg">{course.id.toUpperCase()}</div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-slate-700">
                    {course.level}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex gap-2 mb-3">
                    {course.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                    {course.tags.length > 2 && <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">+{course.tags.length - 2}</span>}
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                    {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <span className="font-bold text-lg text-slate-900">${course.price}</span>
                    <AddToCartButton course={course} variant="compact" />
                </div>
            </div>
        </div>
    );
}
