"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = "lamha_cart_items_v1";

let cachedCart: CartItem[] = [];
let hasReadStorage = false;
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  if (!hasReadStorage) {
    hasReadStorage = true;
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cachedCart = parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to load cart from localStorage", err);
    }
  }
  return cachedCart;
}

function persistCart(newCart: CartItem[]) {
  cachedCart = newCart;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    } catch (err) {
      console.warn("Failed to save cart to localStorage", err);
    }
  }
  notifySubscribers();
}

function subscribeCart(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

const emptyCart: CartItem[] = [];

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const cart = useSyncExternalStore(
    subscribeCart,
    getStoredCart,
    () => emptyCart
  );

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen((prev) => !prev), []);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    const current = getStoredCart();
    const existing = current.find((i) => i.id === item.id);
    let next: CartItem[];
    if (existing) {
      next = current.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      next = [...current, { ...item, quantity }];
    }
    persistCart(next);
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const current = getStoredCart();
    persistCart(current.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const current = getStoredCart();
    if (quantity <= 0) {
      persistCart(current.filter((item) => item.id !== id));
      return;
    }
    persistCart(
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    persistCart([]);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce((sum, item) => {
    const unitPrice =
      item.discount_price && item.discount_price > 0 ? item.discount_price : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
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
