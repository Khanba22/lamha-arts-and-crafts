"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  discount_price: number;
  tag: string;
  category: string;
  occasions: string[];
  images: string[];
  one_liner: string;
  description: string;
  highlighted: boolean;
  inventory_size: number;
}

interface ProductsContextType {
  products: ProductItem[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const CACHE_KEY = "netals_products_cache_v2";
const CACHE_TIME_KEY = "netals_products_cache_time_v2";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

function getInitialCachedProducts(): ProductItem[] {
  if (typeof window === "undefined") return [];
  try {
    const cachedTimeStr = localStorage.getItem(CACHE_TIME_KEY);
    const cachedDataStr = localStorage.getItem(CACHE_KEY);

    if (cachedTimeStr && cachedDataStr) {
      const cachedTime = parseInt(cachedTimeStr, 10);
      const age = Date.now() - cachedTime;

      if (age < ONE_DAY_MS) {
        const parsedProducts: ProductItem[] = JSON.parse(cachedDataStr);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          return parsedProducts;
        }
      }
    }
  } catch (e) {
    console.warn("Failed to read from cache:", e);
  }
  return [];
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductItem[]>(getInitialCachedProducts);
  const [loading, setLoading] = useState<boolean>(() => products.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchFromApi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/products");
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch products");
      }

      const items: ProductItem[] = result.data || [];
      setProducts(items);

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(items));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } catch (storageErr) {
        console.warn("Could not cache products to localStorage:", storageErr);
      }
    } catch (err: unknown) {
      console.error("Products fetch error:", err);
      const message = err instanceof Error ? err.message : "Failed to load products";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initializeProducts() {
      if (products.length > 0) {
        return;
      }

      try {
        const res = await fetch("/api/products");
        const result = await res.json();
        if (ignore) return;

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch products");
        }

        const items: ProductItem[] = result.data || [];
        setProducts(items);

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(items));
          localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        } catch (storageErr) {
          console.warn("Could not cache products to localStorage:", storageErr);
        }
      } catch (err: unknown) {
        if (ignore) return;
        const message = err instanceof Error ? err.message : "Failed to load products";
        setError(message);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    initializeProducts();

    return () => {
      ignore = true;
    };
  }, [products.length]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts: fetchFromApi,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}
