import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface CartItem {
  id: string;  // Changed from number to string for MongoDB ObjectId
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load items from localStorage after component mounts
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('cartItems');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error('Failed to load cart items:', error);
    }
    setIsInitialized(true);
  }, []);

  // Use useCallback to memoize functions
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.id === item.id);
      const newItems = existingItem
        ? currentItems.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...currentItems, { ...item, quantity: 1 }];
      
      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.id !== id);
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(currentItems => {
      const newItems = currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    localStorage.removeItem('cartItems');
    setItems([]);
  }, []);

  // Calculate totals only when items change
  const totalItems = React.useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = React.useMemo(() => 
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [items]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
