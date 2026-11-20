"use client";

import React, { useState } from "react";
import {
  useIngredients,
  useUpdateIngredientStock,
  useCreateIngredient,
  useDeleteIngredient,
  useIngredientCategories,
} from "@/features/pizza-builder/hooks/usePizzas";
import { Ingredient } from "@/features/pizza-builder/types";
import { formatPrice } from "@/lib/utils";
import {
  Boxes,
  Edit,
  Save,
  X,
  AlertTriangle,
  Plus,
  Minus,
  Loader2,
  Trash2,
  PlusCircle,
  Wheat,
  Flame,
  Layers,
  Salad,
  Drumstick,
} from "lucide-react";

import { useLanguage } from "@/lib/LanguageContext";

interface NewIngredientForm {
  name: string;
  categoryId: number;
  unit: number;
  costPrice: number;
  extraPrice: number;
  stockQuantity: number;
  minThreshold: number;
  maxThreshold: number;
  isExtraAllowed: boolean;
  canBeRemoved: boolean;
  isAllergen: boolean;
}

const INITIAL_FORM: NewIngredientForm = {
  name: "",
  categoryId: 1,
  unit: 1, // Gram
  costPrice: 5,
  extraPrice: 10,
  stockQuantity: 100,
  minThreshold: 10,
  maxThreshold: 500,
  isExtraAllowed: true,
  canBeRemoved: true,
  isAllergen: false,
};

