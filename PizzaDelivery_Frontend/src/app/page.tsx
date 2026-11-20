"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  UtensilsCrossed,
  Award,
  ChevronRight,
  Play,
  X,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePizzas } from "@/features/pizza-builder/hooks/usePizzas";
import { PizzaCard } from "@/features/pizza-builder/components/PizzaCard";
import { useLanguage } from "@/lib/LanguageContext";

export default function HomePage() {
  const { data: pizzas, isLoading } = usePizzas();
  const { t, isRtl } = useLanguage();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Featured top 4 pizzas
  const featuredPizzas = pizzas?.slice(0, 4) || [];

  const { scrollY } = useScroll();
  const pizzaY = useTransform(scrollY, [0, 600], [0, 80]);
  const heroTextY = useTransform(scrollY, [0, 600], [0, -35]);

  return (
    <div className="space-y-28 -mt-2">
      {/* 1. Hero Section - Full-Width Balance, Bigger Pizza, Aligned Layout & Parallax */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-stone-50/80 via-white to-stone-50/40 border border-stone-200/70 p-6 sm:p-10 lg:p-14 shadow-xs bg-grid-lines">
        
        {/* Ambient Subtle Gradients */}
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-red-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-amber-100/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Hero Left Content (6 Cols) */}
          <motion.div
            style={{ y: heroTextY }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1 lg:col-span-6 space-y-6 text-center lg:text-left rtl:lg:text-right"
          >
            {/* Modern Illuminated Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-xs hover:border-red-200 hover:shadow-sm transition-all duration-300">
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-red-800 via-red-700 to-amber-500 shadow-xs">
                <span className="absolute -inset-0.5 rounded-full bg-amber-500/30 blur-[2px] animate-pulse" />
                <Flame className="w-2.5 h-2.5 text-white fill-amber-200/50 relative z-10" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-stone-800">
                {t("hero_badge")}
              </span>
            </div>

            {/* Headline with Modern Typography */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 leading-[1.12] tracking-tight font-sans">
              {t("hero_title_1")}{" "}
              <span className="bg-gradient-to-r from-red-800 via-red-700 to-amber-600 bg-clip-text text-transparent inline-block font-black">
                {t("hero_title_accent")}
              </span>
              <br className="hidden sm:inline" />{" "}
              <span className="text-stone-850">{t("hero_title_2")}</span>
            </h1>

            {/* Description */}
            <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t("hero_desc")}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              {/* Primary Actions Row (Side-by-side on mobile) */}
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:justify-center lg:justify-start sm:gap-3">
                <Link
                  href="/menu"
                  className="px-3 sm:px-7 py-3 sm:py-3.5 bg-red-800 hover:bg-red-900 text-white font-bold rounded-2xl transition duration-300 shadow-md shadow-red-950/15 flex items-center justify-center gap-2 text-[11px] sm:text-xs uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Flame className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="truncate">{t("hero_order_btn")}</span>
                </Link>

                <Link
                  href="/builder"
                  className="px-3 sm:px-7 py-3 sm:py-3.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold rounded-2xl transition duration-300 flex items-center justify-center gap-2 text-[11px] sm:text-xs uppercase tracking-wider shadow-xs hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">{t("hero_builder_btn")}</span>
                </Link>
              </div>

              {/* Watch Video Teaser Button */}
              <div className="flex items-center justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-stone-100/90 hover:bg-stone-200 border border-stone-200 text-stone-800 transition duration-300 group cursor-pointer shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-red-800 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform shrink-0">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-stone-800">{t("hero_watch_btn")}</span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {isRtl ? "• سر الصنعة" : "• See how we bake"}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Hero Right: Bigger, Right-Aligned Rotating Pizza with Parallax (6 Cols) */}
          <motion.div
            style={{ y: pizzaY }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2 lg:col-span-6 relative flex items-center justify-center lg:justify-end rtl:lg:justify-start pt-2 sm:pt-0 mb-10 lg:mb-0"
          >
            <div className="relative w-64 h-64 xs:w-72 xs:h-72 sm:w-[420px] sm:h-[420px] lg:w-[460px] lg:h-[460px]">
              
              {/* Authentic Italian Pizza with Continuous Spin */}
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl shadow-stone-900/15 border-4 border-white bg-white">
                <Image
                  src="/pizza-real.png"
                  alt="Authentic Italian Pizza"
                  fill
                  priority
                  className="object-cover animate-pizza-rotate"
                />
              </div>

              {/* Floating Chef Video Teaser Card */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsVideoModalOpen(true)}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:bottom-4 sm:-left-4 bg-white/95 backdrop-blur-md border border-stone-200 p-2 sm:p-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 sm:gap-3 group text-left rtl:text-right cursor-pointer z-10 whitespace-nowrap"
              >
                <div className="relative w-12 h-11 sm:w-16 sm:h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <Image
                    src="/video.jpg"
                    alt="Chef Making Pizza Video"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-800 text-white flex items-center justify-center shadow-sm">
                      <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="pr-1 pl-1 sm:pl-2">
                  <span className="block text-[9px] sm:text-[10px] font-extrabold text-red-800 uppercase tracking-wider">
                    {t("hero_video_label")}
                  </span>
                  <span className="block text-[11px] sm:text-xs font-bold text-stone-900">
                    {t("hero_video_title")}
                  </span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal Player */}
      {isVideoModalOpen && (
        <div
          onClick={() => setIsVideoModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-stone-800"
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition cursor-pointer"
              title="Close Video"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                src="https://www.youtube.com/embed/wX8foM1z7S0?autoplay=1&modestbranding=1&rel=0"
                title="Secrets of Neapolitan Crust"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Services / Features Grid with Scroll Reveal */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="w-full space-y-12"
      >
        <div className="text-center space-y-2">
          <div className="section-title text-red-800 font-bold text-xs uppercase tracking-widest">
            {t("features_subtitle")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif">
            {t("features_title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-stone-200/90 p-7 rounded-3xl hover:border-red-800/40 hover:shadow-2xl transition-all duration-300 group shadow-xs cursor-default"
          >
            <div className="w-13 h-13 rounded-2xl bg-red-50 flex items-center justify-center text-red-800 mb-5 group-hover:bg-red-800 group-hover:text-white transition duration-300 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">{t("feat_1_title")}</h3>
            <p className="text-stone-500 text-xs leading-relaxed">{t("feat_1_desc")}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-stone-200/90 p-7 rounded-3xl hover:border-red-800/40 hover:shadow-2xl transition-all duration-300 group shadow-xs cursor-default"
          >
            <div className="w-13 h-13 rounded-2xl bg-red-50 flex items-center justify-center text-red-800 mb-5 group-hover:bg-red-800 group-hover:text-white transition duration-300 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">{t("feat_2_title")}</h3>
            <p className="text-stone-500 text-xs leading-relaxed">{t("feat_2_desc")}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-stone-200/90 p-7 rounded-3xl hover:border-red-800/40 hover:shadow-2xl transition-all duration-300 group shadow-xs cursor-default"
          >
            <div className="w-13 h-13 rounded-2xl bg-red-50 flex items-center justify-center text-red-800 mb-5 group-hover:bg-red-800 group-hover:text-white transition duration-300 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">{t("feat_3_title")}</h3>
            <p className="text-stone-500 text-xs leading-relaxed">{t("feat_3_desc")}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-stone-200/90 p-7 rounded-3xl hover:border-red-800/40 hover:shadow-2xl transition-all duration-300 group shadow-xs cursor-default"
          >
            <div className="w-13 h-13 rounded-2xl bg-red-50 flex items-center justify-center text-red-800 mb-5 group-hover:bg-red-800 group-hover:text-white transition duration-300 shadow-xs">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-2">{t("feat_4_title")}</h3>
            <p className="text-stone-500 text-xs leading-relaxed">{t("feat_4_desc")}</p>
          </motion.div>
        </div>
      </motion.section>

      {/* 3. Heritage & Story Section with Scroll Reveal */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center bg-white border border-stone-200/80 p-8 sm:p-14 rounded-3xl shadow-xs"
      >
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-stone-200 shadow-xs"
          >
            <Image src="/about-1.jpg" alt="Artisan 1" fill className="object-cover transition-transform duration-700 hover:scale-108" />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-stone-200 mt-6 shadow-xs"
          >
            <Image src="/about-2.jpg" alt="Artisan 2" fill className="object-cover transition-transform duration-700 hover:scale-108" />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-stone-200 -mt-6 shadow-xs"
          >
            <Image src="/about-3.jpg" alt="Artisan 3" fill className="object-cover transition-transform duration-700 hover:scale-108" />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-48 sm:h-64 rounded-2xl overflow-hidden border border-stone-200 shadow-xs"
          >
            <Image src="/about-4.jpg" alt="Artisan 4" fill className="object-cover transition-transform duration-700 hover:scale-108" />
          </motion.div>
        </div>

        <div className="space-y-6 text-left rtl:text-right">
          <div className="section-title text-red-800 font-bold text-xs uppercase tracking-widest">
            {t("story_badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight font-serif">
            {t("story_title")}
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            {t("story_desc")}
          </p>

          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-red-800 pl-4 rtl:pl-0 rtl:pr-4">
              <span className="text-3xl font-black text-red-800">{t("story_stat_1_num")}</span>
              <p className="text-xs text-stone-500 font-bold uppercase mt-1">
                {t("story_stat_1_txt")}
              </p>
            </div>
            <div className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-amber-600 pl-4 rtl:pl-0 rtl:pr-4">
              <span className="text-3xl font-black text-amber-700">{t("story_stat_2_num")}</span>
              <p className="text-xs text-stone-500 font-bold uppercase mt-1">
                {t("story_stat_2_txt")}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. Featured Pizzas Section with Scroll Reveal */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="w-full space-y-10"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="section-title text-red-800 font-bold text-xs uppercase tracking-widest">
              {t("featured_badge")}
            </div>
            <h2 className="text-3xl font-black text-stone-900 font-serif">
              {t("featured_title")}
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs font-bold text-red-800 hover:text-red-950 flex items-center gap-1 uppercase tracking-wider transition"
          >
            <span>{t("featured_view_all")}</span>
            <ChevronRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-stone-400 text-xs">{t("featured_loading")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPizzas.map((pizza) => (
              <PizzaCard key={pizza.id} pizza={pizza} />
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
