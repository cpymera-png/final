import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { Toaster } from "sonner";

import "@/App.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import CookieBanner from "./components/CookieBanner";
import WhatsappFab from "./components/WhatsappFab";
import AnnouncementBar from "./components/AnnouncementBar";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import About from "./pages/About";
import Professional from "./pages/Professional";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Certifications from "./pages/Certifications";
import CustomerService from "./pages/CustomerService";
import {
  AvisoLegal,
  PoliticaCookies,
  PoliticaPrivacidad,
  Condiciones,
} from "./pages/legal/Legal";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminPriceImport from "./pages/admin/AdminPriceImport";

function PublicLayout() {
  const loc = useLocation();
  const isCheckout = loc.pathname.startsWith("/checkout") || loc.pathname.startsWith("/pago");
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <main className="fade-in-up min-h-[60vh]">
        <Outlet />
      </main>
      {!isCheckout && <Footer />}
    </>
  );
}

function AdminShell() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Toaster position="bottom-right" richColors={false} closeButton theme="light" />
          <CookieBanner />
          <WhatsappFab />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tienda" element={<Shop />} />
              <Route path="/producto/:slug" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pago/success" element={<PaymentSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/cuenta" element={<Account />} />
              <Route path="/sobre-nosotros" element={<About />} />
              <Route path="/profesional" element={<Professional />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/certificaciones" element={<Certifications />} />
              <Route path="/atencion-cliente" element={<CustomerService />} />
              <Route path="/legal/aviso-legal" element={<AvisoLegal />} />
              <Route path="/legal/politica-cookies" element={<PoliticaCookies />} />
              <Route path="/legal/politica-privacidad" element={<PoliticaPrivacidad />} />
              <Route path="/legal/condiciones" element={<Condiciones />} />
            </Route>
            <Route element={<AdminShell />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="pedidos/:id" element={<AdminOrderDetail />} />
                <Route path="clientes" element={<AdminCustomers />} />
                <Route path="productos" element={<AdminProducts />} />
                <Route path="precios" element={<AdminPriceImport />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
