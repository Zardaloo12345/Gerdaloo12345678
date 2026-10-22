// ============================================
// گردآلو - Gerdaloo AI v6.0 (Layout Fixed)
// ============================================

const chatArea = document.getElementById('chatArea');
const chatMessages = document.getElementById('chatMessages');
const welcomeHeader = document.getElementById('welcomeHeader');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// ============================================
// پایگاه دانش
// ============================================
const ANSWERS = {
  intro: "سایت زردآلو یک بازار آنلاین برای خرید و فروش کالاست. شعارش «با زردآلو خرید راحته!» است و توسط عرفان ریاحی ساخته شده. 🍑",
  creator: "سازنده و مالک سایت زردآلو، عرفان ریاحی است. 🧑🏻‍💻",
  link: "آدرس سایت زردآلو: https://zardaloo12345.github.io/zardaloo.online.shop/ 🌍",
  profile: "برای استفاده از زردآلو، اول باید پروفایل خودت را بسازی: نام، شماره تماس و شماره زردآلو. 👤",
  market: "بخش «بازار زردآلو» محل خرید و فروش کالاست. 🛒",
  product: "برای ثبت کالای جدید، از بخش «ثبت کالای جدید» در منو استفاده کن. 📦",
  cart: "سبد خریدت فعلاً خالی است. 🛍️",
  messenger: "بخش «پیام‌رسان» زردآلو برای ارتباط با فروشندگان یا خریداران است. 💬",
  report: "بخش «گزارش فروشنده» آمار تعداد کالا، ارزش کل و بازدید کل را نشان می‌دهد. 📊",
  free: "سایت زردآلو رایگان است. 🆓",
  thanks: "از این عزیزان تشکر شده: شهاب‌الدین ریاحی، دکتر عباس امیدی، آقای زارعی، کوشان طلائی، ملیحه همت‌گیر، سپهر میر قادری، سید ابوالفضل صمصام شریعت، محمد پارسا آیتی، محمد طاها نیرومند، آقای قاسمی، کیان عسگری، مانی شیروی. 🙏",
  self: "من گردآلو هستم، دستیار هوشمند و آفلاین سایت زردآلو. 🍑",
  greeting: "سلام! چطور می‌تونم کمکت کنم؟ 😊",
  bye: "خداحافظ! بازم بیا پیشم 👋",
  default: "متأسفم، هنوز درباره این موضوع چیزی یاد نگرفته‌ام. 🍑"
};

const WORDS = {
  subjects: ["زردآلو", "سایت", "بازار", "فروشگاه", "پلتفرم", "وبسایت", "سامانه", "سیستم", "اپلیکیشن", "برنامه"],
  actions: ["چیه", "چیست", "چه کار می‌کند", "چطور کار می‌کند", "چه امکاناتی دارد", "چه کاربردی دارد", "به چه درد می‌خورد", "چه مزیتی دارد", "چه ویژگی دارد", "چگونه کار می‌کند"],
  features: ["پروفایل", "بازار", "ثبت کالا", "سبد خرید", "پیام‌رسان", "گزارش فروشنده", "مدیریت کالاها", "ثبت‌نام", "ورود", "خرید", "فروش", "پرداخت", "ارسال", "تحویل", "جستجو", "فیلتر", "دسته‌بندی", "قیمت", "تخفیف", "گارانتی"],
  featureActions: ["چیه", "چیست", "چطور کار می‌کند", "چه کار می‌کند", "چه امکاناتی دارد", "چگونه استفاده کنم", "کجا پیدا کنم", "چه مزیتی دارد", "چه مشکلی دارد", "چطور تنظیم کنم"],
  people: ["عرفان ریاحی", "شهاب‌الدین ریاحی", "دکتر عباس امیدی", "آقای زارعی", "کوشان طلائی", "ملیحه همت‌گیر", "سپهر میر قادری", "سید ابوالفضل صمصام شریعت", "محمد پارسا آیتی", "محمد طاها نیرومند", "آقای قاسمی", "کیان عسگری", "مانی شیروی"],
  peopleQuestions: ["کیست", "چه کسی است", "چه نقشی دارد", "چه کاره است", "چه می‌کند", "کجاست", "چه مهارتی دارد", "چه تخصصی دارد", "چه پروژه‌ای دارد", "چه سابقه‌ای دارد"],
  general: ["آدرس", "لینک", "گیت‌هاب", "github", "نسخه", "آپدیت", "به‌روزرسانی", "امنیت", "حریم خصوصی", "قوانین", "شرایط", "پشتیبانی", "تماس", "ارتباط", "سوال", "پاسخ", "راهنما", "آموزش", "کمک", "دمو", "نمونه", "تست", "رایگان", "هزینه", "پرداخت", "زبان", "فارسی", "موبایل", "اپلیکیشن", "باگ", "خطا", "مشکل", "عیب", "مزیت", "ویژگی", "قابلیت", "امکانات"],
  generalQuestions: ["چیه", "چیست", "کجاست", "چطور", "چگونه", "چه زمانی", "چه کسی", "چرا", "آیا", "چه"]
};

