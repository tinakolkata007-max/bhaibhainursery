import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Leaf, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';

export default function Header() {
  const { totalItems, setCartOpen } = useCart();
  const { settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Indoor', path: '/shop?category=indoor-plants' },
    { label: 'Flowering', path: '/shop?category=flowering-plants' },
    { label: 'Fruit', path: '/shop?category=fruit-plants' },
    { label: 'Medicinal', path: '/shop?category=medicinal-plants' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-2'
            : 'bg-white/80 backdrop-blur-sm py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shadow-sm">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-xl font-semibold text-primary-800 block leading-tight">
                  {settings?.store_name || 'Green Haven'}
                </span>
                <span className="text-[10px] text-primary-500 uppercase tracking-widest">
                  Nursery
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.slice(0, 6).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-full hover:bg-primary-50 transition-colors text-gray-700"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-primary-50 transition-colors text-gray-700"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-secondary-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-full hover:bg-primary-50 transition-colors text-gray-700"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="mt-3 animate-slide-up">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plants..."
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                />
              </form>
            </div>
          )}
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-up">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Admin Login
              </Link>
            </nav>
          </div>
        )}
      </header>
      <div className="h-[72px]" />
    </>
  );
}
