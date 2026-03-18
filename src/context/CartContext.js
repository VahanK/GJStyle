import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addItem(product, { quantity, plating, stone_color, notes }) {
    setItems((prev) => {
      // Check if exact same product+plating+stone combo exists
      const idx = prev.findIndex(
        (i) => i.product_id === product.id && i.plating === plating && i.stone_color === stone_color
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url,
          product_category: product.category,
          quantity,
          plating,
          stone_color,
          notes,
        },
      ];
    });
  }

  function updateItem(index, changes) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateItem, removeItem, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
