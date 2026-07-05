import React, { createContext, useContext, useReducer, useMemo } from 'react';

const CartContext = createContext(null);

const initialState = {
  items: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { productId, name, price, image, quantity = 1 } = action.payload;
      const existingItem = state.items.find((item) => item.productId === productId);

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            productId,
            name,
            price,
            image,
            quantity,
          },
        ],
      };
    }

    case 'REMOVE_ITEM': {
      const { productId } = action.payload;
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== productId),
      };
    }

    case 'UPDATE_QTY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.productId !== productId),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        quantity,
      },
    });
  };

  const removeItem = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { productId },
    });
  };

  const updateQty = (productId, quantity) => {
    dispatch({
      type: 'UPDATE_QTY',
      payload: { productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Compute subtotal
  const subtotal = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const value = useMemo(
    () => ({
      items: state.items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      subtotal,
      itemCount: state.items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    [state.items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}
