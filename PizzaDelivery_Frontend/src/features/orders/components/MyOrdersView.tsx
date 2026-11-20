"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  MapPin,
  Store,
  ChevronRight,
  Package,
  RotateCcw,
  Search,
  ExternalLink,
  Loader2,
  Calendar,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useMyOrders } from "../hooks/useOrders";
import { OrderStatus } from "@/features/tracking/types";
import { OrderResponseDto } from "../types";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { useAddToCart } from "@/features/cart/hooks/useCart";
import { toast } from "sonner";

export function MyOrdersView() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { t, isRtl } = useLanguage();
  const [page, setPage] = useState(1);
  const [trackCodeInput, setTrackCodeInput] = useState("");

  const { data, isLoading, isError, refetch } = useMyOrders(page, 10);
  const addToCartMutation = useAddToCart();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = trackCodeInput.trim();
    if (!cleanCode) {
      toast.error(isRtl ? "يرجى كتابة كود التتبع" : "Please enter a tracking code");
      return;
    }
    router.push(`/tracking/${cleanCode}`);
  };

  const handleReorder = async (order: OrderResponseDto) => {
    try {
      for (const item of order.items) {
        if (!item.isCustom && item.pizzaId) {
          await addToCartMutation.mutateAsync({
            pizzaId: item.pizzaId,
            quantity: item.quantity,
            isCustom: false,
          });
        }
      }
      toast.success(
        isRtl
          ? "تمت إضافة عناصر الطلب إلى سلتك بنجاح!"
          : "Order items re-added to your cart!"
      );
      router.push("/cart");
    } catch {
      toast.error(isRtl ? "تعذر إعادة إضافة بعض العناصر" : "Failed to re-order some items");
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.OrderReceived:
        return { label: isRtl ? "تم استلام الطلب" : "Order Received", cls: "bg-blue-50 text-blue-800 border-blue-200" };
      case OrderStatus.Preparing:
        return { label: isRtl ? "قيد التجهيز" : "Preparing", cls: "bg-amber-50 text-amber-800 border-amber-200" };
      case OrderStatus.InTheOven:
        return { label: isRtl ? "داخل الفرن الحجري" : "In Stone Oven", cls: "bg-orange-50 text-orange-800 border-orange-200" };
      case OrderStatus.OutForDelivery:
        return { label: isRtl ? "خرج للتوصيل" : "Out For Delivery", cls: "bg-purple-50 text-purple-800 border-purple-200" };
      case OrderStatus.Delivered:
        return { label: isRtl ? "تم التوصيل بنجاح" : "Delivered", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case OrderStatus.Cancelled:
        return { label: isRtl ? "ملغي" : "Cancelled", cls: "bg-red-50 text-red-800 border-red-200" };
      default:
        return { label: isRtl ? "قيد المعالجة" : "Processing", cls: "bg-stone-50 text-stone-700 border-stone-200" };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center bg-white border border-stone-200 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-red-50 text-red-800 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-stone-900 font-serif">
            {isRtl ? "تسجيل الدخول مطلوب" : "Authentication Required"}
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            {isRtl
              ? "يرجى تسجيل الدخول إلى حسابك لعرض سجل طلباتك السابقة وتتبعها مباشرة."
              : "Please log in to your account to view your past orders and live track them."}
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block px-8 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-red-900/15"
        >
          {isRtl ? "تسجيل الدخول الآن" : "Log In Now"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header & Quick Tracking Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-200 pb-6">
        <div>
          <div className="text-red-800 font-bold text-xs uppercase tracking-wider">
            {isRtl ? "سجل طلباتك" : "MY PIZZA JOURNEY"}
          </div>
          <h1 className="text-3xl font-black text-stone-900 mt-1 font-serif">
            {isRtl ? "طلباتي السابقة والتتبع" : "My Orders & Tracking"}
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            {isRtl
              ? "عرض تفاصيل جميع طلباتك ومتابعة حالتها فورياً أو إعادة طلب وجباتك المفضلة"
              : "Review your previous pizza orders, live track active ones, or quickly re-order"}
          </p>
        </div>

        {/* Quick Tracking by Code / ID Box */}
        <form onSubmit={handleTrackSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={trackCodeInput}
              onChange={(e) => setTrackCodeInput(e.target.value)}
              placeholder={isRtl ? "تتبع بكود الطلب أو الرقم..." : "Track by Order Code or ID..."}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-red-700 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-stone-900 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition shrink-0 cursor-pointer"
          >
            {isRtl ? "تتبع" : "Track"}
          </button>
        </form>
      </div>

      {/* Orders Content */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-800" />
          <p className="text-xs font-medium">{isRtl ? "جاري تحميل سجل الطلبات..." : "Loading your orders..."}</p>
        </div>
      ) : isError ? (
        <div className="py-16 text-center bg-red-50/50 border border-red-200 rounded-3xl p-8 space-y-4">
          <p className="text-sm text-red-800 font-bold">
            {isRtl ? "تعذر تحميل الطلبات في الوقت الحالي" : "Failed to load orders at this moment"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2 bg-red-800 text-white text-xs font-bold rounded-xl hover:bg-red-900 transition"
          >
            {isRtl ? "إعادة المحاولة" : "Try Again"}
          </button>
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="max-w-2xl mx-auto py-20 text-center bg-white border border-stone-200/90 rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-stone-100 text-stone-400 rounded-3xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-stone-900 font-serif">
              {isRtl ? "لم تقم بطلب بيتزا حتى الآن" : "No Orders Placed Yet"}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              {isRtl
                ? "ابدأ بتجربة تشكيلتنا الإيطالية الأصيلة أو ابتكر بيتزا خاصة بك بالمكونات التي تحبها!"
                : "Explore our authentic Italian menu or craft your unique pizza with custom ingredients!"}
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/menu"
              className="px-6 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-red-900/15"
            >
              {isRtl ? "تصفح المنيو" : "Browse Menu"}
            </Link>
            <Link
              href="/builder"
              className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 font-bold text-xs uppercase tracking-wider rounded-xl transition"
            >
              {isRtl ? "اصنع بيتزا مخصصة" : "Build Custom Pizza"}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {data.items.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            const dateStr = new Date(order.orderDate).toLocaleString(isRtl ? "ar-EG" : "en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="bg-white border border-stone-200/90 rounded-3xl p-6 transition hover:shadow-md hover:border-red-700/30 space-y-5 shadow-xs"
              >
                {/* Top bar: Order ID, Date, Status */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 text-red-800 rounded-2xl flex items-center justify-center font-bold text-xs font-mono">
                      #{order.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm font-sans">
                          {isRtl ? "طلب رقم" : "Order"} #{order.id}
                        </span>
                        {order.trackingCode && (
                          <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                            {order.trackingCode.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-stone-400 text-xs mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.cls}`}
                    >
                      {statusInfo.label}
                    </span>
                    <Link
                      href={`/tracking/${order.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <span>{isRtl ? "تتبع مباشر" : "Live Track"}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} />
                    </Link>
                  </div>
                </div>

                {/* Middle: Items summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between bg-stone-50/70 border border-stone-200/80 rounded-2xl p-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2 rtl:pr-0 rtl:pl-2">
                        <div className="font-bold text-stone-800 truncate">
                          {item.quantity}x {item.pizzaName || (item.isCustom ? (isRtl ? "بيتزا مخصصة" : "Custom Pizza") : "Italian Pizza")}
                        </div>
                        {item.customDetails && (
                          <div className="text-[10px] text-stone-500 truncate" title={item.customDetails}>
                            {item.customDetails}
                          </div>
                        )}
                      </div>
                      <div className="font-black text-stone-900 shrink-0 font-sans">
                        {formatPrice(item.totalPrice || item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Details: Total & Location */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-4 text-stone-600">
                    {order.orderType === 1 ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-800" />
                        <span className="font-medium truncate max-w-xs">{order.deliveryAddress || (isRtl ? "توصيل للمنزل" : "Home Delivery")}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-amber-700" />
                        <span className="font-medium">{order.branchName || (isRtl ? "استلام من الفرع" : "Store Pickup")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right rtl:text-left">
                      <span className="text-stone-400 text-xs mr-2 rtl:mr-0 rtl:ml-2">{isRtl ? "الإجمالي:" : "Total:"}</span>
                      <span className="text-lg font-black text-red-800 font-sans">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      disabled={addToCartMutation.isPending}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isRtl ? "إعادة الطلب" : "Re-order"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.hasPreviousPage}
                className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition"
              >
                {isRtl ? "السابق" : "Previous"}
              </button>
              <span className="text-xs text-stone-500 font-medium px-3">
                {isRtl ? `صفحة ${data.page} من ${data.totalPages}` : `Page ${data.page} of ${data.totalPages}`}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={!data.hasNextPage}
                className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40 transition"
              >
                {isRtl ? "التالي" : "Next"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
