"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import { MapPin, Phone, Mail, Clock, Heart, Utensils } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-white text-stone-700 border-t border-stone-200/80 pt-16 pb-8 mt-24 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-md border-2 border-red-800/20 bg-white shrink-0">
                <Image
                  src="/logo.png"
                  alt="Crusty's Pizza"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-2xl font-black text-stone-900 font-sans tracking-tight">
                CRUSTY<span className="text-red-800">’S</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-500 mb-4">
              {t("footer_about")}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-stone-900 mb-6 border-b border-stone-200 pb-2">
              {t("footer_quick_links")}
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/menu" className="text-stone-600 hover:text-red-800 transition">
                  {t("footer_menu")}
                </Link>
              </li>
              <li>
                <Link href="/builder" className="text-stone-600 hover:text-red-800 transition">
                  {t("footer_builder")}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-stone-600 hover:text-red-800 transition">
                  {t("footer_cart")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-stone-600 hover:text-red-800 transition">
                  {t("footer_account")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-stone-900 mb-6 border-b border-stone-200 pb-2">
              {t("footer_contact_title")}
            </h4>
            <ul className="space-y-3.5 text-xs text-stone-600">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-red-800 shrink-0" />
                <span>{t("footer_address")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-red-800 shrink-0" />
                <span dir="ltr">+20 100 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-red-800 shrink-0" />
                <span>orders@pizzadelivery.com</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Working Hours */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-stone-900 mb-6 border-b border-stone-200 pb-2">
              {t("footer_hours_title")}
            </h4>
            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-red-800" />
                <span className="font-semibold text-stone-900">{t("footer_hours_week")}</span>
              </div>
              <p className="ml-5 text-[11px] text-stone-500">{t("footer_hours_week_time")}</p>
              <div className="flex items-center gap-2 pt-2">
                <Clock className="w-3.5 h-3.5 text-red-800" />
                <span className="font-semibold text-stone-900">{t("footer_hours_fri")}</span>
              </div>
              <p className="ml-5 text-[11px] text-stone-500">{t("footer_hours_fri_time")}</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 Pizza Delivery. {t("footer_rights")}</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-800 fill-red-800" /> {t("footer_for_lovers")}
          </p>
        </div>
      </div>
    </footer>
  );
}
