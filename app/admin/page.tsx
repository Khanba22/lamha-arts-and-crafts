"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Unlock,
  Search,
  SlidersHorizontal,
  Sparkles,
  Edit3,
  X,
  Check,
  Plus,
  ArrowUpRight,
  LogOut,
  Package,
  PackagePlus,
  Layers,
  TrendingUp,
  AlertCircle,
  Eye,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Star,
} from "lucide-react";
import { ProductItem } from "@/context/ProductsContext";
import AddProductModal from "@/components/AddProductModal";


// Predefined occasion suggestions
const POPULAR_OCCASIONS = [
  "Diwali",
  "Pooja",
  "Wedding",
  "Housewarming",
  "Haldi Kumkum",
  "Ganesh Chaturthi",
  "Navratri",
  "Raksha Bandhan",
  "Trousseau Packing",
  "Return Gifts",
];

const POPULAR_TAGS = ["BESTSELLER", "NEW", "FESTIVE", "HANDMADE", "EXCLUSIVE", "LIMITED"];

interface ImageItemState {
  id: string;
  url: string;
  isExisting: boolean;
  existingIndex?: number;
  base64?: string;
  name: string;
}

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Products Data
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [highlightedOnlyFilter, setHighlightedOnlyFilter] = useState(false);

  // Create Product State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Editing State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    price: number;
    discount_price: number;
    category: string;
    isCustomCategory: boolean;
    customCategory: string;
    tag: string;
    isCustomTag: boolean;
    customTag: string;
    occasions: string[];
    customOccasionInput: string;
    one_liner: string;
    description: string;
    highlighted: boolean;
    inventory_size: number;
    imagesList: ImageItemState[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");


  // Check auth on load
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session");
      const data = await res.json();
      setIsAuthenticated(Boolean(data.authenticated));
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Load products when authenticated
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setFetchError("");
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setFetchError(data.error || "Failed to load products");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error connecting to server";
      setFetchError(msg);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated, loadProducts]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setLoginUsername("");
        setLoginPassword("");
      } else {
        setLoginError(data.error || "Invalid username or password");
      }
    } catch {
      setLoginError("Login request failed. Check your network.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setProducts([]);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Extract all existing categories and tags from loaded products
  const existingCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category.trim());
    });
    return Array.from(cats).sort();
  }, [products]);

  const existingTags = useMemo(() => {
    const tags = new Set<string>(POPULAR_TAGS);
    products.forEach((p) => {
      if (p.tag) tags.add(p.tag.trim());
    });
    return Array.from(tags).sort();
  }, [products]);

  // Handle new product creation
  const handleProductCreated = (newProduct: ProductItem) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  // Delete product with confirmation
  const handleDeleteProduct = async (product: ProductItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    // Optimistically remove from state
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback on failure
        setProducts((prev) => [product, ...prev]);
        alert("Failed to delete product: " + (data.error || "Unknown error"));
      } else {
        if (editingProduct?.id === product.id) {
          closeEditModal();
        }
      }
    } catch (err: unknown) {
      setProducts((prev) => [product, ...prev]);
      const msg = err instanceof Error ? err.message : "Network error deleting product";
      alert("Error: " + msg);
    }
  };

  // Quick toggle highlighted directly from table/card
  const handleToggleHighlighted = async (product: ProductItem) => {
    const newStatus = !product.highlighted;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, highlighted: newStatus } : p))
    );

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ highlighted: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        // Rollback on failure
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, highlighted: !newStatus } : p))
        );
        alert("Failed to update highlight status: " + data.error);
      }
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, highlighted: !newStatus } : p))
      );
    }
  };

  // Open Edit Modal & Populate Form
  const openEditModal = (product: ProductItem) => {
    const isCatKnown = existingCategories.includes(product.category);
    const isTagKnown = existingTags.includes(product.tag);

    const initialImages: ImageItemState[] = (product.images || []).map((imgUrl, idx) => {
      const match = imgUrl.match(/\/api\/images\/[^/]+\/(\d+)/);
      const realIdx = match ? parseInt(match[1], 10) : idx;

      return {
        id: `existing-${realIdx}-${idx}-${Date.now()}`,
        url: imgUrl,
        isExisting: true,
        existingIndex: realIdx,
        name: `Image ${idx + 1}`,
      };
    });

    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: product.price || 0,
      discount_price: product.discount_price || 0,
      category: isCatKnown ? product.category : "custom",
      isCustomCategory: !isCatKnown && Boolean(product.category),
      customCategory: !isCatKnown ? product.category : "",
      tag: isTagKnown ? product.tag : product.tag ? "custom" : "",
      isCustomTag: !isTagKnown && Boolean(product.tag),
      customTag: !isTagKnown ? product.tag : "",
      occasions: Array.isArray(product.occasions) ? [...product.occasions] : [],
      customOccasionInput: "",
      one_liner: product.one_liner || "",
      description: product.description || "",
      highlighted: Boolean(product.highlighted),
      inventory_size: product.inventory_size || 0,
      imagesList: initialImages,
    });
    setSaveSuccessMessage("");
    setSaveErrorMessage("");
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm(null);
    setSaveSuccessMessage("");
    setSaveErrorMessage("");
  };

  // Image Reordering & Upload handlers
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (!editForm) return;
    if (toIndex < 0 || toIndex >= editForm.imagesList.length) return;

    const list = [...editForm.imagesList];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    setEditForm({ ...editForm, imagesList: list });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!editForm) return;
    const list = editForm.imagesList.filter((_, idx) => idx !== indexToRemove);
    setEditForm({ ...editForm, imagesList: list });
  };

  const handleSetAsCover = (index: number) => {
    if (!editForm || index === 0) return;
    handleMoveImage(index, 0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm || !e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const newItems: ImageItemState[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      newItems.push({
        id: `upload-${Date.now()}-${i}`,
        url: base64,
        isExisting: false,
        base64: base64,
        name: file.name,
      });
    }

    setEditForm({
      ...editForm,
      imagesList: [...editForm.imagesList, ...newItems],
    });

    // Reset input
    e.target.value = "";
  };

  // Add custom occasion tag
  const handleAddOccasion = () => {
    if (!editForm || !editForm.customOccasionInput.trim()) return;
    const newOcc = editForm.customOccasionInput.trim();
    if (!editForm.occasions.includes(newOcc)) {
      setEditForm({
        ...editForm,
        occasions: [...editForm.occasions, newOcc],
        customOccasionInput: "",
      });
    } else {
      setEditForm({ ...editForm, customOccasionInput: "" });
    }
  };

  // Remove occasion tag
  const handleRemoveOccasion = (occToRemove: string) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      occasions: editForm.occasions.filter((o) => o !== occToRemove),
    });
  };

  // Toggle predefined occasion
  const handleTogglePredefinedOccasion = (occ: string) => {
    if (!editForm) return;
    const exists = editForm.occasions.includes(occ);
    setEditForm({
      ...editForm,
      occasions: exists
        ? editForm.occasions.filter((o) => o !== occ)
        : [...editForm.occasions, occ],
    });
  };

  // Save Product Updates
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editForm) return;

    setIsSaving(true);
    setSaveSuccessMessage("");
    setSaveErrorMessage("");

    const finalCategory =
      editForm.category === "custom" || editForm.isCustomCategory
        ? editForm.customCategory.trim()
        : editForm.category.trim();

    const finalTag =
      editForm.tag === "custom" || editForm.isCustomTag
        ? editForm.customTag.trim()
        : editForm.tag.trim();

    // Map ordered images with their sources
    const imagesData = editForm.imagesList.map((img) => {
      if (img.isExisting && typeof img.existingIndex === "number") {
        return {
          type: "existing",
          index: img.existingIndex,
        };
      }
      return {
        type: "new",
        base64: img.base64 || img.url,
      };
    });

    const payload = {
      name: editForm.name.trim(),
      price: Number(editForm.price),
      discount_price: Number(editForm.discount_price),
      category: finalCategory,
      tag: finalTag,
      occasions: editForm.occasions,
      one_liner: editForm.one_liner.trim(),
      description: editForm.description.trim(),
      highlighted: editForm.highlighted,
      inventory_size: Number(editForm.inventory_size),
      imagesData,
    };

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.data) {
        // Update local state
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data.data } : p))
        );
        setSaveSuccessMessage("Product and image gallery updated successfully in MongoDB!");
        setTimeout(() => {
          closeEditModal();
        }, 1200);
      } else {
        setSaveErrorMessage(data.error || "Failed to save product changes.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error saving product";
      setSaveErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tag && p.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.occasions && p.occasions.some((o) => o.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        (p.category && p.category.toLowerCase() === selectedCategoryFilter.toLowerCase());

      const matchesHighlight = !highlightedOnlyFilter || Boolean(p.highlighted);

      return matchesSearch && matchesCategory && matchesHighlight;
    });
  }, [products, searchQuery, selectedCategoryFilter, highlightedOnlyFilter]);

  // Loading initial auth state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-brand-ivory flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-peacock animate-spin" />
          <p className="font-serif text-sm text-brand-peacock">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-peacock-tint border border-border-soft text-brand-peacock">
            <Lock className="w-6 h-6" />
          </div>
          <span className="font-script font-semibold text-xs tracking-wider uppercase text-brand-pink block">
            Lamha Arts &amp; Craft
          </span>
          <h2 className="font-serif text-3xl font-bold text-brand-peacock tracking-tight">
            Admin Portal
          </h2>
          <p className="font-sans text-xs text-brand-charcoal/70">
            Sign in with administrative credentials to manage products and inventory.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-brand-cream border border-border-gold rounded-2xl p-8 shadow-card space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="flex items-center gap-2 rounded-lg bg-pink-tint/80 border border-border-pink p-3 text-xs text-brand-pink">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-lg border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-peacock py-3 text-sm font-semibold text-brand-ivory shadow-card hover:bg-brand-peacock/90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Enter Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-border-soft pt-4 text-center">
              <Link
                href="/"
                className="font-sans text-xs text-brand-peacock hover:underline inline-flex items-center gap-1"
              >
                <span>&larr; Back to storefront</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-brand-ivory text-brand-charcoal flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 border-b border-border-soft bg-brand-cream/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-peacock text-brand-ivory font-serif font-bold text-lg">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold text-brand-peacock leading-none">
                  Lamha Arts &amp; Craft
                </h1>
                <span className="rounded-full bg-gold-tint border border-border-gold px-2 py-0.5 text-[10px] font-semibold text-brand-gold uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-brand-charcoal/60 mt-0.5">
                Product Catalog &amp; Inventory Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-peacock px-3.5 py-1.5 text-xs font-semibold text-brand-ivory shadow-card hover:bg-brand-peacock/90 transition-all cursor-pointer"
            >
              <PackagePlus className="w-4 h-4 text-brand-gold" />
              <span>+ Add Product</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-border-soft bg-brand-ivory px-3 py-1.5 text-xs font-medium text-brand-charcoal hover:border-brand-peacock hover:text-brand-peacock transition-colors"
            >
              <span>View Storefront</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-brand-ivory px-3 py-1.5 text-xs font-medium text-brand-pink hover:bg-pink-tint transition-colors cursor-pointer"
              title="Sign out of admin portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border-soft bg-brand-cream p-4 shadow-card">
            <div className="flex items-center justify-between text-brand-charcoal/60 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Items</span>
              <Package className="w-4 h-4 text-brand-peacock" />
            </div>
            <span className="font-price text-2xl font-bold text-brand-peacock">
              {products.length}
            </span>
          </div>

          <div className="rounded-xl border border-border-soft bg-brand-cream p-4 shadow-card">
            <div className="flex items-center justify-between text-brand-charcoal/60 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Highlighted</span>
              <Sparkles className="w-4 h-4 text-brand-gold" />
            </div>
            <span className="font-price text-2xl font-bold text-brand-gold">
              {products.filter((p) => p.highlighted).length}
            </span>
          </div>

          <div className="rounded-xl border border-border-soft bg-brand-cream p-4 shadow-card">
            <div className="flex items-center justify-between text-brand-charcoal/60 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Categories</span>
              <Layers className="w-4 h-4 text-brand-peacock" />
            </div>
            <span className="font-price text-2xl font-bold text-brand-peacock">
              {existingCategories.length}
            </span>
          </div>

          <div className="rounded-xl border border-border-soft bg-brand-cream p-4 shadow-card">
            <div className="flex items-center justify-between text-brand-charcoal/60 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Discounted</span>
              <TrendingUp className="w-4 h-4 text-brand-pink" />
            </div>
            <span className="font-price text-2xl font-bold text-brand-pink">
              {products.filter((p) => p.discount_price > 0 && p.discount_price < p.price).length}
            </span>
          </div>
        </div>

        {/* Search, Category Filter, and Highlight Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border-soft pb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-charcoal/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, tag, category, occasion..."
              className="w-full rounded-xl border border-border-soft bg-brand-cream pl-10 pr-4 py-2.5 text-sm text-brand-charcoal placeholder:text-brand-charcoal/40 focus:border-brand-peacock focus:outline-none shadow-card"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-charcoal/50" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                aria-label="Filter products by category"
                className="rounded-xl border border-border-soft bg-brand-cream px-3 py-2 text-xs font-medium text-brand-charcoal focus:border-brand-peacock focus:outline-none shadow-card"
              >
                <option value="all">All Categories ({products.length})</option>
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({products.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Highlighted Only Toggle Pill */}
            <button
              onClick={() => setHighlightedOnlyFilter((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors shadow-card cursor-pointer ${
                highlightedOnlyFilter
                  ? "bg-brand-gold text-brand-ivory border-brand-gold"
                  : "bg-brand-cream border-border-soft text-brand-charcoal hover:border-brand-gold"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hero Featured Only</span>
            </button>

            {/* Quick Add Button in Filter Bar */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-peacock px-3.5 py-2 text-xs font-semibold text-brand-ivory hover:bg-brand-peacock/90 transition-all shadow-card cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Product Grid / Directory */}
        {loadingProducts ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-peacock animate-spin" />
            <p className="font-serif text-sm text-brand-peacock">Loading product directory...</p>
          </div>
        ) : fetchError ? (
          <div className="rounded-xl border border-border-pink bg-pink-tint p-6 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-brand-pink mx-auto" />
            <p className="text-sm font-semibold text-brand-pink">{fetchError}</p>
            <button
              onClick={loadProducts}
              className="text-xs underline text-brand-peacock cursor-pointer"
            >
              Try reloading
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-border-soft bg-brand-cream/40 p-8">
            <Package className="w-8 h-8 text-brand-charcoal/30 mx-auto" />
            <p className="font-serif text-lg text-brand-charcoal/80 font-medium">
              No matching products found
            </p>
            <p className="text-xs text-brand-charcoal/50 max-w-sm mx-auto">
              Try adjusting your search query or category filter, or add a new handcrafted product to your catalog.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-peacock px-4 py-2 text-xs font-semibold text-brand-ivory shadow-card hover:bg-brand-peacock/90 transition-all cursor-pointer mt-2"
            >
              <PackagePlus className="w-4 h-4 text-brand-gold" />
              <span>Create New Product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const hasDiscount =
                product.discount_price > 0 && product.discount_price < product.price;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col rounded-2xl border border-border-soft bg-brand-cream p-4 shadow-card hover:shadow-card-hover transition-all"
                >
                  {/* Top Image + Badges */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-brand-ivory border border-border-soft/60">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 300px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-charcoal/30 text-xs">
                        No image
                      </div>
                    )}

                    {/* Tag badge */}
                    {product.tag && (
                      <div className="absolute top-2.5 left-2.5 rounded-full bg-brand-pink/90 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-bold text-brand-ivory tracking-wider uppercase">
                        {product.tag}
                      </div>
                    )}

                    {/* Highlighted Status Badge */}
                    {product.highlighted && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-brand-gold px-2 py-0.5 text-[9px] font-bold text-brand-ivory tracking-wider uppercase shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Hero</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="pt-3 pb-2 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-brand-gold font-semibold uppercase tracking-wider">
                        <span>{product.category || "Uncategorized"}</span>
                        <span className="font-price text-brand-charcoal/50 text-[10px]">
                          Stock: {product.inventory_size}
                        </span>
                      </div>

                      <h3 className="font-serif text-sm font-bold text-brand-peacock line-clamp-1 mt-0.5">
                        {product.name}
                      </h3>

                      {product.one_liner ? (
                        <p className="font-sans text-xs text-brand-charcoal/70 line-clamp-1 mt-0.5">
                          {product.one_liner}
                        </p>
                      ) : null}
                    </div>

                    {/* Price display */}
                    <div className="flex items-baseline gap-2 pt-1 border-t border-border-soft/60">
                      <span className="font-price text-base font-bold text-brand-peacock">
                        ₹{hasDiscount ? product.discount_price : product.price}
                      </span>
                      {hasDiscount && (
                        <span className="font-price text-xs text-brand-charcoal/45 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Quick Actions */}
                  <div className="pt-3 border-t border-border-soft flex items-center justify-between gap-2">
                    {/* Highlight Toggle */}
                    <button
                      onClick={() => handleToggleHighlighted(product)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                        product.highlighted
                          ? "bg-gold-tint border border-border-gold text-brand-gold"
                          : "bg-brand-ivory border border-border-soft text-brand-charcoal/60 hover:text-brand-peacock"
                      }`}
                      title="Toggle Hero Carousel Highlight"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{product.highlighted ? "Featured" : "Feature"}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-border-soft bg-brand-ivory text-brand-charcoal/70 hover:text-brand-peacock hover:border-brand-peacock transition-colors"
                        title="Preview product on storefront"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => openEditModal(product)}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-peacock px-3 py-1.5 text-xs font-semibold text-brand-ivory hover:bg-brand-peacock/90 transition-all cursor-pointer"
                        title="Edit product details & gallery"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="p-1.5 rounded-lg border border-border-soft bg-brand-ivory text-brand-charcoal/60 hover:text-brand-pink hover:bg-pink-tint transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 3. Comprehensive Product Edit Modal / Slide-Over Drawer */}
      {editingProduct && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-brand-charcoal/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border-gold bg-brand-cream shadow-dropdown overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-soft bg-brand-cream px-6 py-4">
              <div>
                <span className="font-script font-semibold text-xs tracking-wider uppercase text-brand-pink block">
                  Edit Product Details
                </span>
                <h2 className="font-serif text-xl font-bold text-brand-peacock line-clamp-1">
                  {editingProduct.name}
                </h2>
              </div>
              <button
                onClick={closeEditModal}
                className="rounded-full p-1.5 text-brand-charcoal/60 hover:bg-peacock-tint hover:text-brand-peacock transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              {saveSuccessMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-peacock-tint border border-border-soft p-3 text-xs font-medium text-brand-peacock">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {saveErrorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-pink-tint border border-border-pink p-3 text-xs font-medium text-brand-pink">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{saveErrorMessage}</span>
                </div>
              )}

              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-lg border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                />
              </div>

              {/* Price & Discount Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm font-price text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.discount_price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        discount_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm font-price text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                  />
                  {editForm.discount_price > 0 && editForm.discount_price < editForm.price && (
                    <span className="text-[10px] text-brand-pink font-semibold">
                      {Math.round(((editForm.price - editForm.discount_price) / editForm.price) * 100)}%
                      OFF active
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                    Inventory Size
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.inventory_size}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        inventory_size: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm font-price text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Select + Add Custom Category Option */}
              <div className="space-y-2">
                <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                  Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={editForm.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditForm({
                        ...editForm,
                        category: val,
                        isCustomCategory: val === "custom",
                      });
                    }}
                    className="w-full rounded-lg border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                  >
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="custom">+ Add Custom Category...</option>
                  </select>

                  {editForm.category === "custom" && (
                    <input
                      type="text"
                      required
                      placeholder="Type custom category name..."
                      value={editForm.customCategory}
                      onChange={(e) =>
                        setEditForm({ ...editForm, customCategory: e.target.value })
                      }
                      className="w-full rounded-lg border border-border-gold bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Tag Select + Add Custom Tag Option */}
              <div className="space-y-2">
                <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                  Product Tag / Badge
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={editForm.tag}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditForm({
                        ...editForm,
                        tag: val,
                        isCustomTag: val === "custom",
                      });
                    }}
                    className="w-full rounded-lg border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                  >
                    <option value="">(None)</option>
                    {existingTags.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="custom">+ Add Custom Tag...</option>
                  </select>

                  {editForm.tag === "custom" && (
                    <input
                      type="text"
                      placeholder="Type custom tag (e.g. LIMITED)..."
                      value={editForm.customTag}
                      onChange={(e) =>
                        setEditForm({ ...editForm, customTag: e.target.value.toUpperCase() })
                      }
                      className="w-full rounded-lg border border-border-gold bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Occasions Multi-Select & Custom Tag Adder */}
              <div className="space-y-2.5">
                <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                  Occasions &amp; Festive Uses
                </label>

                {/* Predefined Quick Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_OCCASIONS.map((occ) => {
                    const isSelected = editForm.occasions.includes(occ);
                    return (
                      <button
                        type="button"
                        key={occ}
                        onClick={() => handleTogglePredefinedOccasion(occ)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-brand-peacock text-brand-ivory shadow-xs"
                            : "bg-brand-ivory border border-border-soft text-brand-charcoal hover:border-brand-peacock"
                        }`}
                      >
                        {isSelected ? `✓ ${occ}` : `+ ${occ}`}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Occasions List */}
                {editForm.occasions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {editForm.occasions.map((occ) => (
                      <span
                        key={occ}
                        className="inline-flex items-center gap-1.5 rounded-full bg-peacock-tint border border-border-soft px-3 py-1 text-xs font-medium text-brand-peacock"
                      >
                        <span>{occ}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOccasion(occ)}
                          className="hover:text-brand-pink"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Custom Occasion input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add other custom occasion..."
                    value={editForm.customOccasionInput}
                    onChange={(e) =>
                      setEditForm({ ...editForm, customOccasionInput: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOccasion();
                      }
                    }}
                    className="flex-1 rounded-lg border border-border-soft bg-brand-ivory px-3 py-2 text-xs text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddOccasion}
                    className="rounded-lg border border-border-soft bg-brand-ivory px-3 py-2 text-xs font-semibold text-brand-peacock hover:bg-peacock-tint transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* One Liner / Hero Subtitle */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                  Short Tagline / Hero One Liner
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted Shubh Labh hanging with pearl beads and brass finish"
                  value={editForm.one_liner}
                  onChange={(e) => setEditForm({ ...editForm, one_liner: e.target.value })}
                  className="w-full rounded-lg border border-border-soft bg-brand-ivory px-3.5 py-2.5 text-sm text-brand-charcoal focus:border-brand-peacock focus:outline-none"
                />
              </div>

              {/* Large Textarea Description */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                  Full Product Description *
                </label>
                <textarea
                  rows={5}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Detailed product materials, craftsmanship story, dimensions, and styling instructions..."
                  className="w-full rounded-lg border border-border-soft bg-brand-ivory p-3.5 text-sm text-brand-charcoal leading-relaxed focus:border-brand-peacock focus:outline-none resize-y"
                />
              </div>

              {/* Highlighted Hero Banner Toggle (Boolean Switch) */}
              <div className="flex items-center justify-between rounded-xl border border-border-gold bg-gold-tint/40 p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                    <span className="font-serif text-sm font-bold text-brand-peacock">
                      Feature on Homepage Hero Banner
                    </span>
                  </div>
                  <p className="font-sans text-xs text-brand-charcoal/70">
                    When active, this product will rotate in the top cinematic carousel.
                  </p>
                </div>

                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={editForm.highlighted}
                  onClick={() =>
                    setEditForm({ ...editForm, highlighted: !editForm.highlighted })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    editForm.highlighted ? "bg-brand-peacock" : "bg-brand-charcoal/20"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-brand-ivory shadow-card ring-0 transition duration-200 ease-in-out ${
                      editForm.highlighted ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Image Gallery Management & Reordering */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="font-sans text-xs font-semibold text-brand-charcoal block">
                      Product Images &amp; Gallery ({editForm.imagesList.length})
                    </label>
                    <p className="text-[11px] text-brand-charcoal/60">
                      Reorder images using arrows. First image (#1) is the primary cover photo.
                    </p>
                  </div>

                  {/* File Upload Trigger Button */}
                  <label
                    htmlFor="admin-file-input"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-gold bg-gold-tint/60 px-3 py-1.5 text-xs font-semibold text-brand-peacock hover:bg-gold-tint transition-all cursor-pointer w-fit shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-brand-gold" />
                    <span>+ Upload Images</span>
                    <input
                      id="admin-file-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Images Reordering Grid */}
                {editForm.imagesList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border-soft bg-brand-ivory/60 p-6 text-center">
                    <p className="text-xs text-brand-charcoal/60">
                      No images attached. Click &ldquo;+ Upload Images&rdquo; above to add product photos.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {editForm.imagesList.map((img, idx) => {
                      const isCover = idx === 0;

                      return (
                        <div
                          key={img.id}
                          className={`relative flex flex-col rounded-xl overflow-hidden border transition-all ${
                            isCover
                              ? "border-border-gold bg-gold-tint/30 shadow-card"
                              : "border-border-soft bg-brand-ivory"
                          }`}
                        >
                          {/* Image preview */}
                          <div className="relative w-full aspect-square bg-brand-ivory overflow-hidden">
                            <Image
                              src={img.url}
                              alt={`Product image ${idx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />

                            {/* Position / Cover Badge */}
                            <div className="absolute top-1.5 left-1.5">
                              {isCover ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold px-2 py-0.5 text-[9px] font-bold text-brand-ivory tracking-wider uppercase shadow-xs">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>Cover</span>
                                </span>
                              ) : (
                                <span className="rounded-full bg-brand-charcoal/70 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-brand-ivory">
                                  #{idx + 1}
                                </span>
                              )}
                            </div>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 rounded-full bg-brand-ivory/90 backdrop-blur-xs p-1 text-brand-charcoal hover:bg-pink-tint hover:text-brand-pink transition-colors shadow-xs"
                              title="Delete this image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Controls Row (Move left / right / set cover) */}
                          <div className="p-2 flex items-center justify-between gap-1 border-t border-border-soft bg-brand-cream/60">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, idx - 1)}
                              className="p-1 rounded bg-brand-ivory border border-border-soft text-brand-charcoal/70 hover:text-brand-peacock disabled:opacity-20 cursor-pointer"
                              title="Move Earlier"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            {!isCover ? (
                              <button
                                type="button"
                                onClick={() => handleSetAsCover(idx)}
                                className="text-[10px] font-semibold text-brand-peacock hover:text-brand-gold transition-colors truncate px-1 cursor-pointer"
                                title="Make this image the main cover"
                              >
                                Set Cover
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">
                                Main
                              </span>
                            )}

                            <button
                              type="button"
                              disabled={idx === editForm.imagesList.length - 1}
                              onClick={() => handleMoveImage(idx, idx + 1)}
                              className="p-1 rounded bg-brand-ivory border border-border-soft text-brand-charcoal/70 hover:text-brand-peacock disabled:opacity-20 cursor-pointer"
                              title="Move Later"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => {
                    if (editingProduct) {
                      handleDeleteProduct(editingProduct);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-pink bg-pink-tint px-3 py-2 text-xs font-semibold text-brand-pink hover:bg-brand-pink hover:text-brand-ivory transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Product</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-lg border border-border-soft bg-brand-ivory px-4 py-2.5 text-xs font-medium text-brand-charcoal hover:border-brand-peacock transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-peacock px-6 py-2.5 text-xs font-semibold text-brand-ivory shadow-card hover:bg-brand-peacock/90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Product</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add New Product Modal */}
      <AddProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={handleProductCreated}
        existingCategories={existingCategories}
        existingTags={existingTags}
      />
    </div>
  );
}

