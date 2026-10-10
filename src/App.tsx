import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { AdminProvider } from '@/context/AdminContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
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
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </BrowserRouter>
        </AdminProvider>
      </CartProvider>
    </SettingsProvider>
  );
}
