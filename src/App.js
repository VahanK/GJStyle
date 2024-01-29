import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Login from './pages/login';
import Categories from './pages/Categories'; // Import your Categories component
import Subcategories from './pages/Subcategories'; // Import Subcategories component
import Products from './pages/Products'; // Import Products component
import Footer from './components/Footer';
import Navbar from './components/navbar';
import ProductDetail from './pages/Product';
import Cart from './pages/Cart';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/subcategories/:id" element={<Subcategories />} />
        <Route path="/products/:categoryId" element={<Products />} />
        <Route path="/products/:categoryId/:subcategoryId" element={<Products />} />


        <Route path="/product/:productId" element={<ProductDetail />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
