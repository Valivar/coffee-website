import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import About from './pages/About.jsx';
import Blend from './pages/Blend.jsx';
import Contact from './pages/Contact.jsx';
import Policies from './pages/Policies.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <CartProvider>
      <UIProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:id" element={<Product />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order/:id" element={<OrderSuccess />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="about" element={<About />} />
              <Route path="blend" element={<Blend />} />
              <Route path="contact" element={<Contact />} />
              <Route path="policies" element={<Policies />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </CartProvider>
  );
}
