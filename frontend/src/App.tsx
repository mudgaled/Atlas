import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Index from "./pages/Index";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductsPage from "./pages/ProductsPage";
import SuppliersPage from "./pages/SuppliersPage";
import LogisticsPage from "./pages/LogisticsPage";
import Company from "./pages/Company";
import Pricing from "./pages/Pricing";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import ProfilePage from "./pages/ProfilePage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import SellerOrders from "./pages/SellerOrders";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import ProductManagement from "./pages/ProductManagement";
import SellerRequests from "./pages/SellerRequests";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <CartProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="relative">
              <Navbar />
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/suppliers" element={<SuppliersPage />} />
                  <Route path="/logistics" element={<LogisticsPage />} />
                  <Route path="/company" element={<Company />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  <Route path="/seller-dashboard" element={<SellerDashboard />} />
                  <Route path="/seller-products" element={<SellerProducts />} />
                  <Route path="/add-product" element={<AddProductPage />} />
                  <Route path="/edit-product/:id" element={<EditProductPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/seller-orders" element={<SellerOrders />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/products" element={<ProductManagement />} />
                  <Route path="/admin/seller-requests" element={<SellerRequests />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </CartProvider>
  </AuthProvider>
);

export default App;
