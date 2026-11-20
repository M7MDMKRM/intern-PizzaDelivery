"use client";

import React, { useState } from "react";
import { useAdminOrders, useUpdateOrderStatus } from "@/features/tracking/hooks/useOrders";
import { useKitchenHub } from "@/features/tracking/hooks/useKitchenHub";
import { OrderStatus, OrderDetails } from "@/features/tracking/types";
import { formatPrice } from "@/lib/utils";
import {
  ChefHat,
  Flame,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Radio,
  Layers,
  Sparkles,
  Loader2,
  Filter,
} from "lucide-react";

import { useLanguage } from "@/lib/LanguageContext";

export function AdminKitchenBoard() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatusMutation = useUpdateOrderStatus();
  const { isConnected } = useKitchenHub();
  const { t, isRtl } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const orderList = Array.isArray(orders) ? orders : [];

  const filteredOrders = orderList.filter((order) => {
    if (filterStatus === "Active") {
      return order.status >= 1 && order.status <= 4;
    }
    if (filterStatus === "Delivered") {
      return order.status === OrderStatus.Delivered;
    }
    if (filterStatus === "Cancelled") {
      return order.status === OrderStatus.Cancelled;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.OrderReceived:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">{t("kitchen_badge_received")}</span>;
      case OrderStatus.Preparing:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">{t("kitchen_badge_prep")}</span>;
      case OrderStatus.InTheOven:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">{t("kitchen_badge_oven")}</span>;
      case OrderStatus.OutForDelivery:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">{t("kitchen_badge_delivery")}</span>;
      case OrderStatus.Delivered:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">{t("kitchen_badge_delivered")}</span>;
      case OrderStatus.Cancelled:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">{t("kitchen_badge_cancelled")}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">Unknown</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ChefHat className="w-6 h-6 text-red-800" />
          <h2 className="text-lg font-black text-stone-900 font-serif">{t("kitchen_heading")}</h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus("Active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === "Active"
                ? "bg-red-800 text-white shadow-xs font-black"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {t("kitchen_filter_active")}
          </button>
          <button
            onClick={() => setFilterStatus("All")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === "All"
                ? "bg-red-800 text-white shadow-xs font-black"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {t("kitchen_filter_all")} ({orderList.length})
          </button>
          <button
            onClick={() => setFilterStatus("Delivered")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === "Delivered"
                ? "bg-red-800 text-white shadow-xs font-black"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {t("kitchen_filter_delivered")}
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-red-800 animate-spin mx-auto mb-4" />
          <p className="text-stone-400 text-xs">{t("kitchen_loading")}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-white border border-stone-200/90 rounded-3xl p-8 shadow-xs">
          <p className="text-stone-500 font-bold">{t("kitchen_empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const isFinished =
              order.status === OrderStatus.Delivered ||
              order.status === OrderStatus.Cancelled;

            return (
              <div
                key={order.id}
                className="bg-white border border-stone-200/90 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:shadow-md hover:border-red-700/30 transition shadow-xs"
              >
                <div>
                  {/* Order Card Header */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                    <div>
                      <span className="text-lg font-black text-stone-900 block font-sans">
                        {t("kitchen_order_prefix")}{order.id}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(order.createdAt || Date.now()).toLocaleTimeString(isRtl ? "ar-EG" : "en-US")}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Customer and Delivery Info */}
                  <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/60 mb-4">
                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-800 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight text-stone-700">{order.deliveryAddress}</span>
                      </div>
                    )}
                    {order.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-red-800 shrink-0" />
                        <span className="text-[11px] font-mono text-stone-700" dir="ltr">{order.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Pizza Items */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-500 block">{t("kitchen_items_label")}</span>
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-stone-50/50 rounded-xl border border-stone-200/50 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">
                            {item.isCustom ? t("kitchen_custom_pizza") : item.pizzaName || t("kitchen_ready_pizza")}
                          </span>
                          <span className="text-red-800 font-black font-sans">x{item.quantity}</span>
                        </div>
                        {item.customDetails && (
                          <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                            {item.customDetails}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-medium">{t("kitchen_total_label")}</span>
                    <span className="text-base font-black text-red-800 font-sans">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>

                  {!isFinished ? (
                    <div className="grid grid-cols-2 gap-2">
                      {order.status === OrderStatus.OrderReceived && (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: OrderStatus.Preparing,
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="col-span-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <ChefHat className="w-4 h-4" />
                          <span>{t("kitchen_btn_prep")}</span>
                        </button>
                      )}

                      {order.status === OrderStatus.Preparing && (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: OrderStatus.InTheOven,
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="col-span-2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Flame className="w-4 h-4" />
                          <span>{t("kitchen_btn_oven")}</span>
                        </button>
                      )}

                      {order.status === OrderStatus.InTheOven && (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: OrderStatus.OutForDelivery,
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="col-span-2 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>{t("kitchen_btn_dispatch")}</span>
                        </button>
                      )}

                      {order.status === OrderStatus.OutForDelivery && (
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: OrderStatus.Delivered,
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="col-span-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{t("kitchen_btn_delivered")}</span>
                        </button>
                      )}

                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            orderId: order.id,
                            status: OrderStatus.Cancelled,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="col-span-2 py-2 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-700" />
                        <span>{t("kitchen_btn_cancel")}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2.5 text-xs font-bold text-stone-400 bg-stone-50 rounded-xl border border-stone-200/60">
                      {t("kitchen_status_closed")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
