import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Define cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item._id === action.payload._id
              ? { ...item, qty: item.qty + action.payload.qty }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, qty: action.payload.qty || 1 }]
        };
      }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload)
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload.id
            ? { ...item, qty: action.payload.qty }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    
    case 'SET_CART_FROM_STORAGE':
      return {
        ...state,
        items: action.payload
      };
    
    default:
      return state;
  }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on initial load
  useEffect(() => {
    const cartFromStorage = localStorage.getItem('cartItems');
    if (cartFromStorage) {
      try {
        const parsedCart = JSON.parse(cartFromStorage);
        dispatch({ type: 'SET_CART_FROM_STORAGE', payload: parsedCart });
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.items));
  }, [state.items]);

  // Calculate cart totals
  const cartTotal = state.items.reduce((total, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const qty = typeof item.qty === 'number' ? item.qty : parseInt(item.qty) || 1;
    return total + (price * qty);
  }, 0);

  const cartItemCount = state.items.reduce((count, item) => count + item.qty, 0);

  const value = {
    cartItems: state.items,
    cartTotal,
    cartItemCount,
    addToCart: (product) => dispatch({ type: 'ADD_TO_CART', payload: product }),
    removeFromCart: (productId) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId }),
    updateQuantity: (id, qty) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, qty } }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' })
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};