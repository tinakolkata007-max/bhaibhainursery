import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { AdminProvider } from '@/context/AdminContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import PlantCarePage from '@/pages/PlantCarePage';
import PlantCareDetailPage from '@/pages/PlantCareDetailPage';
import OffersPage from '@/pages/OffersPage';
import WishlistPage from '@/pages/WishlistPage';
import OrderEnquiryPage from '@/pages/OrderEnquiryPage';
import PolicyPage from '@/pages/PolicyPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <AdminProvider>
              <BrowserRouter>
                <Routes>
                  {/* Admin routes - no storefront layout */}
                  <Route path="/admin" element={<AdminLoginPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />

                  {/* Storefront routes */}
                  <Route
                    path="*"
                    element={
                      <Layout>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/shop" element={<ShopPage />} />
                          <Route path="/product/:id" element={<ProductDetailPage />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/plant-care" element={<PlantCarePage />} />
                          <Route path="/plant-care/:slug" element={<PlantCareDetailPage />} />
                          <Route path="/offers" element={<OffersPage />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route path="/order-enquiry" element={<OrderEnquiryPage />} />
                          <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
                          <Route path="/terms" element={<PolicyPage type="terms" />} />
                          <Route path="/shipping-policy" element={<PolicyPage type="shipping" />} />
                          <Route path="/returns" element={<PolicyPage type="returns" />} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </Layout>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </AdminProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </SettingsProvider>
  );
}
