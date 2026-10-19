import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { BuildPCPage } from './pages/BuildPCPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AccountPage } from './pages/AccountPage';
import {
  AboutPage,
  ShippingPage,
  ReturnsPage,
  WarrantyPage,
  PrivacyPage,
  TermsPage,
  SupportPage,
  BrandsPage,
  OffersPage,
} from './pages/InfoPages';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminSettings } from './pages/admin/AdminSettings';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="product/:slug" element={<ProductPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="track" element={<TrackOrderPage />} />
            <Route path="build" element={<BuildPCPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="shipping" element={<ShippingPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="warranty" element={<WarrantyPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="support" element={<SupportPage />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-[#0a0b0f] text-white flex items-center justify-center px-4 text-center">
                <div>
                  <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase">404</p>
                  <h1 className="text-3xl font-bold mt-2">Page not found</h1>
                  <p className="text-zinc-400 mt-2">The page you requested does not exist.</p>
                  <Link to="/" className="inline-block mt-6 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold">
                    Back to store
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
