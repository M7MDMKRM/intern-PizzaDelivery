"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  DollarSign,
  Sparkles,
  Search,
  X,
  UploadCloud,
  ImagePlus,
  RefreshCw,
  Link as LinkIcon,
} from "lucide-react";
import { usePizzas, useCreatePizza, useUpdatePizza, useDeletePizza } from "@/features/pizza-builder/hooks/usePizzas";
import { Pizza } from "@/features/pizza-builder/types";
import { pizzaService } from "@/features/pizza-builder/services/pizzaService";
import { formatPrice, getSafeImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";

const hasValidUploadedImage = (url?: string | null): boolean => {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  if (
    t === "" ||
    t === "string" ||
    t === "/pizza-real.png" ||
    t.includes("example.com") ||
    t.includes("placeholder")
  ) {
    return false;
  }
  return (
    t.startsWith("http://") ||
    t.startsWith("https://") ||
    t.startsWith("/uploads/") ||
    t.startsWith("/menu-") ||
    t.startsWith("data:image")
  );
};

export function AdminPizzasView() {
  const { isRtl } = useLanguage();
  const { data: pizzas, isLoading } = usePizzas();
  const createMutation = useCreatePizza();
  const updateMutation = useUpdatePizza();
  const deleteMutation = useDeletePizza();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);

  // Image Upload State
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 150,
    discountPrice: 0,
    imageUrl: "",
    isAvailable: true,
  });

  const openCreateModal = () => {
    setEditingPizza(null);
    setUploadMode("file");
    setFormData({
      name: "",
      description: "",
      price: 150,
      discountPrice: 0,
      imageUrl: "",
      isAvailable: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Pizza) => {
    setEditingPizza(p);
    const validImage = hasValidUploadedImage(p.imageUrl) ? (p.imageUrl || "") : "";
    setUploadMode(
      validImage.startsWith("http") || validImage.startsWith("/uploads")
        ? "file"
        : validImage
        ? "url"
        : "file"
    );
    setFormData({
      name: p.name,
      description: p.description || "",
      price: p.price,
      discountPrice: p.discountPrice || 0,
      imageUrl: validImage,
      isAvailable: p.isAvailable ?? true,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error(
        isRtl
          ? "صيغة الملف غير مدعومة. يرجى اختيار صورة JPG, PNG, أو WEBP"
          : "Unsupported format. Please choose a JPG, PNG, or WEBP image"
      );
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        isRtl
          ? "حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت"
          : "Image size exceeds 5MB limit"
      );
      return;
    }

    try {
      setIsUploading(true);
      const result = await pizzaService.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      toast.success(
        isRtl ? "تم رفع الصورة من جهازك بنجاح!" : "Image uploaded successfully from your device!"
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || (isRtl ? "فشل رفع الصورة" : "Failed to upload image")
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(isRtl ? "اسم البيتزا مطلوب" : "Pizza name is required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      discountPrice: formData.discountPrice > 0 ? Number(formData.discountPrice) : null,
      imageUrl: formData.imageUrl.trim() || "/menu-1.jpg",
      isAvailable: formData.isAvailable,
      size: 2, // Medium
      ingredients: [],
    };

    if (editingPizza) {
      updateMutation.mutate(
        { id: editingPizza.id, data: payload },
        {
          onSuccess: () => setModalOpen(false),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(isRtl ? `هل أنت متأكد من حذف بيتزا "${name}"؟` : `Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredPizzas = (pizzas || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub-header & Action button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 font-serif">
            {isRtl ? "كتالوج وقائمة البيتزا" : "Pizza Catalogue & Menu Items"}
          </h2>
          <p className="text-stone-500 text-xs">
            {isRtl
              ? "إضافة أصناف جديدة، تعديل الأسعار، وإدارة التوفر في المنيو"
              : "Add new pizza items, update prices, and manage menu availability"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRtl ? "بحث في البيتزا..." : "Search pizzas..."}
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-red-700 transition"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? "إضافة بيتزا جديدة" : "Add New Pizza"}</span>
          </button>
        </div>
      </div>

      {/* Pizza Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPizzas.map((p, idx) => (
            <div
              key={p.id}
              className="bg-white border border-stone-200/90 rounded-3xl p-5 space-y-4 hover:shadow-md hover:border-red-700/30 transition flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                  <Image
                    src={getSafeImageUrl(p.imageUrl, idx + 1)}
                    alt={p.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-stone-900 text-sm truncate">{p.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.isAvailable !== false
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {p.isAvailable !== false ? (isRtl ? "متوفر" : "Available") : (isRtl ? "غير متوفر" : "Out")}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2">{p.description}</p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="font-black text-red-800 text-sm font-sans">{formatPrice(p.price)}</span>
                    {p.discountPrice && (
                      <span className="text-[11px] text-stone-400 line-through font-sans">
                        {formatPrice(p.discountPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => openEditModal(p)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-bold transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>{isRtl ? "تعديل" : "Edit"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-red-700 hover:bg-red-50 transition border border-transparent hover:border-red-200 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900 font-serif">
                {editingPizza ? (isRtl ? "تعديل بيانات البيتزا" : "Edit Pizza") : (isRtl ? "إضافة بيتزا جديدة" : "Add New Pizza")}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {isRtl ? "اسم البيتزا" : "Pizza Name"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Pizza Margherita"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-red-800 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {isRtl ? "الوصف والمكونات" : "Description & Ingredients"}
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="San Marzano tomato sauce, fresh mozzarella..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-red-800 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    {isRtl ? "السعر (EGP)" : "Price (EGP)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 font-sans focus:outline-none focus:border-red-800 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    {isRtl ? "سعر الخصم (اختياري)" : "Discount Price"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 font-sans focus:outline-none focus:border-red-800 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Pizza Image Section (Italian Theme: Burgundy & Amber) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 font-serif">
                    {isRtl ? "صورة البيتزا" : "Pizza Image"}
                  </label>

                  {/* Modern Italian Nav Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl border border-stone-200/80">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        uploadMode === "file"
                          ? "bg-red-800 text-white shadow-xs font-black"
                          : "text-stone-600 hover:text-red-800 hover:bg-stone-200/50"
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isRtl ? "رفع من الجهاز" : "Upload File"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        uploadMode === "url"
                          ? "bg-red-800 text-white shadow-xs font-black"
                          : "text-stone-600 hover:text-red-800 hover:bg-stone-200/50"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>{isRtl ? "رابط مباشر" : "Image URL"}</span>
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = "";
                  }}
                />

                {uploadMode === "file" ? (
                  <div>
                    {hasValidUploadedImage(formData.imageUrl) ? (
                      /* Luxury Italian Preview Card */
                      <div className="flex items-center gap-4 p-3.5 bg-gradient-to-r from-amber-50/50 via-white to-stone-50/70 border border-amber-200/90 rounded-2xl shadow-xs">
                        <div className="relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-amber-200 bg-stone-100 shrink-0 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formData.imageUrl}
                            alt="Pizza preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/menu-1.jpg";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{isRtl ? "تم تعيين الصورة بنجاح" : "Image Set Successfully"}</span>
                            </span>
                          </div>

                          <p className="text-[11px] text-stone-500 font-mono truncate" title={formData.imageUrl}>
                            {formData.imageUrl.includes("/uploads/")
                              ? `📁 ${formData.imageUrl.split("/").pop()}`
                              : formData.imageUrl}
                          </p>

                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="px-3 py-1 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3 text-amber-700" />
                              <span>{isRtl ? "تغيير الصورة" : "Change Image"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isRtl ? "إزالة" : "Remove"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Luxury Pizzeria Dropzone */
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2.5 ${
                          isDragging
                            ? "border-red-800 bg-red-50/70 scale-[1.01] shadow-inner"
                            : "border-stone-200 hover:border-red-800/60 bg-gradient-to-b from-[#fdfbf7] via-white to-amber-50/20 hover:bg-amber-50/30 shadow-xs hover:shadow-sm"
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2.5 py-3">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200/80 flex items-center justify-center text-red-800">
                              <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                            <p className="text-xs font-bold text-red-950 font-serif">
                              {isRtl ? "جاري رفع الصورة من جهازك..." : "Uploading image from your device..."}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-red-50 text-red-800 border border-amber-200/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                              <ImagePlus className="w-6 h-6 text-red-800" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-stone-900 font-serif">
                                {isRtl
                                  ? "اضغط لاختيار صورة من جهازك أو اسحبها هنا"
                                  : "Click to upload from device or drag & drop"}
                              </p>
                              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 font-medium">
                                <span className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200/60 font-sans">
                                  JPG, PNG, WEBP
                                </span>
                                <span>•</span>
                                <span>{isRtl ? "الحد الأقصى 5 ميجابايت" : "Max 5MB"}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* URL Input Mode */
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://... or /menu-1.jpg"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-red-800 focus:bg-white transition"
                    />
                    {hasValidUploadedImage(formData.imageUrl) && (
                      <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-amber-50/40 via-white to-stone-50 border border-amber-200/80 rounded-xl">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-amber-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formData.imageUrl}
                            alt="URL preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/menu-1.jpg";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <span className="text-[11px] font-bold text-stone-800 block truncate font-mono">
                            {formData.imageUrl}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold block">
                            {isRtl ? "✓ رابط صورة صالح للمعاينة" : "✓ Valid image URL"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded text-red-800 focus:ring-red-800 cursor-pointer"
                />
                <label htmlFor="isAvailable" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  {isRtl ? "الصنف متوفر للطلب في القائمة" : "Available for ordering"}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{isRtl ? "حفظ البيانات" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
