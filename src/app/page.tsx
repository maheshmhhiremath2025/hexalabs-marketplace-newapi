import Link from 'next/link';
import { MOCK_COURSES } from '@/lib/mock-data';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  // Split courses into featured and new products
  const featuredCourses = MOCK_COURSES.slice(0, 4);
  const newCourses = MOCK_COURSES.slice(4, 8);

  return (
    <div className="flex-1">
      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-wide mb-2">
              Featured Products
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <ProductCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-wide mb-2">
              New Products
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newCourses.map((course) => (
              <ProductCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              View All Products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
