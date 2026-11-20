import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, lang?: "en" | "ar"): string {
  // If not explicitly provided, detect from DOM or localStorage if available
  let activeLang: "en" | "ar" = lang || "en";
  if (!lang && typeof window !== "undefined") {
    const docLang = document.documentElement.lang;
    const stored = localStorage.getItem("preferred_lang");
    if (docLang === "ar" || stored === "ar") {
      activeLang = "ar";
    }
  }

  if (activeLang === "ar") {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(price);
  }

  return `${price.toLocaleString("en-US")} EGP`;
}

export function getSafeImageUrl(rawUrl?: string | null, fallbackIndex = 1): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return `/menu-${((Math.max(1, fallbackIndex) - 1) % 8) + 1}.jpg`;
  }

  const trimmed = rawUrl.trim();
  if (
    trimmed === "string" ||
    trimmed === "" ||
    trimmed.includes("example.com") ||
    trimmed.includes("placeholder")
  ) {
    return `/menu-${((Math.max(1, fallbackIndex) - 1) % 8) + 1}.jpg`;
  }

  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `/menu-${((Math.max(1, fallbackIndex) - 1) % 8) + 1}.jpg`;
}
