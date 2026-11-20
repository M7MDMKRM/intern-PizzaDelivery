"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Truck,
  Store,
  MapPin,
  Phone,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCart, useRemoveFromCart, useUpdateCartItemQuantity, useClearCart, useBranches, useCheckoutMutation } from "../hooks/useCart";
import { paymentService } from "../services/paymentService";
import { loadRazorpayScript } from "@/lib/loadRazorpay";
import { formatPrice } from "@/lib/utils";
import { OrderType } from "../types";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { useLanguage } from "@/lib/LanguageContext";

const RAZORPAY_KEY =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_YourKeyIdHere";

export function CartView() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data: cart, isLoading } = useCart();
  const { data: branches } = useBranches();
  const { t, isRtl } = useLanguage();
  const removeMutation = useRemoveFromCart();
  const updateQtyMutation = useUpdateCartItemQuantity();
  const clearCartMutation = useClearCart();
  const checkoutMutation = useCheckoutMutation();

  // Checkout Form State
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Delivery);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const cartItems = cart?.items || [];
  const totalAmount =
    cart?.totalAmount ??
    cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const handleCheckoutAndPay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error(isRtl ? "يرجى تسجيل الدخول أولاً لإتمام الطلب" : "Please log in first to complete your order");
      router.push("/login");
      return;
    }

    if (!phoneNumber) {
      toast.error(isRtl ? "يرجى إدخال رقم الهاتف للتواصل" : "Please enter your phone number");
      return;
    }

    if (orderType === OrderType.Delivery && !deliveryAddress.trim()) {
      toast.error(isRtl ? "يرجى إدخال عنوان التوصيل بالتفصيل" : "Please enter your detailed delivery address");
      return;
    }

    if (orderType === OrderType.Carryout && !branchId) {
      toast.error(isRtl ? "يرجى اختيار الفرع المراد الاستلام منه" : "Please select a pickup branch");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Create Order via checkout first (reserves items & gets valid Order ID)
      const createdOrder = await checkoutMutation.mutateAsync({
        orderType,
        deliveryAddress: orderType === OrderType.Delivery ? deliveryAddress : undefined,
        branchId: orderType === OrderType.Carryout ? Number(branchId) : null,
        phoneNumber,
      });

      // 2. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.info(isRtl ? "تم تأكيد طلبك بنجاح! سيتم تحويلك إلى شاشة التتبع" : "Order placed successfully! Redirecting to tracking...");
        router.push(`/tracking/${createdOrder.id}`);
        setIsProcessingPayment(false);
        return;
      }

      // 3. Create Razorpay Payment Session on Backend using orderId
      let paymentOrder;
      try {
        paymentOrder = await paymentService.createOrder({
          orderId: createdOrder.id,
        });
      } catch (payErr: any) {
        console.warn("Payment order creation failed, fallback to direct order", payErr);
        toast.success(isRtl ? "تم تأكيد طلبك بنجاح!" : "Order placed successfully!");
        router.push(`/tracking/${createdOrder.id}`);
        setIsProcessingPayment(false);
        return;
      }

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: paymentOrder.keyId || RAZORPAY_KEY,
        amount: Math.round(paymentOrder.amount * 100),
        currency: paymentOrder.currency || "INR",
        name: "Pizza Delivery",
        description: `Order #${createdOrder.id} Payment`,
        image: "/favicon.png",
        order_id: paymentOrder.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // 5. Verify Payment on Backend
            const verification = await paymentService.verifyPayment({
              orderId: createdOrder.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verification.success) {
              toast.success(isRtl ? "تم تأكيد الدفع بنجاح!" : "Payment confirmed successfully!");
            }
          } catch (err: any) {
            console.error("Payment verification warning:", err);
          } finally {
            router.push(`/tracking/${createdOrder.id}`);
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.fullName || "Pizza Delivery Customer",
          email: user?.email || "customer@example.com",
          contact: phoneNumber,
        },
        theme: {
          color: "#991b1b",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            toast.info(isRtl ? "تم تسجيل الطلب ويمكنك إتمام الدفع أو المتابعة" : "Order recorded. You can track your order now.");
            router.push(`/tracking/${createdOrder.id}`);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();
    } catch (err: any) {
      console.error(err);
      const errorMsg =
        err.response?.data?.message ||
        (isRtl ? "تعذر إتمام الطلب، يرجى المحاولة مرة أخرى" : "Checkout failed, please try again");
      toast.error(errorMsg);
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 text-red-800 animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-sm">Reviewing your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center bg-white border border-stone-200/90 rounded-3xl p-8 space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-red-50 text-red-800 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-stone-900 font-serif">{t("cart_empty_title")}</h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            {t("cart_empty_desc")}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/menu"
            className="px-6 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-red-900/15"
          >
            {t("cart_browse_menu")}
          </Link>
          <Link
            href="/builder"
            className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 font-bold text-xs uppercase tracking-wider rounded-xl transition"
          >
            {t("cart_build_pizza")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 flex items-center gap-3 font-serif">
            <span>{t("cart_title")}</span>
            <span className="text-xs font-semibold px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full font-sans">
              {cartItems.length} {t("cart_items_count")}
            </span>
          </h1>
          <p className="text-stone-500 text-xs mt-1">{t("cart_sub_desc")}</p>
        </div>
        <Link
          href="/menu"
          className="text-xs text-red-800 hover:text-red-950 flex items-center gap-1 font-bold uppercase tracking-wider transition"
        >
          <span>{t("cart_add_more")}</span>
          <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Cart Items List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-white border border-stone-200/90 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-red-700/30 hover:shadow-md shadow-xs"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                  {(() => {
                    const rawUrl = item.imageUrl?.trim() || "";
                    const isDummy = rawUrl.includes("example.com") || rawUrl.includes("via.placeholder.com");
                    const src =
                      item.isCustom
                        ? "/pizza-real.png"
                        : rawUrl && !isDummy
                        ? rawUrl
                        : `/menu-${((Number(item.pizzaId || idx) - 1) % 8) + 1}.jpg`;

                    return (
                      <Image
                        src={src}
                        alt={item.pizzaName || "Pizza"}
                        fill
                        className="object-cover"
                      />
                    );
                  })()}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900">
                      {item.pizzaName || (item.isCustom ? t("builder_summary_title") : "Artisan Pizza")}
                    </h3>
                    {item.isCustom && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                        Custom
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500">
                    {t("cart_unit_price")} {formatPrice(item.unitPrice)}
                  </p>

                  {item.customDetails && (
                    <div className="text-[11px] text-stone-500">
                      <span>{t("cart_toppings_prefix")} </span>
                      {item.customDetails}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Quantity */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
                <div className="text-left rtl:text-right">
                  <span className="block text-xs text-stone-400">{t("cart_total_prefix")}</span>
                  <span className="text-base font-black text-red-800 font-sans">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQtyMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                        } else {
                          removeMutation.mutate(item.id);
                        }
                      }}
                      disabled={updateQtyMutation.isPending || removeMutation.isPending}
                      className="p-1.5 hover:bg-stone-200 text-stone-600 transition disabled:opacity-50"
                      title="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-stone-900 min-w-8 text-center font-sans">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateQtyMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 });
                      }}
                      disabled={updateQtyMutation.isPending}
                      className="p-1.5 hover:bg-stone-200 text-stone-600 transition disabled:opacity-50"
                      title="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeMutation.mutate(item.id)}
                    disabled={removeMutation.isPending}
                    title="Remove"
                    className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-200 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart Button */}
          {cartItems.length > 0 && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm(isRtl ? "هل أنت متأكد من تفريغ سلة التسوق؟" : "Are you sure you want to clear your cart?")) {
                    clearCartMutation.mutate();
                  }
                }}
                disabled={clearCartMutation.isPending}
                className="text-xs text-stone-500 hover:text-red-700 flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg border border-stone-200 hover:border-red-200 hover:bg-red-50 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRtl ? "تفريغ السلة بالكامل" : "Clear Entire Cart"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Checkout & Payment Section */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 h-fit space-y-6 sticky top-28 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2 font-serif">
            <CreditCard className="w-5 h-5 text-red-800" />
            <span>{t("cart_checkout_heading")}</span>
          </h2>

          <form onSubmit={handleCheckoutAndPay} className="space-y-4">
            
            {/* Order Type Toggle */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                {t("cart_order_type_label")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType(OrderType.Delivery)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    orderType === OrderType.Delivery
                      ? "bg-red-800 text-white border-red-800 shadow-sm"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>{t("cart_delivery_home")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType(OrderType.Carryout)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    orderType === OrderType.Carryout
                      ? "bg-red-800 text-white border-red-800 shadow-sm"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>{t("cart_carryout_store")}</span>
                </button>
              </div>
            </div>

            {/* Delivery Address (If Delivery) */}
            {orderType === OrderType.Delivery && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t("cart_address_label")}
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder={t("cart_address_ph")}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 pl-10 rtl:pl-3 rtl:pr-10 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white transition"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3.5" />
                </div>
              </div>
            )}

            {/* Branch Selection (If Carryout) */}
            {orderType === OrderType.Carryout && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t("cart_branch_label")}
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-red-800 focus:bg-white transition"
                >
                  <option value="">{t("cart_branch_ph")}</option>
                  {branches?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} - ({b.address})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t("cart_phone_label")}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01012345678"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 rtl:pl-4 rtl:pr-10 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-800 focus:bg-white transition"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 rtl:left-auto rtl:right-3 top-3.5" />
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="space-y-2 pt-4 border-t border-stone-200 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{t("cart_subtotal")}</span>
                <span className="font-sans">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{t("cart_delivery_fee")}</span>
                <span>{orderType === OrderType.Delivery ? "20 EGP" : t("cart_free")}</span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>{t("cart_total")}</span>
                <span className="text-red-800 font-sans">
                  {formatPrice(totalAmount + (orderType === OrderType.Delivery ? 20 : 0))}
                </span>
              </div>
            </div>

            {/* Submit & Razorpay Button */}
            <button
              type="submit"
              disabled={isProcessingPayment || checkoutMutation.isPending}
              className="w-full py-3.5 px-4 bg-red-800 hover:bg-red-900 text-white font-bold rounded-2xl transition shadow-lg shadow-red-900/15 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            >
              {isProcessingPayment || checkoutMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t("cart_processing_btn")}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>{t("cart_pay_btn")}</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
