"use client";

import React from "react";
import { useAdminStats } from "../hooks/useAdminStats";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Award,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";

export function AdminStatsView() {
  const { data: stats, isLoading } = useAdminStats();
  const { t, isRtl } = useLanguage();

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-10 h-10 text-red-800 animate-spin mx-auto mb-4" />
        <p className="text-stone-400 text-xs">
          {isRtl ? "جاري تحليل بيانات المؤشرات والأرباح..." : "Analyzing performance & metrics data..."}
        </p>
      </div>
    );
  }

  const topPizzas = stats?.topSellingPizzas || [];
  const lowStock = stats?.lowStockAlerts || [];

  return (
    <div className="space-y-8">
      {/* 1. Key Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Today Revenue */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 relative overflow-hidden group hover:border-red-700/40 hover:shadow-md transition shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-stone-500 font-bold">{t("admin_stat_today_rev")}</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 font-sans">
            {formatPrice(stats?.todayRevenue || 0)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t("admin_stat_active_ops")}</span>
          </span>
        </div>

        {/* Month Revenue */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 relative overflow-hidden group hover:border-red-700/40 hover:shadow-md transition shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-stone-500 font-bold">{t("admin_stat_month_rev")}</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-stone-900 font-sans">
            {formatPrice(stats?.monthRevenue || 0)}
          </div>
          <span className="text-[11px] text-stone-400 block mt-2">{t("admin_stat_updated_today")}</span>
        </div>

        {/* Active Orders */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/50 hover:shadow-md transition shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-stone-500 font-bold">{t("admin_stat_active_orders")}</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 font-sans">
            {stats?.activeOrdersCount || 0}
          </div>
          <Link
            href="/admin/kitchen"
            className="text-[11px] text-amber-700 hover:text-amber-800 hover:underline block mt-2 font-bold"
          >
            {t("admin_stat_go_kitchen")}
          </Link>
        </div>

        {/* Low Stock Counter */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 relative overflow-hidden group hover:border-red-600/50 hover:shadow-md transition shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-stone-500 font-bold">{t("admin_stat_low_stock")}</span>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-700 font-sans">
            {lowStock.length}
          </div>
          <Link
            href="/admin/inventory"
            className="text-[11px] text-red-700 hover:text-red-800 hover:underline block mt-2 font-bold"
          >
            {t("admin_stat_review_stock")}
          </Link>
        </div>
      </div>

      {/* 2. Top Selling Pizzas & Low Stock Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top 5 Best Sellers (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>{t("admin_stat_top_pizzas")}</span>
            </h3>
            <span className="text-xs text-stone-400 font-medium">{t("admin_stat_by_orders")}</span>
          </div>

          <div className="space-y-3">
            {topPizzas.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8">
                {t("admin_stat_no_sales")}
              </p>
            ) : (
              topPizzas.map((pizza: any, idx) => {
                const soldQty = pizza.totalSoldQuantity ?? pizza.ordersCount ?? 0;
                const revenue = pizza.totalRevenueGenerated ?? pizza.totalRevenue ?? 0;

                return (
                  <div
                    key={pizza.pizzaId || idx}
                    className="flex items-center justify-between p-4 bg-stone-50/70 rounded-2xl border border-stone-200/70 hover:border-amber-500/40 hover:bg-stone-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-800 font-black text-xs flex items-center justify-center border border-amber-200/60 font-sans">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900">{pizza.pizzaName}</h4>
                        <span className="text-[11px] text-stone-500">
                          {t("admin_stat_total_orders")} <strong className="text-stone-800 font-sans">{soldQty}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-[11px] text-stone-400 block font-medium">{t("admin_stat_revenue")}</span>
                      <span className="text-sm font-black text-emerald-700 font-sans">
                        {formatPrice(revenue)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Critical Low Stock Alert Box (1 col) */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="text-base font-bold text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>{t("admin_stat_crit_stock")}</span>
              </h3>
            </div>

            <div className="space-y-3">
              {lowStock.length === 0 ? (
                <div className="p-6 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl text-center space-y-1">
                  <p className="text-xs text-emerald-800 font-bold">
                    {t("admin_stat_all_stock_ok")}
                  </p>
                  <p className="text-[11px] text-emerald-600">
                    {t("admin_stat_no_shortage")}
                  </p>
                </div>
              ) : (
                lowStock.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-red-50/60 border border-red-200/70 rounded-2xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">{item.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full border border-red-200">
                        {t("admin_stat_remaining")} {item.stockQuantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>{t("admin_stat_category")} {item.category}</span>
                      <span>{t("admin_stat_min_threshold")} {item.threshold}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/inventory"
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition text-center block shadow-sm mt-4"
          >
            {t("admin_stat_supply_btn")}
          </Link>
        </div>

      </div>
    </div>
  );
}
