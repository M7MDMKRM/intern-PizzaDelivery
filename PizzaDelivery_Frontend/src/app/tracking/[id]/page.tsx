import React, { Suspense } from "react";
import { OrderTrackingView } from "@/features/tracking/components/OrderTrackingView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تتبع حالة الطلب لحظياً | Pizza Delivery",
  description: "تتبع مراحل تجهيز وخبز وتوصيل طلب البيتزا الخاص بك لحظة بلحظة",
};

export default function OrderTrackingPage() {
  return (
    <div className="py-6">
      <Suspense
        fallback={
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-[#FEA116] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-400 text-sm">جاري تحميل بيانات التتبع...</p>
          </div>
        }
      >
        <OrderTrackingView />
      </Suspense>
    </div>
  );
}
