import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Toast from "./components/Toast.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Cart from "./pages/Cart.jsx";
import NotFound from "./pages/NotFound.jsx";
import Blog from "./pages/Blog.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Product from "./pages/Product.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmed from "./pages/OrderConfirmed.jsx";
import Orders, { OrderDetail } from "./pages/Orders.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmed" element={<OrderConfirmed />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:number" element={<OrderDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
      <WhatsAppButton />
    </>
  );
}
