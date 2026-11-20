"use client";

import React, { useState } from "react";
import {
  Store,
  Plus,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  X,
  Power,
} from "lucide-react";
import { useAdminBranches, useCreateBranch, useUpdateBranchStatus } from "../hooks/useAdminStats";
import { AdminBranch } from "../types";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";

export function AdminBranchesView() {
  const { isRtl } = useLanguage();
  const { data: branches, isLoading } = useAdminBranches();
  const createMutation = useCreateBranch();
  const updateStatusMutation = useUpdateBranchStatus();

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "Cairo",
    address: "",
    phoneNumber: "",
    openingHours: "10:00 AM - 12:00 AM",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.phoneNumber.trim()) {
      toast.error(isRtl ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        setModalOpen(false);
        setFormData({
          name: "",
          city: "Cairo",
          address: "",
          phoneNumber: "",
          openingHours: "10:00 AM - 12:00 AM",
        });
      },
    });
  };

  const handleToggleStatus = (b: AdminBranch) => {
    const nextStatus = !b.isActive;
    updateStatusMutation.mutate({ id: b.id, isActive: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Sub-header & Action button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 font-serif">
            {isRtl ? "شبكة الفروع ومنافذ الاستلام" : "Branches & Pickup Outlets"}
          </h2>
          <p className="text-stone-500 text-xs">
            {isRtl
              ? "إضافة فروع جديدة والتحكم في استقبال طلبات الاستلام والتشغيل الفوري"
              : "Manage store branches, locations, and toggle active receiving status"}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isRtl ? "إضافة فرع جديد" : "Add New Branch"}</span>
        </button>
      </div>

      {/* Branches List */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(branches || []).map((b: AdminBranch) => (
            <div
              key={b.id}
              className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 hover:shadow-md hover:border-red-700/30 transition shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">{b.name}</h3>
                      <span className="text-[11px] text-stone-400">{b.city || "Cairo"}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      b.isActive
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    {b.isActive ? (isRtl ? "مفتوح ويستقبل" : "Open") : (isRtl ? "مغلق حالياً" : "Closed")}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </div>
                  {b.phoneNumber && (
                    <div className="flex items-center gap-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{b.phoneNumber}</span>
                    </div>
                  )}
                  {b.openingHours && (
                    <div className="flex items-center gap-2 text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{b.openingHours}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status toggle action */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  {isRtl ? "حالة الاستلام:" : "Pickup Status:"}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(b)}
                  disabled={updateStatusMutation.isPending}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    b.isActive
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-red-50 hover:text-red-800 hover:border-red-200"
                      : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>
                    {b.isActive
                      ? (isRtl ? "إيقاف الفرع" : "Deactivate")
                      : (isRtl ? "تفعيل واستقبال" : "Activate")}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Branch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900 font-serif">
                {isRtl ? "إضافة فرع جديد" : "Add New Branch"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isRtl ? "اسم الفرع" : "Branch Name"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. فرع الشيخ زايد - كابيتال بيزنس"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-red-800 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isRtl ? "المدينة" : "City"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cairo / Giza"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-red-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {isRtl ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="01012345678"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-red-800 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isRtl ? "العنوان التفصيلي" : "Full Address"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, District..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-red-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isRtl ? "ساعات العمل" : "Opening Hours"}
                </label>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  placeholder="10:00 AM - 12:00 AM"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-red-800 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isRtl ? "حفظ الفرع" : "Save Branch"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
