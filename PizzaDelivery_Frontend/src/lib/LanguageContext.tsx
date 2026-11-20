"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRtl: boolean;
  formatPrice: (price: number) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Nav
    brand_sub: "Authentic Italian Craft, Delivered Piping Hot",
    nav_home: "Home",
    nav_menu: "Menu",
    nav_builder: "Pizza Builder (Custom)",
    nav_admin: "Kitchen & Operations",
    nav_login: "Login",
    nav_register: "Sign Up",
    nav_orders: "My Orders",
    nav_welcome: "Welcome",
    nav_logout: "Logout",

    // Hero
    hero_badge: "FASTEST AUTHENTIC ITALIAN PIZZA DELIVERY",
    hero_title_1: "Taste The True Craft Of",
    hero_title_accent: "Artisan Pizza",
    hero_title_2: "Baked To Perfection",
    hero_desc:
      "Crafted with 100% natural Italian ingredients, slow-fermented dough prepared daily, and fired in stone ovens to bring you an unforgettable culinary experience at your doorstep.",
    hero_order_btn: "Order From Menu",
    hero_builder_btn: "Craft Your Own Pizza",
    hero_watch_btn: "Watch How We Bake",
    hero_video_label: "Dough Craft Video",
    hero_video_title: "Secrets of Neapolitan Crust",

    // Features
    features_subtitle: "WHY US",
    features_title: "The Art Behind Every Slice",
    feat_1_title: "Master Artisans",
    feat_1_desc: "Certified pizzaiolos mastering centuries of Neapolitan dough craftsmanship.",
    feat_2_title: "100% Natural Freshness",
    feat_2_desc: "San Marzano tomatoes, fresh buffalo mozzarella, and premium EVOO olive oil.",
    feat_3_title: "Piping Hot Delivery",
    feat_3_desc: "Delivered fast in thermal-sealed stone-safe boxes with live SignalR tracking.",
    feat_4_title: "Interactive Builder",
    feat_4_desc: "Full freedom to handpick dough, sauces, cheeses, and garden-fresh toppings.",

    // Story
    story_badge: "OUR HERITAGE",
    story_title: "Dedicated To The Authentic Art of Italian Pizza Since 2011",
    story_desc:
      "At Pizza Delivery, we view pizza as an edible masterpiece. Balancing historic Italian heritage with modern precision, each pie is individually stretched by hand and baked over high heat.",
    story_stat_1_num: "15+",
    story_stat_1_txt: "Years Of Heritage",
    story_stat_2_num: "50+",
    story_stat_2_txt: "Artisan Recipes",

    // Featured section
    featured_badge: "CHEF'S SPECIALS",
    featured_title: "Most Loved Handcrafted Pizzas",
    featured_view_all: "View Full Menu",
    featured_loading: "Loading delicious pizzas...",

    // Pizza Card
    card_discount: "Special Offer",
    card_add_cart: "Add To Cart",
    card_adding: "Adding...",

    // Pizza Builder
    builder_badge: "ARTISAN PIZZA BUILDER",
    builder_title: "Craft Your Signature Pizza Step by Step",
    builder_desc: "Choose your artisan crust, signature Italian sauce, rich cheeses, and fresh farm toppings.",
    builder_step: "Step",
    builder_step_1: "Crust & Dough",
    builder_step_2: "Italian Sauce",
    builder_step_3: "Artisan Cheese",
    builder_step_4: "Fresh Toppings",
    builder_pick_single: "(Select 1 option)",
    builder_pick_multi: "(Select multiple options)",
    builder_reset: "Reset",
    builder_loading: "Loading fresh ingredients...",
    builder_empty: "No ingredients found in this category currently.",
    builder_included: "Included",
    builder_prev: "Previous Step",
    builder_next: "Next Step",
    builder_finish: "Complete Pizza & Add To Cart",
    builder_summary_title: "Your Custom Pizza",
    builder_summary_sub: "Real-time recipe combination",
    builder_base_label: "Crust:",
    builder_sauce_label: "Sauce:",
    builder_cheese_label: "Cheese:",
    builder_toppings_label: "Toppings:",
    builder_toppings_none: "No extra toppings",
    builder_not_selected: "Not selected yet",
    builder_total_price: "Total Price:",
    builder_items_count: "items",

    // Menu Page
    menu_badge: "OUR COLLECTION",
    menu_title: "Artisan Italian Pizza Menu",
    menu_desc: "Explore our signature ready-made pizzas or create your own custom masterpiece!",
    menu_builder_btn: "Launch 4-Step Custom Pizza Builder",
    menu_all: "All Pizzas",
    menu_search_ph: "Search pizza by name...",
    menu_not_found: "No pizzas found matching your search",

    // Cart & Checkout
    cart_title: "Shopping Cart",
    cart_items_count: "items",
    cart_sub_desc: "Review your delicious selections and proceed with quick checkout",
    cart_add_more: "Add More Items",
    cart_empty_title: "Your Cart Is Empty",
    cart_empty_desc: "You haven't added any delicious pizzas yet. Check our menu or build your own!",
    cart_browse_menu: "Browse Menu",
    cart_build_pizza: "Build Custom Pizza",
    cart_unit_price: "Unit Price:",
    cart_toppings_prefix: "Ingredients:",
    cart_total_prefix: "Total:",
    cart_checkout_heading: "Delivery & Payment Details",
    cart_order_type_label: "Order Method",
    cart_delivery_home: "Home Delivery",
    cart_carryout_store: "Store Pickup",
    cart_address_label: "Detailed Delivery Address",
    cart_address_ph: "Building, Street name, Apt / Floor...",
    cart_branch_label: "Select Nearest Branch",
    cart_branch_ph: "-- Choose Pickup Branch --",
    cart_phone_label: "Recipient Phone Number",
    cart_subtotal: "Subtotal:",
    cart_delivery_fee: "Delivery Fee:",
    cart_free: "Free",
    cart_total: "Final Total:",
    cart_pay_btn: "Confirm Order & Pay (Razorpay)",
    cart_processing_btn: "Processing Order & Payment...",

    // Order Tracking
    track_title: "Track Order #",
    track_live_badge: "Live Connection Active",
    track_polling_badge: "Periodic Refresh",
    track_created_at: "Order Time:",
    track_status_label: "Current Status:",
    track_progress_label: "Progress:",
    track_contents_title: "Order Items",
    track_delivery_title: "Delivery & Invoice Summary",
    track_amount_paid: "Amount Paid:",
    track_step_1: "Order Received",
    track_step_1_desc: "Your order is confirmed and sent to kitchen",
    track_step_2: "Preparing",
    track_step_2_desc: "Chef is stretching dough and assembling toppings",
    track_step_3: "In The Oven",
    track_step_3_desc: "Pizza is baking in stone oven to crisp perfection",
    track_step_4: "Out For Delivery",
    track_step_4_desc: "Courier is on the way with your piping hot pizza",
    track_step_5: "Delivered",
    track_step_5_desc: "Delivered! Buon Appetito",
    track_loading: "Fetching live tracking details...",
    track_not_found: "Could not find order #",
    track_not_found_desc: "Please ensure the order number is correct or check your account",
    track_back_menu: "Back to Menu",
    track_cancelled: "Order Cancelled",

    // Admin Common & Nav
    admin_title_badge: "ADMIN CONTROL PANEL",
    admin_heading: "Operations & Live Kitchen",
    admin_hub_active: "Live Kitchen Connected",
    admin_hub_reconnecting: "Reconnecting...",
    admin_tab_stats: "KPIs & Dashboard",
    admin_tab_kitchen: "Kitchen & Live Orders",
    admin_tab_inventory: "Inventory & Ingredients",
    admin_tab_pizzas: "Pizza Catalogue (CRUD)",
    admin_tab_branches: "Branches Management",

    // Admin Stats View
    admin_stat_today_rev: "Today's Revenue",
    admin_stat_active_ops: "Continuous Operations",
    admin_stat_month_rev: "Current Month Revenue",
    admin_stat_updated_today: "Updated through today",
    admin_stat_active_orders: "Active Kitchen Orders",
    admin_stat_go_kitchen: "Go to Kitchen Board ➔",
    admin_stat_low_stock: "Low Stock Alerts",
    admin_stat_review_stock: "Review & Supply Stock ➔",
    admin_stat_top_pizzas: "Top 5 Best-Selling Pizzas",
    admin_stat_by_orders: "By number of orders",
    admin_stat_total_orders: "Total Orders:",
    admin_stat_revenue: "Revenue:",
    admin_stat_no_sales: "No sales data recorded yet",
    admin_stat_crit_stock: "Critical Low Stock Alerts",
    admin_stat_all_stock_ok: "✓ All ingredients are well stocked",
    admin_stat_no_shortage: "No raw materials below minimum threshold",
    admin_stat_remaining: "Remaining:",
    admin_stat_category: "Category:",
    admin_stat_min_threshold: "Min Threshold:",
    admin_stat_supply_btn: "Update & Supply Inventory",

    // Admin Kitchen Board
    kitchen_heading: "Live Kitchen Orders Board",
    kitchen_filter_active: "Active Orders",
    kitchen_filter_all: "All Orders",
    kitchen_filter_delivered: "Delivered",
    kitchen_empty: "No orders found in this section currently",
    kitchen_loading: "Loading live orders...",
    kitchen_order_prefix: "Order #",
    kitchen_items_label: "Ordered Items:",
    kitchen_custom_pizza: "🍕 Custom Pizza",
    kitchen_ready_pizza: "Artisan Pizza",
    kitchen_total_label: "Total Amount:",
    kitchen_btn_prep: "Start Preparing (Preparing)",
    kitchen_btn_oven: "In The Oven",
    kitchen_btn_dispatch: "Hand to Courier (Delivery)",
    kitchen_btn_delivered: "Mark Delivered",
    kitchen_btn_cancel: "Cancel Order & Rollback Stock",
    kitchen_status_closed: "Order Completed & Closed",
    kitchen_badge_received: "New / Received",
    kitchen_badge_prep: "Preparing",
    kitchen_badge_oven: "In The Oven",
    kitchen_badge_delivery: "Out For Delivery",
    kitchen_badge_delivered: "Delivered",
    kitchen_badge_cancelled: "Cancelled",

    // Admin Inventory
    inv_heading: "Raw Materials & Ingredients Inventory",
    inv_sub: "Update stock for crusts, sauces, cheeses, and toppings",
    inv_loading: "Loading inventory items...",
    inv_col_id: "ID",
    inv_col_name: "Ingredient Name",
    inv_col_cat: "Category",
    inv_col_price: "Extra Price",
    inv_col_stock: "Current Stock",
    inv_col_actions: "Actions",
    inv_free: "Free",
    inv_unit: "units",
    inv_btn_edit: "Edit Stock",
    inv_modal_title: "Update Ingredient Stock",
    inv_modal_ing: "Ingredient:",
    inv_modal_new_qty: "New Stock Quantity",
    inv_modal_save: "Save Update",
    inv_modal_cancel: "Cancel",
    inv_btn_add: "Add New Ingredient",
    inv_modal_add_title: "Add New Ingredient",
    inv_modal_add_sub: "Create a new raw material or ingredient for the kitchen",
    inv_field_name: "Ingredient Name",
    inv_field_cat: "Category",
    inv_field_unit: "Unit of Measure",
    inv_field_cost: "Cost Price (EGP)",
    inv_field_extra_price: "Extra Price (EGP)",
    inv_field_stock: "Initial Stock Quantity",
    inv_field_min_threshold: "Min Alert Threshold",
    inv_field_max_threshold: "Max Threshold",
    inv_field_is_allergen: "Allergen Warning",
    inv_field_extra_allowed: "Can be added as extra topping",
    inv_btn_submit_add: "Create Ingredient",
    inv_btn_delete: "Delete",
    inv_delete_confirm: "Are you sure you want to delete this ingredient?",
    inv_cat_dough: "Dough / Base",
    inv_cat_sauce: "Sauce",
    inv_cat_cheese: "Cheese",
    inv_cat_veggies: "Vegetables & Toppings",
    inv_cat_meat: "Meat & Proteins",
    inv_unit_gram: "Gram (g)",
    inv_unit_kg: "Kilogram (kg)",
    inv_unit_ml: "Milliliter (ml)",
    inv_unit_liter: "Liter (L)",
    inv_unit_piece: "Piece (pcs)",

    // Auth Pages
    auth_login_title: "Sign In",
    auth_login_sub: "Welcome back! Enjoy freshly crafted artisan pizza",
    auth_email_label: "Email Address",
    auth_pass_label: "Password",
    auth_forgot_pass: "Forgot password?",
    auth_login_btn: "Sign In",
    auth_no_account: "Don't have an account?",
    auth_register_link: "Create New Account",
    auth_reg_title: "Create Account",
    auth_reg_sub: "Join Pizza Delivery for exclusive offers and instant ordering",
    auth_reg_name: "Full Name",
    auth_reg_phone: "Phone Number",
    auth_reg_address: "Delivery Address",
    auth_reg_btn: "Create Account & Send OTP",
    auth_already_have: "Already have an account?",
    auth_otp_title: "Verify Your Email",
    auth_otp_sub: "We sent a 6-digit code to",
    auth_otp_label: "Enter 6-digit code",
    auth_otp_btn: "Verify & Activate Account",
    auth_otp_resend: "Resend Code",
    auth_forgot_title: "Reset Password",
    auth_forgot_sub: "Enter your email to receive a password reset OTP",
    auth_forgot_btn: "Send Reset Code",
    auth_new_pass_label: "New Password",
    auth_reset_btn: "Change Password & Log In",
    auth_back_login: "Back to Login",

    // Footer
    footer_about: "Authentic Italian pizzas hand-stretched with passion, baked in stone deck ovens, and delivered piping hot within minutes.",
    footer_quick_links: "Quick Navigation",
    footer_menu: "Menu Collection",
    footer_builder: "Custom Pizza Builder",
    footer_cart: "Shopping Cart",
    footer_account: "Account & Profile",
    footer_contact_title: "Contact Us",
    footer_address: "Downtown Branch, Cairo, Egypt",
    footer_hours_title: "Opening Hours",
    footer_hours_week: "Sat - Thu:",
    footer_hours_week_time: "10:00 AM - 02:00 AM",
    footer_hours_fri: "Friday:",
    footer_hours_fri_time: "01:00 PM - 03:00 AM",
    footer_rights: "All Rights Reserved. Handcrafted with",
    footer_for_lovers: "for true pizza lovers",
  },
  ar: {
    // Brand & Nav
    brand_sub: "طعم أصيل وتوصيل لحظي ساخن",
    nav_home: "الرئيسية",
    nav_menu: "قائمة الطعام",
    nav_builder: "باني البيتزا (Custom)",
    nav_admin: "لوحة الإدارة والمطبخ",
    nav_login: "تسجيل الدخول",
    nav_register: "إنشاء حساب",
    nav_orders: "طلباتي",
    nav_welcome: "مرحباً",
    nav_logout: "تسجيل الخروج",

    // Hero
    hero_badge: "أسرع توصيل بيتزا إيطالية طازجة في مصر",
    hero_title_1: "استمتع بأشهى",
    hero_title_accent: "بيتزا إيطالية",
    hero_title_2: "تُخبز بحب وإتقان",
    hero_desc:
      "تذوق أصالة الطعم الإيطالي مع مكونات طبيعية 100% وعجينة محضرة يومياً ومخبوزة في أفران حجرية لتصلك ساخنة ومقرمشة في أسرع وقت.",
    hero_order_btn: "اطلب من المنيو",
    hero_builder_btn: "اصنع بيتزتك الخاصة",
    hero_watch_btn: "شاهد كيف نُحضرها",
    hero_video_label: "فيديو التحضير",
    hero_video_title: "سر العجينة الإيطالية",

    // Features
    features_subtitle: "مميزاتنا",
    features_title: "لماذا تختار بيتزا ديليفري؟",
    feat_1_title: "طهاة خبراء",
    feat_1_desc: "طهاة محترفون بخبرة سنوات لتحضير كل شريحة بيتزا بشغف وإتقان.",
    feat_2_title: "مكونات طازجة 100%",
    feat_2_desc: "نختار أجود أنواع الجبن الطبيعي والخضروات اليومية الطازجة.",
    feat_3_title: "توصيل سريع وساخن",
    feat_3_desc: "تتبع مسار طلبك لحظياً مع ضمان وصول البيتزا ساخنة ومقرمشة.",
    feat_4_title: "باني مخصص",
    feat_4_desc: "حرية كاملة لاختيار القاعدة، الصلصة، الأجبان والإضافات المفضلة.",

    // Story
    story_badge: "قصتنا",
    story_title: "نقدم لكم فن صناعة البيتزا منذ أكثر من 15 عاماً",
    story_desc:
      "في بيتزا ديليفري، نؤمن بأن كل بيتزا هي عمل فني فريد. ندمج بين أسرار المطبخ الإيطالي التقليدي والتقنيات الحديثة لتقديم تجربة طعام استثنائية لا تُنسى في كل طلب.",
    story_stat_1_num: "15+",
    story_stat_1_txt: "عاماً من الخبرة",
    story_stat_2_num: "50+",
    story_stat_2_txt: "وصفة بيتزا مبتكرة",

    // Featured section
    featured_badge: "الأكثر طلباً",
    featured_title: "أشهى خيارات البيتزا المميزة",
    featured_view_all: "عرض القائمة الكاملة",
    featured_loading: "جاري تحميل الأصناف...",

    // Pizza Card
    card_discount: "خصم خاص",
    card_add_cart: "أضف للسلة",
    card_adding: "جاري الإضافة...",

    // Pizza Builder
    builder_badge: "باني البيتزا المبتكر",
    builder_title: "اصنع بيتزا أحلامك خطوة بخطوة",
    builder_desc: "اختر نوع العجينة، والصلصة، وتوليفة الأجبان، والخضروات المفضلة لديك وسنقوم بخبزها خصيصاً لك!",
    builder_step: "الخطوة",
    builder_step_1: "العجينة والقاعدة",
    builder_step_2: "الصلصة الإيطالية",
    builder_step_3: "الجبن الفاخر",
    builder_step_4: "الخضروات والإضافات",
    builder_pick_single: "(اختر نوع واحد)",
    builder_pick_multi: "(يمكنك اختيار أكثر من صنف)",
    builder_reset: "إعادة الضبط",
    builder_loading: "جاري تحميل المكونات الطازجة...",
    builder_empty: "لا توجد مكونات مسجلة في هذا القسم حالياً.",
    builder_included: "مشمول مجاناً",
    builder_prev: "الخطوة السابقة",
    builder_next: "الخطوة التالية",
    builder_finish: "إتمام البيتزا وإضافتها للسلة",
    builder_summary_title: "بيتزتك المخصصة",
    builder_summary_sub: "تجميع لحظي للمكونات المختارة",
    builder_base_label: "القاعدة:",
    builder_sauce_label: "الصلصة:",
    builder_cheese_label: "الجبن:",
    builder_toppings_label: "الخضروات:",
    builder_toppings_none: "بدون إضافات خضار",
    builder_not_selected: "لم تحدد بعد",
    builder_total_price: "السعر الإجمالي:",
    builder_items_count: "أصناف",

    // Menu Page
    menu_badge: "قائمتنا اللذيذة",
    menu_title: "أشهى أطباق البيتزا الإيطالية",
    menu_desc: "تصفح تشكيلتنا المميزة من البيتزا الجاهزة أو اصنع وصفتك الخاصة بالطريقة التي تحبها!",
    menu_builder_btn: "تجربة باني البيتزا المخصص (4 خطوات)",
    menu_all: "جميع الأصناف",
    menu_search_ph: "ابحث عن بيتزا...",
    menu_not_found: "لم يتم العثور على بيتزا مطابقة للبحث",

    // Cart & Checkout
    cart_title: "سلة الطلبات",
    cart_items_count: "عناصر",
    cart_sub_desc: "راجع طلباتك وأكمل عملية الدفع بكل سهولة",
    cart_add_more: "إضافة المزيد",
    cart_empty_title: "سلة المشتريات فارغة",
    cart_empty_desc: "لم تقم بإضافة أي بيتزا بعد. تفضل بزيارة المنيو أو اصنع بيتزتك الخاصة!",
    cart_browse_menu: "تصفح المنيو",
    cart_build_pizza: "اصنع بيتزا مخصصة",
    cart_unit_price: "سعر الحبة:",
    cart_toppings_prefix: "الإضافات:",
    cart_total_prefix: "الإجمالي:",
    cart_checkout_heading: "بيانات التوصيل والدفع",
    cart_order_type_label: "طريقة استلام الطلب",
    cart_delivery_home: "توصيل منزلي",
    cart_carryout_store: "استلام من الفرع",
    cart_address_label: "عنوان التوصيل بالتفصيل",
    cart_address_ph: "رقم العقار، اسم الشارع، المنطقة، رقم الشقة...",
    cart_branch_label: "اختر أقرب فرع للاستلام",
    cart_branch_ph: "-- اضغط لاختيار الفرع --",
    cart_phone_label: "رقم هاتف المستلم",
    cart_subtotal: "المجموع الفرعي:",
    cart_delivery_fee: "رسوم التوصيل:",
    cart_free: "مجاناً",
    cart_total: "المجموع الكلي:",
    cart_pay_btn: "تأكيد الطلب والدفع (Razorpay)",
    cart_processing_btn: "جاري معالجة الطلب والدفع...",

    // Order Tracking
    track_title: "تتبع الطلب #",
    track_live_badge: "اتصال لحظي نشط (Live)",
    track_polling_badge: "تحديث دوري",
    track_created_at: "وقت إنشاء الطلب:",
    track_status_label: "الحالة الحالية:",
    track_progress_label: "نسبة الإنجاز:",
    track_contents_title: "محتويات هذا الطلب",
    track_delivery_title: "معلومات التوصيل والفاتورة",
    track_amount_paid: "المبلغ المدفوع:",
    track_step_1: "تم استلام الطلب",
    track_step_1_desc: "تم تأكيد طلبك وإرساله للمطبخ بنجاح",
    track_step_2: "جاري التحضير",
    track_step_2_desc: "الشيف يقوم بفرد العجينة وتجهيز المكونات",
    track_step_3: "في الفرن الآن",
    track_step_3_desc: "البيتزا تُخبز على الحجر لتصبح هشة ومقرمشة",
    track_step_4: "خرج للتوصيل",
    track_step_4_desc: "المندوب في طريقه إليك بالبيتزا الساخنة",
    track_step_5: "تم التوصيل بنجاح",
    track_step_5_desc: "بالهناء والشفاء! نتمنى لك وجبة شهية",
    track_loading: "جاري جلب تفاصيل التتبع الحي للطلب...",
    track_not_found: "لم نتمكن من العثور على الطلب #",
    track_not_found_desc: "يرجى التأكد من صحة رقم الطلب أو مراجعة حسابك",
    track_back_menu: "العودة للمنيو",
    track_cancelled: "تم إلغاء الطلب",

    // Admin Common & Nav
    admin_title_badge: "لوحة تحكم الإدارة",
    admin_heading: "إدارة العمليات والمطبخ المباشر",
    admin_hub_active: "اتصال المطبخ الحي نشط",
    admin_hub_reconnecting: "جاري إعادة الاتصال",
    admin_tab_stats: "لوحة المؤشرات والإحصائيات",
    admin_tab_kitchen: "شاشة المطبخ والطلبات الحية",
    admin_tab_inventory: "إدارة المخزون والمكونات",
    admin_tab_pizzas: "قائمة البيتزا (CRUD)",
    admin_tab_branches: "إدارة الفروع وتفعيلها",

    // Admin Stats View
    admin_stat_today_rev: "مبيعات اليوم",
    admin_stat_active_ops: "نشاط تشغيلي متواصل",
    admin_stat_month_rev: "إيرادات الشهر الحالي",
    admin_stat_updated_today: "محدث حتى اليوم",
    admin_stat_active_orders: "الطلبات النشطة بالمطبخ",
    admin_stat_go_kitchen: "الانتقال لشاشة المطبخ ➔",
    admin_stat_low_stock: "تنبيهات نواقص المخزن",
    admin_stat_review_stock: "مراجعة وتوريد النواقص ➔",
    admin_stat_top_pizzas: "أفضل 5 أصناف بيتزا مبيعاً",
    admin_stat_by_orders: "حسب عدد الطلبات",
    admin_stat_total_orders: "إجمالي الطلبات:",
    admin_stat_revenue: "الإيراد:",
    admin_stat_no_sales: "لا توجد بيانات مبيعات مسجلة حتى الآن",
    admin_stat_crit_stock: "نواقص المخزن الحرجة",
    admin_stat_all_stock_ok: "✓ جميع المكونات متوفرة بنسب ممتازة",
    admin_stat_no_shortage: "لا توجد خامات أقل من الحد الأدنى",
    admin_stat_remaining: "متبقي:",
    admin_stat_category: "الفئة:",
    admin_stat_min_threshold: "الحد الأدنى:",
    admin_stat_supply_btn: "تعديل وتوريد رصيد المكونات",

    // Admin Kitchen Board
    kitchen_heading: "لوحة طلبات المطبخ الحية",
    kitchen_filter_active: "الطلبات النشطة بالمطبخ",
    kitchen_filter_all: "كافة الطلبات",
    kitchen_filter_delivered: "المكتملة",
    kitchen_empty: "لا توجد طلبات في هذا القسم حالياً",
    kitchen_loading: "جاري تحميل الطلبات الحية...",
    kitchen_order_prefix: "طلب #",
    kitchen_items_label: "الأصناف المطلوبة:",
    kitchen_custom_pizza: "🍕 بيتزا مخصصة",
    kitchen_ready_pizza: "بيتزا جاهزة",
    kitchen_total_label: "المبلغ الإجمالي:",
    kitchen_btn_prep: "بدء التحضير (Preparing)",
    kitchen_btn_oven: "في الفرن (In The Oven)",
    kitchen_btn_dispatch: "تسليم للمندوب (Delivery)",
    kitchen_btn_delivered: "تم التوصيل للعميل (Delivered)",
    kitchen_btn_cancel: "إلغاء الطلب واسترجاع المخزون",
    kitchen_status_closed: "الطلب مغلق ومكتمل",
    kitchen_badge_received: "جديد / استلام",
    kitchen_badge_prep: "جاري التحضير",
    kitchen_badge_oven: "في الفرن الحجري",
    kitchen_badge_delivery: "مع مندوب التوصيل",
    kitchen_badge_delivered: "تم التسليم",
    kitchen_badge_cancelled: "ملغي",

    // Admin Inventory
    inv_heading: "إدارة مخزون المكونات والخامات",
    inv_sub: "تعديل وتوريد أرصدة العجائن، الصلصات، الأجبان، والخضروات لضبط توفر البيتزا",
    inv_loading: "جاري تحميل عناصر المخزون...",
    inv_col_id: "كود",
    inv_col_name: "اسم المكون",
    inv_col_cat: "التصنيف",
    inv_col_price: "السعر الإضافي",
    inv_col_stock: "الرصيد الحالي بالمخزن",
    inv_col_actions: "الإجراءات",
    inv_free: "مجاني",
    inv_unit: "وحدة",
    inv_btn_edit: "تعديل الرصيد",
    inv_modal_title: "تحديث رصيد المكون",
    inv_modal_ing: "المكون:",
    inv_modal_new_qty: "الكمية الجديدة بالمخزن",
    inv_modal_save: "حفظ التعديل",
    inv_modal_cancel: "إلغاء",
    inv_btn_add: "إضافة مكون جديد",
    inv_modal_add_title: "إضافة مادة خام / مكون جديد",
    inv_modal_add_sub: "إضافة صنف جديد للمخزون واستخدامه في تحضير البيتزا والمكونات المخصصة",
    inv_field_name: "اسم المكون",
    inv_field_cat: "الفئة / القسم",
    inv_field_unit: "وحدة القياس",
    inv_field_cost: "سعر التكلفة (ج.م)",
    inv_field_extra_price: "سعر الإضافة (ج.م)",
    inv_field_stock: "الرصيد الافتتاحي بالمخزن",
    inv_field_min_threshold: "حد النواقص والتنبيه",
    inv_field_max_threshold: "الحد الأقصى للتخزين",
    inv_field_is_allergen: "يسبب حساسية (Allergen)",
    inv_field_extra_allowed: "متاح كإضافة إضافية (Extra)",
    inv_btn_submit_add: "إضافة المكون للمخزن",
    inv_btn_delete: "حذف",
    inv_delete_confirm: "هل أنت متأكد من حذف هذا المكون من المخزون؟",
    inv_cat_dough: "عجينة / قاعدة البيتزا",
    inv_cat_sauce: "صلصات",
    inv_cat_cheese: "أجبان",
    inv_cat_veggies: "خضار وإضافات",
    inv_cat_meat: "لحوم ودواجن",
    inv_unit_gram: "جرام (g)",
    inv_unit_kg: "كيلوجرام (kg)",
    inv_unit_ml: "ملليلتر (ml)",
    inv_unit_liter: "لتر (L)",
    inv_unit_piece: "قطعة (pcs)",

    // Auth Pages
    auth_login_title: "تسجيل الدخول",
    auth_login_sub: "أهلاً بعودتك! استمتع بأشهى أطباق البيتزا الطازجة",
    auth_email_label: "البريد الإلكتروني",
    auth_pass_label: "كلمة المرور",
    auth_forgot_pass: "نسيت كلمة المرور؟",
    auth_login_btn: "تسجيل الدخول",
    auth_no_account: "ليس لديك حساب؟",
    auth_register_link: "إنشاء حساب جديد",
    auth_reg_title: "إنشاء حساب جديد",
    auth_reg_sub: "انضم إلى بيتزا ديليفري واستمتع بتجربة طلب فورية وعروض حصرية",
    auth_reg_name: "الاسم بالكامل",
    auth_reg_phone: "رقم الهاتف",
    auth_reg_address: "عنوان التوصيل المعتاد",
    auth_reg_btn: "إنشاء الحساب واستلام رمز التحقق",
    auth_already_have: "لديك حساب بالفعل؟",
    auth_otp_title: "تفعيل الحساب بالرمز السري",
    auth_otp_sub: "أدخل الرمز المكون من 6 أرقام المرسل إلى",
    auth_otp_label: "رمز التحقق (OTP)",
    auth_otp_btn: "تأكيد وتفعيل الحساب",
    auth_otp_resend: "إعادة إرسال الرمز",
    auth_forgot_title: "استعادة كلمة المرور",
    auth_forgot_sub: "أدخل بريدك الإلكتروني وسنرسل لك رمز OTP لتغيير كلمة المرور",
    auth_forgot_btn: "إرسال رمز الاستعادة",
    auth_new_pass_label: "كلمة المرور الجديدة",
    auth_reset_btn: "تغيير كلمة المرور والدخول",
    auth_back_login: "العودة لتسجيل الدخول",

    // Footer
    footer_about: "نقدم لكم أشهى وألذ أنواع البيتزا الإيطالية الطازجة، المحضرة بعناية من أفضل المكونات الطبيعية والمخبوزة في أفران حجرية لتصلكم ساخنة ولذيذة في دقائق.",
    footer_quick_links: "روابط سريعة",
    footer_menu: "قائمة البيتزا الجاهزة",
    footer_builder: "اصنع بيتزتك المخصصة (Custom Builder)",
    footer_cart: "سلة الطلبات",
    footer_account: "تسجيل الدخول / الحساب",
    footer_contact_title: "تواصل معنا",
    footer_address: "فرع وسط البلد، القاهرة، مصر",
    footer_hours_title: "مواعيد العمل",
    footer_hours_week: "السبت - الخميس:",
    footer_hours_week_time: "10:00 صباحاً - 02:00 بعد منتصف الليل",
    footer_hours_fri: "الجمعة:",
    footer_hours_fri_time: "01:00 ظهراً - 03:00 بعد منتصف الليل",
    footer_rights: "جميع الحقوق محفوظة. صنع بكل",
    footer_for_lovers: "لعشاق البيتزا",
  },
};

import { formatPrice as formatPriceUtil } from "./utils";

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
  isRtl: false,
  formatPrice: (price: number) => `${price} EGP`,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_lang") as Language;
    if (saved && (saved === "en" || saved === "ar")) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    } else {
      setLanguageState("en");
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const t = (key: string): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  const isRtl = language === "ar";
  const formatPrice = (price: number) => formatPriceUtil(price, language);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t, isRtl, formatPrice }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
