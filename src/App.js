import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Categories from './pages/Categories';
import Subcategories from './pages/Subcategories';
import Products from './pages/Products';
import Footer from './components/Footer';
import Navbar from './components/navbar';
import ProductDetail from './pages/Product';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import NotFound from './pages/NotFound';
import { UserProvider } from './providers/UserProvider';

const LocationContext = createContext();

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userId'); // Adjust based on your auth storage
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppWrapper() {
  const [currentPath, setCurrentPath] = useState("/");

  return (
    <div className="AppWrapper">
      <Router>
        <LocationContext.Provider value={{ currentPath, setCurrentPath }}>
          <App />
        </LocationContext.Provider>
      </Router>
      {currentPath !== '/' && <Footer className="Footer" />}
    </div>
  );
}

function App() {
  const location = useLocation();
  const { setCurrentPath } = useContext(LocationContext);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location, setCurrentPath]);

  const isLoginPage = location.pathname === '/';

  return (
    <UserProvider>
      <div className="App">
        {!isLoginPage && <Navbar />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<NotFound />} />
          {/* Protected Routes */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orderhistory" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/subcategories/:id" element={<ProtectedRoute><Subcategories /></ProtectedRoute>} />
          <Route path="/products/:categoryId" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/products/:categoryId/:subcategoryId" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/product/:productId" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        </Routes>
      </div>
    </UserProvider>
  );
}

export default AppWrapper;
