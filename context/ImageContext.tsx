"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

interface ImageContextType {
  cachedUrls: Record<string, string>;
  getCachedUrl: (src: string) => string;
  preloadImage: (src: string) => Promise<string>;
  preloadImages: (srcs: string[]) => Promise<void>;
  isCached: (src: string) => boolean;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

const CACHE_NAME = "lamha-image-cache-v1";

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const [cachedUrls, setCachedUrls] = useState<Record<string, string>>({});
  const cacheMapRef = useRef<Map<string, string>>(new Map());
  const activeRequestsRef = useRef<Map<string, Promise<string>>>(new Map());

  // Load and cache an image directly from its link
  const preloadImage = useCallback(async (src: string): Promise<string> => {
    if (!src || typeof window === "undefined") return src;

    // 1. Check in-memory cache
    if (cacheMapRef.current.has(src)) {
      return cacheMapRef.current.get(src)!;
    }

    // 2. Check in-flight deduplicated request
    if (activeRequestsRef.current.has(src)) {
      return activeRequestsRef.current.get(src)!;
    }

    const requestPromise = (async () => {
      try {
        // 3. Check browser Cache Storage API
        if ("caches" in window) {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(src);

          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            const blobUrl = URL.createObjectURL(blob);
            cacheMapRef.current.set(src, blobUrl);
            setCachedUrls((prev) => ({ ...prev, [src]: blobUrl }));
            return blobUrl;
          }

          // Fetch fresh from network and store in Cache Storage
          const response = await fetch(src, { cache: "default" });
          if (response.ok) {
            await cache.put(src, response.clone());
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            cacheMapRef.current.set(src, blobUrl);
            setCachedUrls((prev) => ({ ...prev, [src]: blobUrl }));
            return blobUrl;
          }
        } else {
          // Fallback to fetch blob
          const response = await fetch(src, { cache: "default" });
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            cacheMapRef.current.set(src, blobUrl);
            setCachedUrls((prev) => ({ ...prev, [src]: blobUrl }));
            return blobUrl;
          }
        }
      } catch (err) {
        console.warn("Image preloader note:", src, err);
      } finally {
        activeRequestsRef.current.delete(src);
      }
      return src;
    })();

    activeRequestsRef.current.set(src, requestPromise);
    return requestPromise;
  }, []);

  const preloadImages = useCallback(
    async (srcs: string[]) => {
      if (!Array.isArray(srcs) || srcs.length === 0) return;
      const unique = Array.from(new Set(srcs.filter(Boolean)));
      await Promise.all(unique.map((src) => preloadImage(src)));
    },
    [preloadImage]
  );

  const getCachedUrl = useCallback(
    (src: string): string => {
      if (!src) return src;
      return cacheMapRef.current.get(src) || cachedUrls[src] || src;
    },
    [cachedUrls]
  );

  const isCached = useCallback((src: string): boolean => {
    return cacheMapRef.current.has(src);
  }, []);

  return (
    <ImageContext.Provider
      value={{
        cachedUrls,
        getCachedUrl,
        preloadImage,
        preloadImages,
        isCached,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}

export function useImageCache() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageCache must be used within an ImageProvider");
  }
  return context;
}

/**
 * Hook to get the cached URL for a given image source link.
 * Updates seamlessly when the source link changes (e.g. ?v= parameter updates).
 */
export function useCachedImage(src: string | undefined): {
  src: string;
  isCached: boolean;
} {
  const context = useContext(ImageContext);
  const targetSrc = src || "";

  useEffect(() => {
    if (targetSrc && context) {
      context.preloadImage(targetSrc);
    }
  }, [targetSrc, context]);

  if (!context || !targetSrc) {
    return { src: targetSrc, isCached: false };
  }

  const cached = context.getCachedUrl(targetSrc);
  return {
    src: cached,
    isCached: context.isCached(targetSrc),
  };
}
