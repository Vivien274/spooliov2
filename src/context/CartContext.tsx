"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // unique ID computed: productId-option1-option2...
  productId: number;
  name: string;
  slug: string;
  price: string;
  quantity: number;
  selectedOptions: Record<string, string>;
  image: string;
}

export interface SelectedRelay {
  id: string;
  name: string;
  address: string;
  cp: string;
  ville: string;
  latitude?: string;
  longitude?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "id" | "quantity">, quantity?: number, openCart?: boolean) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  shippingMethod: "pickup" | "relay" | "home";
  setShippingMethod: (method: "pickup" | "relay" | "home") => void;
  selectedRelay: SelectedRelay | null;
  setSelectedRelay: (relay: SelectedRelay | null) => void;
  shippingCost: number;
  cartTotalWithShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "relay" | "home">("home");
  const [selectedRelay, setSelectedRelay] = useState<SelectedRelay | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Load cart and shipping details from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("spoolio_cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      const savedMethod = localStorage.getItem("spoolio_shipping_method");
      if (savedMethod && ["pickup", "relay", "home"].includes(savedMethod)) {
        setShippingMethod(savedMethod as any);
      }
      const savedRelay = localStorage.getItem("spoolio_selected_relay");
      if (savedRelay) {
        setSelectedRelay(JSON.parse(savedRelay));
      }
    } catch (e) {
      console.error("Error loading cart data:", e);
    }
    setInitialized(true);
  }, []);

  // Save cart and shipping to localStorage when changed
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem("spoolio_cart", JSON.stringify(cartItems));
      localStorage.setItem("spoolio_shipping_method", shippingMethod);
      if (selectedRelay) {
        localStorage.setItem("spoolio_selected_relay", JSON.stringify(selectedRelay));
      } else {
        localStorage.removeItem("spoolio_selected_relay");
      }
    } catch (e) {
      console.error("Error saving cart data:", e);
    }
  }, [cartItems, shippingMethod, selectedRelay, initialized]);

  // Recalculate dynamic roundup price dynamically when normal items change
  useEffect(() => {
    if (!initialized) return;
    const roundUpItem = cartItems.find(item => item.productId === -1);
    if (roundUpItem) {
      const normalTotal = cartItems
        .filter((item) => item.productId > 0)
        .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
      
      const expectedAmount = normalTotal > 0 
        ? (Math.ceil(normalTotal) - normalTotal === 0 ? 1.00 : Math.ceil(normalTotal) - normalTotal)
        : 0;

      if (expectedAmount > 0 && parseFloat(roundUpItem.price) !== expectedAmount) {
        setCartItems(prev => prev.map(item => 
          item.productId === -1 ? { ...item, price: expectedAmount.toFixed(2) } : item
        ));
      } else if (normalTotal === 0) {
        // If cart becomes empty of normal items, remove the roundup item
        setCartItems(prev => prev.filter(item => item.productId !== -1));
      }
    }
  }, [cartItems, initialized]);

  // Compute unique key for variation combo
  const getComboId = (productId: number, selectedOptions: Record<string, string>) => {
    const optionsKey = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join("-");
    return `${productId}-${optionsKey}`;
  };

  const addToCart = (item: Omit<CartItem, "id" | "quantity">, quantity: number = 1, openCart: boolean = true) => {
    const id = getComboId(item.productId, item.selectedOptions);
    
    setCartItems((prevItems) => {
      // If it is a donation (productId === -3), remove any previous donation and add the new one instead of aggregating
      if (item.productId === -3) {
        const filtered = prevItems.filter(i => i.productId !== -3);
        return [...filtered, { ...item, id, quantity: 1 }];
      }

      const existingIndex = prevItems.findIndex((i) => i.id === id);
      if (existingIndex > -1) {
        // Increment quantity of existing item
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }
      // Add new item
      return [...prevItems, { ...item, id, quantity }];
    });
    
    // Automatically open the cart drawer for premium UX feedback
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Compute aggregate totals
  const cartCount = cartItems.filter(item => item.productId > 0).reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + parseFloat(item.price) * item.quantity,
    0
  );

  // Compute Shipping costs dynamically (offered over 40€ of normal products)
  const cartTotalNormal = cartItems.filter(item => item.productId > 0).reduce(
    (acc, item) => acc + parseFloat(item.price) * item.quantity,
    0
  );
  const isFreeShipping = cartTotalNormal >= 40;
  const shippingCost = shippingMethod === "pickup"
    ? 0
    : (isFreeShipping ? 0 : (shippingMethod === "relay" ? 3.90 : 4.90));

  const cartTotalWithShipping = cartTotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        shippingMethod,
        setShippingMethod,
        selectedRelay,
        setSelectedRelay,
        shippingCost,
        cartTotalWithShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
