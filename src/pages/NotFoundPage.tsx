import { Link } from 'react-router-dom';
import { Leaf, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-10 h-10 text-primary-500" />
        </div>
        <h1 className="font-serif text-6xl font-bold text-primary-600 mb-2">404</h1>
        <p className="text-xl font-medium text-gray-900 mb-2">Page Not Found</p>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">The page you are looking for might have been moved or doesn't exist. Let's get you back to the garden.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
          <Home className="w-5 h-5" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
