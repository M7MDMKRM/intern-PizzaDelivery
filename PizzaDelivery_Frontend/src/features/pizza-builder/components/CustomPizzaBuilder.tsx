"use client";

import React from "react";
import Image from "next/image";
import { usePizzaBuilderStore } from "../hooks/usePizzaBuilderStore";
import { useIngredients } from "../hooks/usePizzas";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ShoppingBag,
  Layers,
  Flame,
  Wheat,
  Salad,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export function CustomPizzaBuilder() {
  const router = useRouter();
  const { data: ingredients, isLoading } = useIngredients();
  const addToCartMutation = useAddToCart();
  const { t, isRtl } = useLanguage();

  const STEPS = [
    { id: 1, title: t("builder_step_1"), category: "Base", icon: Wheat },
    { id: 2, title: t("builder_step_2"), category: "Sauce", icon: Flame },
    { id: 3, title: t("builder_step_3"), category: "Cheese", icon: Layers },
    { id: 4, title: t("builder_step_4"), category: "Vegetables", icon: Salad },
  ];

  const {
    step,
    selectedBase,
    selectedSauce,
    selectedCheese,
    selectedVegetables,
    nextStep,
    prevStep,
    selectBase,
    selectSauce,
    selectCheese,
    toggleVegetable,
    resetBuilder,
    getTotalPrice,
    getCustomDetailsString,
    canProceedToNext,
  } = usePizzaBuilderStore();

  const currentCategory = STEPS[step - 1].category;
  
  // Normalize comparison to match backend categories (e.g. "Dough" for Step 1 Base)
  const currentStepIngredients =
    ingredients?.filter((ing) => {
      const cat = ing.category?.toLowerCase() || "";
      const target = currentCategory.toLowerCase();
      if (target === "base") {
        return cat === "base" || cat === "dough" || cat.includes("dough") || cat.includes("عجين");
      }
      if (target === "sauce") {
        return cat === "sauce" || cat.includes("sauce") || cat.includes("صلص");
      }
      if (target === "cheese") {
        return cat === "cheese" || cat.includes("cheese") || cat.includes("جبن");
      }
      if (target === "vegetables") {
        return (
          cat === "vegetables" ||
          cat === "toppings" ||
          cat === "topping" ||
          cat === "meat" ||
          cat.includes("veggie") ||
          cat.includes("خضار") ||
          cat.includes("إضاف") ||
          cat.includes("لحم")
        );
      }
      return cat === target || cat.startsWith(target.slice(0, 4)) || target.startsWith(cat.slice(0, 4));
    }) || [];

  const handleFinishCustomPizza = () => {
    const totalAmount = getTotalPrice();
    const details = getCustomDetailsString();

    const selectedIngredientIds: number[] = [
      ...(selectedBase ? [selectedBase.id] : []),
      ...(selectedSauce ? [selectedSauce.id] : []),
      ...(selectedCheese ? [selectedCheese.id] : []),
      ...selectedVegetables.map((v) => v.id),
    ];

    if (!selectedBase || !selectedSauce || !selectedCheese) {
      toast.error(
        isRtl
          ? "يرجى اختيار العجينة والصلصة والجبنة أولاً لإكمال البيتزا."
          : "Please select dough, sauce, and cheese to complete your custom pizza."
      );
      return;
    }

    addToCartMutation.mutate(
      {
        isCustom: true,
        selectedIngredientIds,
        customDetails: details,
        quantity: 1,
        unitPrice: totalAmount,
      },
      {
        onSuccess: () => {
          resetBuilder();
          router.push("/cart");
        },
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="section-title text-red-800 font-bold text-xs uppercase tracking-widest">
          {t("builder_badge")}
        </div>
        <h1 className="text-4xl font-black text-stone-900 font-serif">
          {t("builder_title")}
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm">
          {t("builder_desc")}
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;

          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all ${
                isActive
                  ? "bg-red-800 text-white shadow-md font-bold"
                  : isCompleted
                  ? "bg-red-50 text-red-900 border border-red-200"
                  : "bg-stone-50 text-stone-500 border border-transparent"
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
                  isActive
                    ? "bg-white text-red-800"
                    : isCompleted
                    ? "bg-red-200 text-red-900"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] sm:text-[10px] opacity-80 uppercase tracking-wider">
                  {t("builder_step")} {s.id}
                </span>
                <span className="text-[11px] sm:text-xs font-bold leading-tight truncate">{s.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Live Recipe & Price Quick Banner */}
      <div className="lg:hidden bg-white border border-stone-200/90 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-stone-200 shrink-0">
            <Image src="/pizza-real.png" alt="Custom Pizza" fill className="object-cover animate-pizza-rotate" />
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">
              {t("builder_summary_title")}
            </span>
            <span className="text-xs font-bold text-stone-900 truncate">
              {[selectedBase?.name, selectedSauce?.name, selectedCheese?.name, selectedVegetables.length ? `${selectedVegetables.length} ${t("builder_items_count")}` : null].filter(Boolean).join(" • ") || t("builder_not_selected")}
            </span>
          </div>
        </div>
        <div className="text-right rtl:text-left shrink-0">
          <span className="text-[10px] text-stone-400 block">{t("builder_total_price")}</span>
          <span className="text-base font-black text-red-800 font-sans">
            {formatPrice(getTotalPrice())}
          </span>
        </div>
      </div>

      {/* Main Builder Area: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left: Ingredients Options (2 cols span) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2 font-serif">
              <span>{STEPS[step - 1].title}</span>
              <span className="text-xs font-normal text-stone-500">
                {step === 4 ? t("builder_pick_multi") : t("builder_pick_single")}
              </span>
            </h2>

            <button
              onClick={resetBuilder}
              className="text-xs text-stone-500 hover:text-red-800 flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t("builder_reset")}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-stone-500 text-sm">
              {t("builder_loading")}
            </div>
          ) : currentStepIngredients.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm shadow-sm">
              {t("builder_empty")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentStepIngredients.map((ingredient) => {
                const isSelected =
                  step === 1
                    ? selectedBase?.id === ingredient.id
                    : step === 2
                    ? selectedSauce?.id === ingredient.id
                    : step === 3
                    ? selectedCheese?.id === ingredient.id
                    : selectedVegetables.some((v) => v.id === ingredient.id);

                const handleSelect = () => {
                  if (step === 1) selectBase(ingredient);
                  else if (step === 2) selectSauce(ingredient);
                  else if (step === 3) selectCheese(ingredient);
                  else if (step === 4) toggleVegetable(ingredient);
                };

                return (
                  <div
                    key={ingredient.id}
                    onClick={handleSelect}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? "bg-red-50/80 border-red-700 shadow-sm scale-[1.01]"
                        : "bg-white border-stone-200 hover:border-red-700/40 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          isSelected
                            ? "bg-red-800 border-red-800 text-white"
                            : "border-stone-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">{ingredient.name}</h4>
                        {ingredient.extraPrice > 0 ? (
                          <span className="text-xs text-red-800 font-semibold font-sans">
                            +{formatPrice(ingredient.extraPrice)}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400">{t("builder_included")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stepper Control Buttons */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-stone-200">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              <span>{t("builder_prev")}</span>
            </button>

            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={!canProceedToNext()}
                className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md shadow-red-900/15 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{t("builder_next")}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <button
                onClick={handleFinishCustomPizza}
                disabled={addToCartMutation.isPending}
                className="flex-1 sm:flex-initial px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t("builder_finish")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Recipe & Price Summary */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 h-fit space-y-6 sticky top-28 shadow-sm">
          <div className="text-center pb-4 border-b border-stone-200">
            <div className="relative w-36 h-36 mx-auto mb-3">
              <Image
                src="/pizza-real.png"
                alt="Custom Pizza"
                fill
                className="object-cover rounded-full animate-pizza-rotate drop-shadow-md border-2 border-stone-100"
              />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">{t("builder_summary_title")}</h3>
            <p className="text-xs text-stone-500">{t("builder_summary_sub")}</p>
          </div>

          {/* Selected items breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-stone-100">
              <span className="text-stone-500">{t("builder_base_label")}</span>
              <span className="font-bold text-stone-900">
                {selectedBase ? selectedBase.name : t("builder_not_selected")}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-stone-100">
              <span className="text-stone-500">{t("builder_sauce_label")}</span>
              <span className="font-bold text-stone-900">
                {selectedSauce ? selectedSauce.name : t("builder_not_selected")}
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-stone-100">
              <span className="text-stone-500">{t("builder_cheese_label")}</span>
              <span className="font-bold text-stone-900">
                {selectedCheese ? selectedCheese.name : t("builder_not_selected")}
              </span>
            </div>

            <div className="py-1.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-stone-500">{t("builder_toppings_label")}</span>
                <span className="text-stone-800 font-semibold">
                  {selectedVegetables.length} {t("builder_items_count")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedVegetables.length > 0 ? (
                  selectedVegetables.map((v) => (
                    <span
                      key={v.id}
                      className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-800 rounded-md text-[10px]"
                    >
                      {v.name}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-400 text-[11px]">{t("builder_toppings_none")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Live Total Price */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">{t("builder_total_price")}</span>
            <span className="text-2xl font-black text-red-800 font-sans">
              {formatPrice(getTotalPrice())}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
