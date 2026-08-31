import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// Public & User Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Deals from "./pages/Deals";
import Authenticator from "./pages/Authenticator";
import TrackOrder from "./pages/TrackOrder";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUs from "./pages/ContactUs";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import SetPassword from "./pages/SetPassword";
import MyOrders from "./pages/MyOrders";
import ForgotPassword from "./pages/ForgotPassword";
import UserProfile from "./pages/UserProfile";

// Admin Panel
import AdminLayout from "./admin/layout/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/Products";
import AddEditProduct from "./admin/pages/AddEditProduct";
import Orders from "./admin/pages/Orders";
import Customers from "./admin/pages/Customers";
import AdminDeals from "./admin/pages/Deals";
import Settings from "./admin/pages/Settings";
import AdminLogin from "./admin/pages/AdminLogin";
import AuthenticatorCodes from "./admin/pages/AuthenticatorCodes";
import StaffManagement from "./admin/pages/StaffManagement";
import AdminProtectedRoute, { PermissionRoute } from "./components/AdminProtectedRoute";

function SiteLayout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <SiteLayout>
            <Routes>
              {/* Public Store Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/authenticator" element={<Authenticator />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />

              {/* User Authentication & Profile Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/account" element={<UserProfile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Admin Auth Route */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Panel Routes with RBAC Permission Guards */}
              <Route path="/admin" element={<AdminProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route
                    index
                    element={
                      <PermissionRoute permission="dashboard.view">
                        <Dashboard />
                      </PermissionRoute>
                    }
                  />
                  <Route
                    path="products"
                    element={
                      <PermissionRoute permission="products.view">
                        <AdminProducts />
                      </PermissionRoute>
                    }
                  />
                  <Route
                    path="products/new"
                    element={
                      <PermissionRoute permission="products.create">
                        <AddEditProduct />
                      </PermissionRoute>
                    }
                  />
                  <Route
                    path="products/edit/:id"
                    element={
                      <PermissionRoute permission="products.edit">
                        <AddEditProduct />
                      </PermissionRoute>
                    }
                  />
                  <Route
                    path="orders"
                    element={
                      <PermissionRoute permission="orders.view">
                        <Orders />
                      </PermissionRoute>
                    }
                  />
                  <Route
                    path="customers"
                    element={
                      <PermissionRoute permission="customers.view">
                        <Customers />
                      </PermissionRoute>
                    }
                  />
                  <Route
                    path="deals"
                    element={
                      <PermissionRoute permission="deals.view">
                        <AdminDeals />
                      </PermissionRoute>
                    }
                  />
                  <Route
                    path="staff"
                    element={
                      <PermissionRoute permission="staff.view">
                        <StaffManagement />
                      </PermissionRoute>
                    }
                  />
                  <Route
                    path="authenticator"
                    element={
                      <PermissionRoute permission="authenticator.view">
                        <AuthenticatorCodes />
                      </PermissionRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <PermissionRoute permission="settings.view">
                        <Settings />
                      </PermissionRoute>
                    }
                  />
                </Route>
              </Route>
            </Routes>
          </SiteLayout>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}