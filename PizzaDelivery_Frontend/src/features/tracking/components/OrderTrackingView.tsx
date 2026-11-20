"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrder } from "../hooks/useOrders";
import { useOrderTrackingHub } from "../hooks/useOrderTrackingHub";
import { formatPrice } from "@/lib/utils";
import { OrderStatus } from "../types";
import { useLanguage } from "@/lib/LanguageContext";
import {
  CheckCircle2,
  Clock,
  Flame,
  ChefHat,
  Truck,
  Home,
  MapPin,
  Phone,
  Radio,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export function OrderTrackingView() {
  const params = useParams();
  const orderId = params?.id as string;
  const { t, isRtl } = useLanguage();

  const { data: initialOrder, isLoading, error } = useOrder(orderId);
  const { isConnected, liveStatus } = useOrderTrackingHub(orderId);

  const trackingSteps = [
    {
      status: OrderStatus.OrderReceived,
      percentage: 25,
      title: t("track_step_1"),
      desc: t("track_step_1_desc"),
      icon: CheckCircle2,
    },
    {
      status: OrderStatus.Preparing,
      percentage: 50,
      title: t("track_step_2"),
      desc: t("track_step_2_desc"),
      icon: ChefHat,
    },
    {
      status: OrderStatus.InTheOven,
      percentage: 75,
      title: t("track_step_3"),
      desc: t("track_step_3_desc"),
      icon: Flame,
    },
    {
      status: OrderStatus.OutForDelivery,
      percentage: 90,
      title: t("track_step_4"),
      desc: t("track_step_4_desc"),
      icon: Truck,
    },
    {
      status: OrderStatus.Delivered,
      percentage: 100,
      title: t("track_step_5"),
      desc: t("track_step_5_desc"),
      icon: Home,
    },
  ];

  const currentStatus = liveStatus?.status ?? initialOrder?.status ?? OrderStatus.OrderReceived;
  const currentProgress = liveStatus?.progressPercentage ?? (
    currentStatus === OrderStatus.OrderReceived ? 25 :
    currentStatus === OrderStatus.Preparing ? 50 :
    currentStatus === OrderStatus.InTheOven ? 75 :
    currentStatus === OrderStatus.OutForDelivery ? 90 :
    currentStatus === OrderStatus.Delivered ? 100 : 25
  );

  const currentStatusText =
    (currentStatus === OrderStatus.OrderReceived ? t("track_step_1") :
     currentStatus === OrderStatus.Preparing ? t("track_step_2") :
     currentStatus === OrderStatus.InTheOven ? t("track_step_3") :
     currentStatus === OrderStatus.OutForDelivery ? t("track_step_4") :
     currentStatus === OrderStatus.Delivered ? t("track_step_5") : t("track_cancelled"));

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">{t("track_loading")}</p>
      </div>
    );
  }

  if (error || !initialOrder) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-white border border-red-200 rounded-3xl p-8 space-y-4 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 font-serif">
          {t("track_not_found")}{orderId}
        </h2>
        <p className="text-stone-500 text-xs">{t("track_not_found_desc")}</p>
        <Link
          href="/menu"
          className="inline-block px-6 py-2.5 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          {t("track_back_menu")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      {/* Top Banner with SignalR Status Indicator */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="space-y-2 text-center sm:text-start">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
              {t("track_title")}{initialOrder.id}
            </h1>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <Radio className={`w-3 h-3 ${isConnected ? "animate-pulse" : ""}`} />
              <span>{isConnected ? t("track_live_badge") : t("track_polling_badge")}</span>
            </div>
          </div>
          <p className="text-stone-500 text-xs">
            {t("track_created_at")} {new Date(initialOrder.createdAt || Date.now()).toLocaleTimeString(isRtl ? "ar-EG" : "en-US")}
          </p>
        </div>

        {/* Live Estimated Stage */}
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl text-center min-w-[200px]">
          <span className="text-[10px] text-stone-500 font-medium block">{t("track_status_label")}</span>
          <span className="text-lg font-black text-red-800 block mt-0.5">
            {currentStatusText}
          </span>
          <span className="text-[11px] text-stone-600">
            {t("track_progress_label")} {currentProgress}%
          </span>
        </div>
      </div>

      {/* Progress Bar & Visual Stepper */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-8 shadow-sm space-y-8">
        
        {/* Progress Bar Line */}
        <div className="relative w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
          <div
            className="h-full bg-gradient-to-r from-red-800 via-amber-600 to-emerald-600 transition-all duration-1000 ease-out"
            style={{ width: `${currentProgress}%` }}
          />
        </div>

        {/* Stepper Icons and Labels */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {trackingSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentProgress >= step.percentage;
            const isCurrent =
              currentProgress >= step.percentage &&
              (idx === trackingSteps.length - 1 || currentProgress < trackingSteps[idx + 1].percentage);

            return (
              <div
                key={step.status}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? "bg-red-50/80 border-red-700 shadow-sm"
                    : isCompleted
                    ? "bg-stone-50 border-stone-200"
                    : "bg-white border-dashed border-stone-200 opacity-60"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition ${
                    isCurrent
                      ? "bg-red-800 text-white shadow-md animate-pulse"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-stone-900 mb-1">{step.title}</h4>
                <p className="text-[10px] text-stone-500 leading-tight hidden sm:block">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Order Items */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2 font-serif">
            <ShoppingBag className="w-5 h-5 text-red-800" />
            <span>{t("track_contents_title")}</span>
          </h3>

          <div className="space-y-3">
            {initialOrder.items && initialOrder.items.length > 0 ? (
              initialOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-900 block">
                      {item.isCustom ? (isRtl ? "بيتزا مخصصة" : "Custom Pizza") : item.pizzaName || (isRtl ? "بيتزا إيطالية" : "Artisan Pizza")}
                    </span>
                    {item.customDetails && (
                      <span className="text-[10px] text-stone-500 block mt-0.5 max-w-xs">
                        {item.customDetails}
                      </span>
                    )}
                    <span className="text-[10px] text-red-800 font-semibold mt-1 block">
                      {isRtl ? "الكمية:" : "Quantity:"} x{item.quantity}
                    </span>
                  </div>
                  <span className="font-black text-stone-900 text-sm font-sans">
                    {formatPrice(item.totalPrice || item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500">{isRtl ? "جاري تجهيز بيانات الأصناف في المطبخ" : "Preparing item data in kitchen"}</p>
            )}
          </div>
        </div>

        {/* Delivery Details & Summary */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2 font-serif">
            <MapPin className="w-5 h-5 text-red-800" />
            <span>{t("track_delivery_title")}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500">{t("cart_order_type_label")}:</span>
              <span className="font-bold text-stone-900">
                {initialOrder.orderType === 1 ? t("cart_delivery_home") : t("cart_carryout_store")}
              </span>
            </div>

            {initialOrder.deliveryAddress && (
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">{t("cart_address_label")}:</span>
                <span className="font-bold text-stone-900 max-w-xs text-start">
                  {initialOrder.deliveryAddress}
                </span>
              </div>
            )}

            {initialOrder.phoneNumber && (
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">{t("cart_phone_label")}:</span>
                <span className="font-bold text-stone-900 font-mono" dir="ltr">
                  {initialOrder.phoneNumber}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-3 text-base font-black">
              <span className="text-stone-900">{t("track_amount_paid")}</span>
              <span className="text-red-800 font-sans">{formatPrice(initialOrder.totalAmount)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
