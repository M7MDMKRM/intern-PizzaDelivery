"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { usePathname } from "next/navigation";
import {
  Utensils,
  ShoppingBag,
  LogOut,
  Sparkles,
  ChefHat,
  Flame,
  Globe,
  Menu,
  X,
  Home,
  Clock,
  User as UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { useCart } from "@/features/cart/hooks/useCart";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, role, logout, user } = useAuthStore();
  const { data: cart } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const totalCartCount =
    cart?.totalItems ?? (cart?.items ? cart.items.reduce((acc, i) => acc + i.quantity, 0) : 0);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-stone-200/80 shadow-xs transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 border-2 border-red-800/20 bg-white shrink-0">
              <Image
                src="/logo.png"
                alt="Crusty's Pizza"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 flex items-center font-sans leading-tight">
                CRUSTY<span className="text-red-800">’S</span>
              </span>
              <span className="hidden sm:block text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-none">
                Artisan Pizza
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Centered Pill */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-stone-100/90 p-1.5 rounded-full border border-stone-200/80 shadow-inner">
            <Link
              href="/"
              className={cn(
                "px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-200",
                pathname === "/"
                  ? "bg-red-800 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/60"
              )}
            >
              {t("nav_home")}
            </Link>
            <Link
              href="/menu"
              className={cn(
                "px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all duration-200",
                pathname === "/menu"
                  ? "bg-red-800 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/60"
              )}
            >
              <Flame className={cn("w-3.5 h-3.5", pathname === "/menu" ? "text-amber-300" : "text-red-700")} />
              {t("nav_menu")}
            </Link>
            <Link
              href="/builder"
              className={cn(
                "px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all duration-200",
                pathname === "/builder"
                  ? "bg-gradient-to-r from-red-800 to-amber-700 text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/60"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              {t("nav_builder")}
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                className={cn(
                  "px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-200",
                  pathname === "/orders"
                    ? "bg-red-800 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/60"
                )}
              >
                {t("nav_orders")}
              </Link>
            )}
            {role === "Admin" && (
              <Link
                href="/admin"
                className={cn(
                  "px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all duration-200",
                  pathname?.startsWith("/admin")
                    ? "bg-stone-900 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-950 hover:bg-stone-200/60"
                )}
              >
                <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                {t("nav_admin")}
              </Link>
            )}
          </nav>

          {/* Right Actions: Lang + Cart + User + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title={language === "en" ? "التبديل إلى العربية" : "Switch to English"}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-red-800" />
              <span>{language === "en" ? "عربي" : "EN"}</span>
            </button>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 sm:p-2.5 rounded-xl bg-stone-100 text-stone-800 hover:bg-red-50 hover:text-red-800 transition border border-stone-200 shadow-2xs"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-800 text-white text-[10px] font-black w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Desktop User Auth state */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-2 pl-1 rtl:pl-0 rtl:pr-1">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200/80">
                  <div className="w-7 h-7 rounded-lg bg-red-800/10 text-red-800 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col text-left rtl:text-right">
                    <span className="text-[10px] text-stone-400 font-medium leading-none">
                      {t("nav_welcome")}
                    </span>
                    <span className="text-xs text-stone-900 font-bold max-w-[120px] truncate leading-tight mt-0.5">
                      {user?.fullName || "Customer"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title={t("nav_logout")}
                  className="p-2.5 rounded-xl bg-stone-100 text-stone-500 hover:text-red-800 hover:bg-red-50 transition border border-stone-200 shadow-2xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-red-800 transition"
                >
                  {t("nav_login")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-800 hover:bg-red-900 text-white rounded-xl transition shadow-md shadow-red-950/15"
                >
                  {t("nav_register")}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-red-800" /> : <Menu className="w-5 h-5 text-stone-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white/98 backdrop-blur-md px-4 py-5 shadow-2xl animate-in slide-in-from-top-3 duration-200">
            <div className="space-y-2">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition",
                  pathname === "/"
                    ? "bg-red-800 text-white shadow-sm"
                    : "text-stone-700 hover:bg-stone-100"
                )}
              >
                <Home className="w-4 h-4" />
                <span>{t("nav_home")}</span>
              </Link>

              <Link
                href="/menu"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition",
                  pathname === "/menu"
                    ? "bg-red-800 text-white shadow-sm"
                    : "text-stone-700 hover:bg-stone-100"
                )}
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>{t("nav_menu")}</span>
              </Link>

              <Link
                href="/builder"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition",
                  pathname === "/builder"
                    ? "bg-gradient-to-r from-red-800 to-amber-700 text-white shadow-sm"
                    : "bg-red-50/70 text-red-900 border border-red-200/80"
                )}
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t("nav_builder")}</span>
              </Link>

              {isAuthenticated && (
                <Link
                  href="/orders"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition",
                    pathname === "/orders"
                      ? "bg-red-800 text-white shadow-sm"
                      : "text-stone-700 hover:bg-stone-100"
                  )}
                >
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span>{t("nav_orders")}</span>
                </Link>
              )}

              {role === "Admin" && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition",
                    pathname?.startsWith("/admin")
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-stone-100 text-stone-800"
                  )}
                >
                  <ChefHat className="w-4 h-4 text-amber-500" />
                  <span>{t("nav_admin")}</span>
                </Link>
              )}
            </div>

            {/* Mobile User Profile Section */}
            <div className="mt-5 pt-4 border-t border-stone-200">
              {isAuthenticated ? (
                <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-800/10 text-red-800 flex items-center justify-center font-bold text-sm uppercase">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col text-left rtl:text-right">
                      <span className="text-[10px] text-stone-400 font-medium">
                        {t("nav_welcome")}
                      </span>
                      <span className="text-xs text-stone-900 font-bold truncate max-w-[180px]">
                        {user?.fullName || "Customer"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 text-stone-500 hover:text-red-800 hover:bg-red-50 rounded-xl transition"
                    title={t("nav_logout")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                  >
                    {t("nav_login")}
                  </Link>
                  <Link
                    href="/register"
                    className="py-2.5 text-center text-xs font-bold uppercase tracking-wider bg-red-800 hover:bg-red-900 text-white rounded-xl transition shadow-md shadow-red-950/15"
                  >
                    {t("nav_register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Sticky Mobile Bottom Navigation Bar (Food Delivery App Experience) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-2 px-3 shadow-2xl flex items-center justify-around safe-area-pb">
        {/* Home */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-1 transition-all py-1 px-2 rounded-xl",
            pathname === "/" ? "text-red-800 font-black" : "text-stone-500 hover:text-stone-900"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">{t("nav_home")}</span>
        </Link>

        {/* Menu */}
        <Link
          href="/menu"
          className={cn(
            "flex flex-col items-center gap-1 transition-all py-1 px-2 rounded-xl",
            pathname === "/menu" ? "text-red-800 font-black" : "text-stone-500 hover:text-stone-900"
          )}
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">{t("nav_menu")}</span>
        </Link>

        {/* Center Builder Button (Elevated) */}
        <Link
          href="/builder"
          className="flex flex-col items-center -mt-6 group"
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95",
            pathname === "/builder"
              ? "bg-amber-600 text-white ring-4 ring-amber-100 shadow-amber-600/30"
              : "bg-gradient-to-tr from-red-800 to-red-950 text-white ring-4 ring-white shadow-red-900/30"
          )}>
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <span className={cn(
            "text-[9px] font-bold tracking-tight mt-1",
            pathname === "/builder" ? "text-amber-700" : "text-stone-600"
          )}>
            {t("nav_builder")}
          </span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className={cn(
            "flex flex-col items-center gap-1 transition-all py-1 px-2 rounded-xl relative",
            pathname === "/cart" ? "text-red-800 font-black" : "text-stone-500 hover:text-stone-900"
          )}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-800 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{t("footer_cart")}</span>
        </Link>

        {/* Orders / Account */}
        <Link
          href={isAuthenticated ? "/orders" : "/login"}
          className={cn(
            "flex flex-col items-center gap-1 transition-all py-1 px-2 rounded-xl",
            pathname === "/orders" || pathname === "/login"
              ? "text-red-800 font-black"
              : "text-stone-500 hover:text-stone-900"
          )}
        >
          {isAuthenticated ? <Clock className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
          <span className="text-[10px] tracking-tight">
            {isAuthenticated ? t("nav_orders") : t("nav_login")}
          </span>
        </Link>
      </nav>
    </>
  );
}
