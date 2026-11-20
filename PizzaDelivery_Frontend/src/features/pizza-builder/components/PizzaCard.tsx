"use client";

import React from "react";
import Image from "next/image";
import { Plus, Tag } from "lucide-react";
import { Pizza } from "../types";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { getSafeImageUrl } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

interface PizzaCardProps {
  pizza: Pizza;
}

export function PizzaCard({ pizza }: PizzaCardProps) {
  const addToCartMutation = useAddToCart();
  const { t, formatPrice } = useLanguage();

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      pizzaId: pizza.id,
      quantity: 1,
      isCustom: false,
    });
  };

  const hasDiscount = !!pizza.discountPrice && pizza.discountPrice < pizza.price;
  const currentPrice = hasDiscount ? (pizza.discountPrice as number) : pizza.price;

  const imageSrc = getSafeImageUrl(pizza.imageUrl, pizza.id);

  return (
    <div className="group bg-white border border-stone-200/90 hover:border-red-800/40 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-950/5 hover:-translate-y-1 flex flex-col justify-between shadow-xs">
      <div>
        {/* Image Container with Badge */}
        <div className="relative h-52 w-full overflow-hidden bg-stone-100">
          <Image
            src={imageSrc}
            alt={pizza.name}
            fill
            unoptimized
            className="object-cover group-hover:scale-108 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-red-800 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider">
              <Tag className="w-3 h-3" />
              <span>{t("card_discount")}</span>
            </div>
          )}

          {/* Category Badge */}
          {pizza.category && (
            <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-white/90 backdrop-blur-md border border-stone-200 text-stone-800 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
              {pizza.category}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-bold text-stone-900 group-hover:text-red-800 transition-colors">
              {pizza.name}
            </h3>
          </div>
          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed mb-4">
            {pizza.description || "Authentic Italian recipe with slow-fermented dough and fresh mozzarella."}
          </p>
        </div>
      </div>

      {/* Footer / Price & Add Button */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
        <div className="flex flex-col">
          {hasDiscount && (
            <span className="text-xs text-stone-400 line-through">
              {formatPrice(pizza.price)}
            </span>
          )}
          <span className="text-xl font-black text-red-800 font-sans">
            {formatPrice(currentPrice)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending}
          className="px-4 py-2.5 bg-red-800 hover:bg-red-900 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-md shadow-red-950/15 disabled:opacity-50 cursor-pointer"
        >
          {addToCartMutation.isPending ? (
            <span>{t("card_adding")}</span>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t("card_add_cart")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
