import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Leaf, ArrowLeft, Loader2 } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminLoginPage() {
  const { signIn } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-950 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.pexels.com/photos/16433504/pexels-photo-16433504.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-primary-300 text-sm mb-8 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="admin@greenhaven.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-error-50 text-error-600 text-sm rounded-xl p-3 border border-error-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Authorized personnel only. Contact your administrator if you need access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
