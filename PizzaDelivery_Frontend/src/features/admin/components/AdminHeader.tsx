"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ChefHat,
  Boxes,
  Pizza as PizzaIcon,
  Store,
  Radio,
} from "lucide-react";
import { useKitchenHub } from "@/features/tracking/hooks/useKitchenHub";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const pathname = usePathname();
  const { isConnected } = useKitchenHub();
  const { t } = useLanguage();

  const navItems = [
    { href: "/admin", label: t("admin_tab_stats"), icon: LayoutDashboard },
    { href: "/admin/kitchen", label: t("admin_tab_kitchen"), icon: ChefHat },
    { href: "/admin/inventory", label: t("admin_tab_inventory"), icon: Boxes },
    { href: "/admin/pizzas", label: t("admin_tab_pizzas"), icon: PizzaIcon },
    { href: "/admin/branches", label: t("admin_tab_branches"), icon: Store },
  ];

  return (
    <div className="space-y-6 mb-8 border-b border-stone-200 pb-6">
      {/* Top Title & Hub Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-title text-red-800 font-bold text-xs uppercase tracking-wider">
            {t("admin_title_badge")}
          </div>
          <h1 className="text-3xl font-black text-stone-900 mt-1 font-serif">
            {t("admin_heading")}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isConnected ? "animate-pulse" : ""}`} />
            <span>{isConnected ? t("admin_hub_active") : t("admin_hub_reconnecting")}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap",
                isActive
                  ? "bg-red-800 text-white shadow-sm font-black"
                  : "bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