export function AdminInventoryView() {
  const { data: ingredients, isLoading } = useIngredients();
  const { data: categories } = useIngredientCategories();
  const updateStockMutation = useUpdateIngredientStock();
  const createIngredientMutation = useCreateIngredient();
  const deleteIngredientMutation = useDeleteIngredient();
  const { t, isRtl } = useLanguage();

  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [newStock, setNewStock] = useState<number>(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewIngredientForm>(INITIAL_FORM);

  const handleOpenEdit = (item: Ingredient) => {
    setEditingItem(item);
    setNewStock(item.stockQuantity || 0);
  };

  const handleSaveStock = () => {
    if (!editingItem) return;
    updateStockMutation.mutate(
      { id: editingItem.id, stock: newStock },
      {
        onSuccess: () => {
          setEditingItem(null);
        },
      }
    );
  };

  const handleDeleteIngredient = (item: Ingredient) => {
    if (window.confirm(`${t("inv_delete_confirm")} (${item.name})`)) {
      deleteIngredientMutation.mutate(item.id);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    createIngredientMutation.mutate(formData, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        setFormData(INITIAL_FORM);
      },
    });
  };

  const getCategoryIcon = (catName?: string) => {
    const name = (catName || "").toLowerCase();
    if (name.includes("dough") || name.includes("base") || name.includes("عجين"))
      return <Wheat className="w-3.5 h-3.5 text-amber-600" />;
    if (name.includes("sauce") || name.includes("صلص"))
      return <Flame className="w-3.5 h-3.5 text-red-500" />;
    if (name.includes("cheese") || name.includes("جبن"))
      return <Layers className="w-3.5 h-3.5 text-amber-500" />;
    if (name.includes("meat") || name.includes("لحم"))
      return <Drumstick className="w-3.5 h-3.5 text-rose-600" />;
    return <Salad className="w-3.5 h-3.5 text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/60 shadow-xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 font-serif">{t("inv_heading")}</h2>
            <p className="text-stone-500 text-xs mt-0.5">{t("inv_sub")}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            // Set initial categoryId to first category if available
            if (categories && categories.length > 0) {
              setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
            }
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-2xl shadow-sm hover:shadow transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t("inv_btn_add")}</span>
        </button>
      </div>

      {/* Ingredients Table */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-red-800 animate-spin mx-auto mb-4" />
          <p className="text-stone-400 text-xs">{t("inv_loading")}</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className={`w-full text-xs ${isRtl ? "text-right" : "text-left"}`}>
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold">
                <tr>
                  <th className="p-4">{t("inv_col_id")}</th>
                  <th className="p-4">{t("inv_col_name")}</th>
                  <th className="p-4">{t("inv_col_cat")}</th>
                  <th className="p-4">{t("inv_col_price")}</th>
                  <th className="p-4">{t("inv_col_stock")}</th>
                  <th className="p-4 text-center">{t("inv_col_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ingredients?.map((item) => {
                  const isLow = (item.stockQuantity ?? 10) < 10;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60 transition">
                      <td className="p-4 font-mono text-stone-400 font-sans">#{item.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 border border-stone-200/80 rounded-lg text-stone-700 font-medium">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </span>
                      </td>
                      <td className="p-4 text-red-800 font-black font-sans">
                        {item.extraPrice > 0 ? formatPrice(item.extraPrice) : t("inv_free")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full font-bold inline-flex items-center gap-1.5 font-sans ${
                            isLow
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3 text-red-600" />}
                          <span>{item.stockQuantity ?? 0} {t("inv_unit")}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-stone-300 font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            title={t("inv_btn_edit")}
                          >
                            <Edit className="w-3.5 h-3.5 text-stone-400" />
                            <span>{t("inv_btn_edit")}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteIngredient(item)}
                            disabled={deleteIngredientMutation.isPending}
                            className="p-1.5 bg-white hover:bg-red-50 text-stone-400 hover:text-red-700 border border-stone-200 hover:border-red-200 rounded-xl transition cursor-pointer"
                            title={t("inv_btn_delete")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create New Ingredient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-800 flex items-center justify-center border border-red-200/60">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">{t("inv_modal_add_title")}</h3>
                  <p className="text-stone-400 text-xs">{t("inv_modal_add_sub")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1 rounded-lg hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Ingredient Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  {t("inv_field_name")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: جبنة بارميزان معتقة، فطر بورتوبيللو" : "e.g. Aged Parmesan, Truffle Oil"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-red-700 focus:bg-white transition"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    {t("inv_field_cat")} *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-red-700 focus:bg-white transition cursor-pointer"
                  >
                    {categories && categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={1}>{t("inv_cat_dough")}</option>
                        <option value={2}>{t("inv_cat_sauce")}</option>
                        <option value={3}>{t("inv_cat_cheese")}</option>
                        <option value={1001}>{t("inv_cat_veggies")}</option>
                        <option value={1002}>{t("inv_cat_meat")}</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    {t("inv_field_unit")} *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-red-700 focus:bg-white transition cursor-pointer"
                  >
                    <option value={1}>{t("inv_unit_gram")}</option>
                    <option value={2}>{t("inv_unit_kg")}</option>
                    <option value={3}>{t("inv_unit_ml")}</option>
                    <option value={4}>{t("inv_unit_liter")}</option>
                    <option value={5}>{t("inv_unit_piece")}</option>
                  </select>
                </div>
              </div>

              {/* Pricing (Cost & Extra) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    {t("inv_field_cost")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 font-sans focus:outline-none focus:border-red-700 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    {t("inv_field_extra_price")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.extraPrice}
                    onChange={(e) => setFormData({ ...formData, extraPrice: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 font-sans focus:outline-none focus:border-red-700 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Stock & Thresholds */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    {t("inv_field_stock")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 font-sans focus:outline-none focus:border-red-700 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    {t("inv_field_min_threshold")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 font-sans focus:outline-none focus:border-red-700 focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">
                    {t("inv_field_max_threshold")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxThreshold}
                    onChange={(e) => setFormData({ ...formData, maxThreshold: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 font-sans focus:outline-none focus:border-red-700 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Options Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <label className="flex items-center gap-3 text-xs text-stone-700 cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={formData.isExtraAllowed}
                    onChange={(e) => setFormData({ ...formData, isExtraAllowed: e.target.checked })}
                    className="w-4 h-4 rounded text-red-700 focus:ring-red-600 border-stone-300 cursor-pointer"
                  />
                  <span>{t("inv_field_extra_allowed")}</span>
                </label>

                <label className="flex items-center gap-3 text-xs text-stone-700 cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={formData.isAllergen}
                    onChange={(e) => setFormData({ ...formData, isAllergen: e.target.checked })}
                    className="w-4 h-4 rounded text-red-700 focus:ring-red-600 border-stone-300 cursor-pointer"
                  />
                  <span>{t("inv_field_is_allergen")}</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={createIngredientMutation.isPending}
                  className="flex-1 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {createIngredientMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{t("inv_btn_submit_add")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  {t("inv_modal_cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900 font-serif">{t("inv_modal_title")}</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-stone-400 block font-medium">{t("inv_modal_ing")}</span>
              <p className="text-lg font-bold text-red-800">{editingItem.name}</p>
              <span className="text-xs text-stone-500 block">
                {t("inv_col_cat")}: {editingItem.category}
              </span>
            </div>

            {/* Stepper Count Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                {t("inv_modal_new_qty")}
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewStock(Math.max(0, newStock - 1))}
                  className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 hover:bg-stone-200 flex items-center justify-center font-bold cursor-pointer transition"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full text-center bg-stone-50 border border-stone-200 rounded-xl py-2.5 text-lg font-black text-stone-900 focus:outline-none focus:border-red-700 font-sans"
                />

                <button
                  type="button"
                  onClick={() => setNewStock(newStock + 1)}
                  className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 hover:bg-stone-200 flex items-center justify-center font-bold cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveStock}
                disabled={updateStockMutation.isPending}
                className="flex-1 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {updateStockMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{t("inv_modal_save")}</span>
              </button>

              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                {t("inv_modal_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
