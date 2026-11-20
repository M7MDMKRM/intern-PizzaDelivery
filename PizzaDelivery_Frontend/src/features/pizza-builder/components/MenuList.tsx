"use client";

import React, { useState, useMemo } from "react";
import { PizzaCard } from "./PizzaCard";
import { usePizzas } from "../hooks/usePizzas";
import { Pizza, Sparkles, Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";

export function MenuList() {
  const { data: pizzas, isLoading, error } = usePizzas();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    if (!pizzas) return ["All"];
    const cats = new Set<string>();
    pizzas.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ["All", ...Array.from(cats)];
  }, [pizzas]);

  const filteredPizzas = useMemo(() => {
    if (!pizzas) return [];
    return pizzas.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [pizzas, selectedCategory, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="section-title text-red-800 font-bold text-xs uppercase tracking-widest">
          {t("menu_badge")}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 font-serif">
          {t("menu_title")}
        </h1>
        <p className="text-stone-600 text-sm">
          {t("menu_desc")}
        </p>

        <div className="pt-2">
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-900 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-950/15 transition transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t("menu_builder_btn")}</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer uppercase tracking-wider ${
                selectedCategory === cat
                  ? "bg-red-800 text-white shadow-sm"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {cat === "All" ? t("menu_all") : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("menu_search_ph")}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pl-10 rtl:pl-4 rtl:pr-10 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3" />
        </div>
      </div>

      {/* Pizzas Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 text-red-800 animate-spin mx-auto mb-4" />
          <p className="text-stone-500 text-sm">{t("featured_loading")}</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-red-200 p-8 shadow-sm">
          <p className="text-red-700 font-bold mb-2">Unable to load pizzas from backend</p>
          <p className="text-stone-500 text-xs">Please verify backend service is running on port 5051</p>
        </div>
      ) : filteredPizzas.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
          <Pizza className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <p className="text-stone-700 font-bold">{t("menu_not_found")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPizzas.map((pizza) => (
            <PizzaCard key={pizza.id} pizza={pizza} />
          ))}
        </div>
      )}
    </div>
  );
}
