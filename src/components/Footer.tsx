import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-primary-900 text-primary-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif text-xl font-semibold text-white">
                {settings?.store_name || 'Green Haven Nursery'}
              </span>
            </div>
            <p className="text-sm text-primary-200 leading-relaxed">
              {settings?.about_text?.slice(0, 120) || 'Your trusted nursery for healthy, hand-picked plants.'}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-secondary-400 transition-colors">All Plants</Link></li>
              <li><Link to="/shop?category=indoor-plants" className="hover:text-secondary-400 transition-colors">Indoor Plants</Link></li>
              <li><Link to="/shop?category=flowering-plants" className="hover:text-secondary-400 transition-colors">Flowering Plants</Link></li>
              <li><Link to="/plant-care" className="hover:text-secondary-400 transition-colors">Plant Care Guide</Link></li>
              <li><Link to="/offers" className="hover:text-secondary-400 transition-colors">Offers & Discounts</Link></li>
              <li><Link to="/about" className="hover:text-secondary-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-secondary-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Customer Service</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/order-enquiry" className="hover:text-secondary-400 transition-colors">Order Enquiry</Link></li>
              <li><Link to="/wishlist" className="hover:text-secondary-400 transition-colors">My Wishlist</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-secondary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-secondary-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-secondary-400 transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/returns" className="hover:text-secondary-400 transition-colors">Return & Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary-300" />
                <span>{settings?.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-primary-300" />
                <span>{settings?.contact_phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-primary-300" />
                <span>{settings?.contact_email}</span>
              </li>
            </ul>
            {settings?.business_hours && (
              <p className="text-xs text-primary-300 mt-3">{settings.business_hours}</p>
            )}
            <div className="flex gap-3 mt-3">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-800 hover:bg-primary-700 flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-800 hover:bg-primary-700 flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-primary-300">
            &copy; {new Date().getFullYear()} {settings?.store_name}. All rights reserved.
          </p>
          <Link to="/admin" className="text-xs text-primary-400 hover:text-primary-200 transition-colors">
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
