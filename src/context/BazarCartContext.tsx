"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { BazarCartItem, BazarItem, BazarScene, BazarZone } from "@/types/bazar";
import { bazarRepository } from "@/lib/bazar/repository";
import confetti from "canvas-confetti";

interface BazarOrderConfirmation {
  orderId: string;
  totalCents: number;
  items: BazarCartItem[];
  placedAt: string;
  customerName?: string;
  customerEmail?: string;
}

interface BazarCartContextType {
  cart: BazarCartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: BazarItem, zone?: BazarZone, scene?: BazarScene) => boolean;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalCents: number;
  totalCount: number;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  orderConfirmation: BazarOrderConfirmation | null;
  clearOrderConfirmation: () => void;
  submitSimulatedCheckout: (customerName: string, customerEmail: string) => Promise<boolean>;
  resetDemoData: () => Promise<void>;
}

const BazarCartContext = createContext<BazarCartContextType | undefined>(undefined);

const BAZAR_CART_STORAGE_KEY = "spoolio_bazar_cart_v1";

export const BazarCartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<BazarCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<BazarOrderConfirmation | null>(null);

  // Load cart from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BAZAR_CART_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load bazar cart from storage", e);
    }
  }, []);

  // Save cart to storage
  useEffect(() => {
    try {
      localStorage.setItem(BAZAR_CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("Failed to save bazar cart", e);
    }
  }, [cart]);

  // Synchronize cart with repository stock changes
  useEffect(() => {
    const unsubscribe = bazarRepository.subscribe(async () => {
      const latestItems = await bazarRepository.getItems();
      setCart((prevCart) => {
        const itemMap = new Map(latestItems.map((i) => [i.id, i]));
        let modified = false;

        const updated = prevCart
          .map((cartEntry) => {
            const live = itemMap.get(cartEntry.item.id);
            if (!live) return null; // Item was deleted

            // If stock dropped below cart quantity
            const maxAllowed = Math.max(0, live.quantity);
            const clampedQty = Math.min(cartEntry.quantity, maxAllowed);

            if (clampedQty !== cartEntry.quantity || live.status !== cartEntry.item.status) {
              modified = true;
            }

            if (clampedQty <= 0) return null;

            return {
              ...cartEntry,
              item: live,
              quantity: clampedQty,
            };
          })
          .filter(Boolean) as BazarCartItem[];

        return modified ? updated : prevCart;
      });
    });

    return unsubscribe;
  }, []);

  const addToCart = (item: BazarItem, zone?: BazarZone, scene?: BazarScene): boolean => {
    if (item.status === "sold" || item.quantity <= 0) {
      return false;
    }

    let addedSuccessfully = false;

    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.item.id === item.id);

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        // Enforce stock ceiling
        if (existing.quantity >= item.quantity) {
          return prev;
        }

        addedSuccessfully = true;
        const next = [...prev];
        next[existingIndex] = {
          ...existing,
          quantity: existing.quantity + 1,
        };
        return next;
      }

      addedSuccessfully = true;
      return [...prev, { item, quantity: 1, zone, scene }];
    });

    if (addedSuccessfully) {
      setIsCartOpen(true);
    }

    return addedSuccessfully;
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCart((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((c) => c.item.id !== itemId);
      }

      return prev.map((entry) => {
        if (entry.item.id === itemId) {
          // Clamp to maximum available in stock
          const clamped = Math.min(newQuantity, entry.item.quantity);
          return { ...entry, quantity: clamped };
        }
        return entry;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCents = cart.reduce(
    (sum, c) => sum + c.item.priceCents * c.quantity,
    0
  );

  const totalCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const submitSimulatedCheckout = async (
    customerName: string,
    customerEmail: string
  ): Promise<boolean> => {
    if (cart.length === 0) return false;

    const purchases = cart.map((c) => ({
      itemId: c.item.id,
      quantity: c.quantity,
    }));

    // Trigger local simulation: decrements stock in mock repo
    const result = await bazarRepository.simulateOrder(purchases);

    if (result.success) {
      const orderData: BazarOrderConfirmation = {
        orderId: result.orderId,
        totalCents,
        items: [...cart],
        placedAt: new Date().toISOString(),
        customerName: customerName.trim() || "Visiteur de l'Atelier",
        customerEmail: customerEmail.trim() || "visiteur@spoolio.fr",
      };

      setOrderConfirmation(orderData);
      setCart([]);
      setIsCheckoutOpen(false);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FF5500", "#121212", "#FFAA00", "#FFFFFF"],
        });
      } catch (e) {
        // silent fail if canvas not ready
      }

      return true;
    }

    return false;
  };

  const clearOrderConfirmation = () => {
    setOrderConfirmation(null);
  };

  const resetDemoData = async () => {
    await bazarRepository.resetToDemoData();
    clearCart();
    clearOrderConfirmation();
  };

  return (
    <BazarCartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCents,
        totalCount,
        isCheckoutOpen,
        setIsCheckoutOpen,
        orderConfirmation,
        clearOrderConfirmation,
        submitSimulatedCheckout,
        resetDemoData,
      }}
    >
      {children}
    </BazarCartContext.Provider>
  );
};

const fallbackCartContext: BazarCartContextType = {
  cart: [],
  isCartOpen: false,
  setIsCartOpen: () => {},
  addToCart: () => false,
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalCents: 0,
  totalCount: 0,
  isCheckoutOpen: false,
  setIsCheckoutOpen: () => {},
  orderConfirmation: null,
  clearOrderConfirmation: () => {},
  submitSimulatedCheckout: async () => false,
  resetDemoData: async () => {},
};

export function useBazarCart(): BazarCartContextType {
  const ctx = useContext(BazarCartContext);
  if (!ctx) {
    return fallbackCartContext;
  }
  return ctx;
}

