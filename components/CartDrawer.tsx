"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let message =
      "Namaste Lamha Arts & Craft! 🙏\n\nI would like to place an order for the following items:\n\n";
    cart.forEach((item, index) => {
      const price =
        item.discount_price && item.discount_price > 0
          ? item.discount_price
          : item.price;
      message += `${index + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${price * item.quantity}\n`;
    });
    message += `\n*Total Amount:* ₹${totalPrice}\n\nPlease confirm product availability and delivery details.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/917083989848?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-out drawer panel */}
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-brand-cream border-l border-border-soft shadow-dropdown transition-transform duration-300"
        aria-label="Shopping Cart"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft bg-brand-ivory/80">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-brand-peacock" />
            <h2 className="font-serif text-xl font-bold text-brand-peacock tracking-wide">
              Your Cart
            </h2>
            <span className="rounded-full bg-peacock-tint px-2.5 py-0.5 text-xs font-semibold text-brand-peacock">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-full p-2 text-brand-charcoal/70 transition-colors hover:bg-peacock-tint hover:text-brand-peacock focus:outline-none"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-peacock-tint text-brand-peacock mb-4">
                <ShoppingBag className="w-8 h-8 opacity-70" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-brand-charcoal">
                Your cart is empty
              </h3>
              <p className="mt-1 text-sm text-brand-charcoal/70 max-w-xs">
                Explore our festive collections to add handcrafted decor and
                treasures to your cart.
              </p>
              <button
                onClick={closeDrawer}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-peacock px-6 py-2.5 text-sm font-medium text-brand-ivory shadow-card transition-colors hover:bg-brand-peacock/90"
              >
                <span>Continue Browsing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const currentPrice =
                  item.discount_price && item.discount_price > 0
                    ? item.discount_price
                    : item.price;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-xl bg-brand-ivory border border-border-soft shadow-card transition-all"
                  >
                    {/* Item Thumbnail */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-cream border border-border-soft flex items-center justify-center">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-brand-peacock/40" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-serif text-sm font-semibold text-brand-charcoal line-clamp-1">
                            {item.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="font-price font-semibold text-brand-peacock">
                              ₹{currentPrice}
                            </span>
                            {item.discount_price && item.discount_price > 0 && (
                              <span className="font-price text-brand-charcoal/50 line-through">
                                ₹{item.price}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-brand-charcoal/40 transition-colors hover:text-brand-pink"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity buttons & Subtotal */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-border-soft bg-brand-cream/60">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 text-brand-charcoal hover:text-brand-peacock disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-brand-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 text-brand-charcoal hover:text-brand-peacock"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-price text-sm font-bold text-brand-peacock">
                          ₹{currentPrice * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="border-t border-border-soft bg-brand-ivory/90 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-brand-charcoal/80">
                Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
              <span className="font-price text-xl font-bold text-brand-peacock">
                ₹{totalPrice}
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-peacock py-3.5 px-4 font-semibold text-brand-ivory shadow-card transition-all hover:bg-brand-peacock/90 active:scale-[0.99]"
              >
                <span>Order via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex justify-center pt-1">
                <button
                  onClick={clearCart}
                  className="text-xs text-brand-charcoal/60 underline underline-offset-4 transition-colors hover:text-brand-pink"
                >
                  Clear Shopping Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