const KNOWLEDGE = [];
const seen = new Set();

function add(keyword, answer) {
  const k = keyword.trim().toLowerCase();
  if (!seen.has(k) && k.length > 0) {
    seen.add(k);
    KNOWLEDGE.push({ keywords: [k], answer });
  }
}

function buildKnowledgeBase() {
  for (const s of WORDS.subjects) for (const a of WORDS.actions) add(`${s} ${a}`, ANSWERS.intro);
  for (const f of WORDS.features) for (const fa of WORDS.featureActions) {
    let ans = ANSWERS.default;
    if (/پروفایل|ثبت‌نام|ورود/.test(f)) ans = ANSWERS.profile;
    if (/بازار|خرید|فروش|قیمت|تخفیف|پرداخت|ارسال|تحویل|گارانتی/.test(f)) ans = ANSWERS.market;
    if (/ثبت کالا|مدیریت|دسته‌بندی|جستجو|فیلتر/.test(f)) ans = ANSWERS.product;
    if (/سبد/.test(f)) ans = ANSWERS.cart;
    if (/پیام/.test(f)) ans = ANSWERS.messenger;
    if (/گزارش/.test(f)) ans = ANSWERS.report;
    add(`${f} ${fa}`, ans);
  }
  for (const p of WORDS.people) for (const q of WORDS.peopleQuestions) {
    add(`${p} ${q}`, p === "عرفان ریاحی" ? ANSWERS.creator : ANSWERS.thanks);
  }
  for (const g of WORDS.general) for (const gq of WORDS.generalQuestions) {
    let ans = ANSWERS.default;
    if (/آدرس|لینک|گیت|github/.test(g)) ans = ANSWERS.link;
    if (/رایگان|هزینه|پرداخت/.test(g)) ans = ANSWERS.free;
    if (/مزیت|ویژگی|قابلیت|امکانات/.test(g)) ans = ANSWERS.intro;
    add(`${g} ${gq}`, ans);
  }
  for (const s of WORDS.subjects) for (const f of WORDS.features) {
    let ans = ANSWERS.default;
    if (/پروفایل/.test(f)) ans = ANSWERS.profile;
    if (/بازار|خرید|فروش/.test(f)) ans = ANSWERS.market;
    if (/ثبت کالا|مدیریت/.test(f)) ans = ANSWERS.product;
    if (/پیام/.test(f)) ans = ANSWERS.messenger;
    if (/گزارش/.test(f)) ans = ANSWERS.report;
    add(`${s} ${f}`, ans);
  }
  for (const f of WORDS.features) for (const s of WORDS.subjects) {
    let ans = ANSWERS.default;
    if (/پروفایل/.test(f)) ans = ANSWERS.profile;
    if (/بازار|خرید|فروش/.test(f)) ans = ANSWERS.market;
    if (/ثبت کالا|مدیریت/.test(f)) ans = ANSWERS.product;
    if (/پیام/.test(f)) ans = ANSWERS.messenger;
    if (/گزارش/.test(f)) ans = ANSWERS.report;
    add(`${f} ${s}`, ans);
  }
  for (const s of WORDS.subjects) for (const p of WORDS.people) {
    add(`${s} ${p}`, p === "عرفان ریاحی" ? ANSWERS.creator : ANSWERS.thanks);
  }
  for (const p of WORDS.people) for (const s of WORDS.subjects) {
    add(`${p} ${s}`, p === "عرفان ریاحی" ? ANSWERS.creator : ANSWERS.thanks);
  }