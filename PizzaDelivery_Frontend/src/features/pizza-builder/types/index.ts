export interface Pizza {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string;
  category?: string;
  isAvailable?: boolean;
}

export type IngredientCategory = "Base" | "Sauce" | "Cheese" | "Vegetables";

export interface Ingredient {
  id: number;
  name: string;
  category: IngredientCategory;
  extraPrice: number;
  stockQuantity?: number;
  imageUrl?: string;
}

export interface CreatePizzaDto {
  name: string;
  description?: string;
  price: number;
  size?: number;
  imageUrl?: string;
  discountPrice?: number | null;
  ingredients?: Array<{ ingredientId: number; quantityRequired: number }>;
}

export interface UpdatePizzaDto {
  name: string;
  description?: string;
  price: number;
  size?: number;
  imageUrl?: string;
  isAvailable: boolean;
  discountPrice?: number | null;
  ingredients?: Array<{ ingredientId: number; quantityRequired: number }>;
}
