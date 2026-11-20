import { create } from "zustand";
import { Ingredient } from "../types";

export interface CustomPizzaState {
  step: number; // 1: Base, 2: Sauce, 3: Cheese, 4: Vegetables
  selectedBase: Ingredient | null;
  selectedSauce: Ingredient | null;
  selectedCheese: Ingredient | null;
  selectedVegetables: Ingredient[];
  basePrice: number;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  selectBase: (ingredient: Ingredient) => void;
  selectSauce: (ingredient: Ingredient) => void;
  selectCheese: (ingredient: Ingredient) => void;
  toggleVegetable: (ingredient: Ingredient) => void;
  resetBuilder: () => void;

  // Computed / Helpers
  getTotalPrice: () => number;
  getCustomDetailsString: () => string;
  canProceedToNext: () => boolean;
}

const DEFAULT_BASE_PRICE = 80;

export const usePizzaBuilderStore = create<CustomPizzaState>((set, get) => ({
  step: 1,
  selectedBase: null,
  selectedSauce: null,
  selectedCheese: null,
  selectedVegetables: [],
  basePrice: DEFAULT_BASE_PRICE,

  setStep: (step: number) => set({ step }),
  
  nextStep: () => {
    const { step, canProceedToNext } = get();
    if (canProceedToNext() && step < 4) {
      set({ step: step + 1 });
    }
  },

  prevStep: () => {
    const { step } = get();
    if (step > 1) {
      set({ step: step - 1 });
    }
  },

  selectBase: (ingredient: Ingredient) => set({ selectedBase: ingredient }),
  selectSauce: (ingredient: Ingredient) => set({ selectedSauce: ingredient }),
  selectCheese: (ingredient: Ingredient) => set({ selectedCheese: ingredient }),

  toggleVegetable: (ingredient: Ingredient) => {
    const { selectedVegetables } = get();
    const exists = selectedVegetables.some((v) => v.id === ingredient.id);
    if (exists) {
      set({
        selectedVegetables: selectedVegetables.filter((v) => v.id !== ingredient.id),
      });
    } else {
      set({ selectedVegetables: [...selectedVegetables, ingredient] });
    }
  },

  resetBuilder: () =>
    set({
      step: 1,
      selectedBase: null,
      selectedSauce: null,
      selectedCheese: null,
      selectedVegetables: [],
    }),

  getTotalPrice: () => {
    const { basePrice, selectedBase, selectedSauce, selectedCheese, selectedVegetables } =
      get();
    let total = basePrice;
    if (selectedBase) total += selectedBase.extraPrice || 0;
    if (selectedSauce) total += selectedSauce.extraPrice || 0;
    if (selectedCheese) total += selectedCheese.extraPrice || 0;
    selectedVegetables.forEach((v) => {
      total += v.extraPrice || 0;
    });
    return total;
  },

  getCustomDetailsString: () => {
    const { selectedBase, selectedSauce, selectedCheese, selectedVegetables } = get();
    const parts = [
      `Base: ${selectedBase?.name || "None"}`,
      `Sauce: ${selectedSauce?.name || "None"}`,
      `Cheese: ${selectedCheese?.name || "None"}`,
      `Veggies: ${
        selectedVegetables.length > 0
          ? selectedVegetables.map((v) => v.name).join(", ")
          : "None"
      }`,
    ];
    return parts.join(" | ");
  },

  canProceedToNext: () => {
    const { step, selectedBase, selectedSauce, selectedCheese } = get();
    if (step === 1) return selectedBase !== null;
    if (step === 2) return selectedSauce !== null;
    if (step === 3) return selectedCheese !== null;
    return true; // Step 4 (Veggies) is optional/multi-select
  },
}));
