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

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFromApi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/products", { cache: "no-store" });
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch products");
      }

      const items: ProductItem[] = result.data || [];
      setProducts(items);
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

    // Clear legacy localStorage cache keys if present
    try {
      localStorage.removeItem("netals_products_cache_v2");
      localStorage.removeItem("netals_products_cache_time_v2");
      localStorage.removeItem("netals_products_cache");
      localStorage.removeItem("netals_products_cache_time");
    } catch {
      // Ignore in non-browser environments
    }

    async function loadFreshProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const result = await res.json();
        if (ignore) return;

        if (result.success && Array.isArray(result.data)) {
          setProducts(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch products");
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

    loadFreshProducts();

    return () => {
      ignore = true;
    };
  }, []);

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
