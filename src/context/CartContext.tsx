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
  isLoyaltyReward?: boolean;
  rewardPointsCost?: number;
  loyaltyCardId?: string;
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

export interface AppliedPromo {
  id?: string;
  code: string;
  description?: string | null;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  minOrderAmount: number;
}

import { DEFAULT_SHIPPING_CONFIG, ShippingConfig } from "@/types/shipping";

export type { ShippingConfig };

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
  appliedPromo: AppliedPromo | null;
  discountAmount: number;
  promoError: string | null;
  shippingConfig: ShippingConfig;
  applyPromoCode: (code: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "relay" | "home">("home");
  const [selectedRelay, setSelectedRelay] = useState<SelectedRelay | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>(DEFAULT_SHIPPING_CONFIG);

  // Fetch dynamic shipping config from API
  useEffect(() => {
    fetch("/api/shipping-config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.config) {
          setShippingConfig(data.config);
        }
      })
      .catch((err) => console.warn("Could not fetch shipping config:", err));
  }, []);

  // Load cart, shipping and promo details from localStorage on mount
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
      const savedPromo = localStorage.getItem("spoolio_applied_promo");
      if (savedPromo) {
        setAppliedPromo(JSON.parse(savedPromo));
      }
    } catch (e) {
      console.error("Error loading cart data:", e);
    }
    setInitialized(true);
  }, []);

  // Save cart, shipping and promo to localStorage when changed
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
      if (appliedPromo) {
        localStorage.setItem("spoolio_applied_promo", JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem("spoolio_applied_promo");
      }
    } catch (e) {
      console.error("Error saving cart data:", e);
    }
  }, [cartItems, shippingMethod, selectedRelay, appliedPromo, initialized]);

  // Recalculate dynamic roundup price dynamically when normal items change
  useEffect(() => {
    if (!initialized) return;
    const roundUpItem = cartItems.find((item) => item.productId === -1);
    if (roundUpItem) {
      const normalTotal = cartItems
        .filter((item) => item.productId > 0)
        .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);

      const expectedAmount =
        normalTotal > 0
          ? Math.ceil(normalTotal) - normalTotal === 0
            ? 1.0
            : Math.ceil(normalTotal) - normalTotal
          : 0;

      if (expectedAmount > 0 && parseFloat(roundUpItem.price) !== expectedAmount) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.productId === -1 ? { ...item, price: expectedAmount.toFixed(2) } : item
          )
        );
      } else if (normalTotal === 0) {
        // If cart becomes empty of normal items, remove the roundup item
        setCartItems((prev) => prev.filter((item) => item.productId !== -1));
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

  const addToCart = (
    item: Omit<CartItem, "id" | "quantity">,
    quantity: number = 1,
    openCart: boolean = true
  ) => {
    const id = getComboId(item.productId, item.selectedOptions);

    setCartItems((prevItems) => {
      // If it is a donation (productId === -3), remove any previous donation and add the new one instead of aggregating
      if (item.productId === -3) {
        const filtered = prevItems.filter((i) => i.productId !== -3);
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
    setAppliedPromo(null);
    setPromoError(null);
    try {
      localStorage.removeItem("spoolio_applied_promo");
    } catch (e) {}
  };

  // Compute aggregate totals
  const cartCount = cartItems
    .filter((item) => item.productId > 0)
    .reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (acc, item) => acc + parseFloat(item.price) * item.quantity,
    0
  );

  // Normal products subtotal (eligible for discounts & free shipping calculation)
  const cartTotalNormal = cartItems
    .filter((item) => item.productId > 0 && !item.isLoyaltyReward)
    .reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);

  // Compute discount amount dynamically
  let discountAmount = 0;
  if (appliedPromo) {
    // Check if minimum order amount is satisfied
    if (!appliedPromo.minOrderAmount || cartTotalNormal >= appliedPromo.minOrderAmount) {
      if (appliedPromo.discountType === "percentage") {
        discountAmount =
          Math.round(((cartTotalNormal * appliedPromo.discountValue) / 100) * 100) / 100;
        discountAmount = Math.min(cartTotalNormal, discountAmount);
      } else if (appliedPromo.discountType === "fixed") {
        discountAmount = Math.min(cartTotalNormal, appliedPromo.discountValue);
      }
    }
  }

  // Net total eligible for free shipping calculation (subtotal after discounts)
  const netTotalNormal = Math.max(0, cartTotalNormal - discountAmount);

  // Compute Shipping costs dynamically from dynamic config
  const isFreeShippingByAmount = netTotalNormal >= shippingConfig.freeShippingThreshold;
  const isFreeShippingByPromo =
    shippingConfig.enablePromoFreeShipping &&
    appliedPromo?.discountType === "free_shipping" &&
    (!appliedPromo.minOrderAmount || cartTotalNormal >= appliedPromo.minOrderAmount);

  const isFreeShipping = isFreeShippingByAmount || isFreeShippingByPromo;

  const shippingCost =
    shippingMethod === "pickup"
      ? shippingConfig.pickupShippingCost
      : isFreeShipping
      ? 0
      : shippingMethod === "relay"
      ? shippingConfig.relayShippingCost
      : shippingConfig.homeShippingCost;

  const cartTotalWithShipping = Math.max(0, cartTotal - discountAmount + shippingCost);

  // Apply promo code action
  const applyPromoCode = async (
    code: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) {
      const err = "Veuillez entrer un code promo.";
      setPromoError(err);
      return { success: false, error: err };
    }

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, cartTotal: cartTotalNormal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        const err = data.error || "Code promo invalide.";
        setPromoError(err);
        return { success: false, error: err };
      }

      setAppliedPromo(data.promo);
      setPromoError(null);
      return { success: true, message: data.message };
    } catch (e: any) {
      const err = "Erreur de connexion lors de la validation du code promo.";
      setPromoError(err);
      return { success: false, error: err };
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError(null);
    try {
      localStorage.removeItem("spoolio_applied_promo");
      localStorage.removeItem("spoolio_active_promo_code");
    } catch (e) {}
  };

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
        appliedPromo,
        discountAmount,
        promoError,
        shippingConfig,
        applyPromoCode,
        removePromoCode,
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
