// ============================================
// گردآلو - Gerdaloo AI v4.0
// ============================================

const chatArea = document.getElementById('chatArea');
const chatMessages = document.getElementById('chatMessages');
const welcomeHeader = document.getElementById('welcomeHeader');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// ============================================
// موتور ۱۰۰۰+ موضوعی
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
  greeting: "سلام! خوشحالم که باهام حرف می‌زنی 😊",
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
  for (const f of WORDS.features) for (const g of WORDS.general) {
    let ans = ANSWERS.default;
    if (/پروفایل/.test(f)) ans = ANSWERS.profile;
    if (/بازار/.test(f)) ans = ANSWERS.market;
    if (/ثبت کالا/.test(f)) ans = ANSWERS.product;
    if (/پیام/.test(f)) ans = ANSWERS.messenger;
    if (/گزارش/.test(f)) ans = ANSWERS.report;
    if (/آدرس/.test(g)) ans = ANSWERS.link;
    if (/رایگان/.test(g)) ans = ANSWERS.free;
    add(`${f} ${g}`, ans);
  }
  for (const g of WORDS.general) for (const f of WORDS.features) {
    let ans = ANSWERS.default;
    if (/پروفایل/.test(f)) ans = ANSWERS.profile;
    if (/بازار/.test(f)) ans = ANSWERS.market;
    if (/ثبت کالا/.test(f)) ans = ANSWERS.product;
    if (/پیام/.test(f)) ans = ANSWERS.messenger;
    if (/گزارش/.test(f)) ans = ANSWERS.report;
    if (/آدرس/.test(g)) ans = ANSWERS.link;
    if (/رایگان/.test(g)) ans = ANSWERS.free;
    add(`${g} ${f}`, ans);
  }
  for (const p of WORDS.people) for (const g of WORDS.general) {
    let ans = ANSWERS.default;
    if (p === "عرفان ریاحی") ans = ANSWERS.creator;
    if (/آدرس|لینک/.test(g)) ans = ANSWERS.link;
    add(`${p} ${g}`, ans);
  }
  for (const g of WORDS.general) for (const p of WORDS.people) {
    let ans = ANSWERS.default;
    if (p === "عرفان ریاحی") ans = ANSWERS.creator;
    if (/آدرس|لینک/.test(g)) ans = ANSWERS.link;
    add(`${g} ${p}`, ans);
  }
  for (const s of WORDS.subjects) for (const g of WORDS.general) {
    let ans = ANSWERS.default;
    if (/آدرس|لینک/.test(g)) ans = ANSWERS.link;
    if (/رایگان/.test(g)) ans = ANSWERS.free;
    add(`${s} ${g}`, ans);
  }
  for (const g of WORDS.general) for (const s of WORDS.subjects) {
    let ans = ANSWERS.default;
    if (/آدرس|لینک/.test(g)) ans = ANSWERS.link;
    if (/رایگان/.test(g)) ans = ANSWERS.free;
    add(`${g} ${s}`, ans);
  }
  for (const a of WORDS.actions) for (const f of WORDS.features) {
    let ans = ANSWERS.default;
    if (/پروفایل/.test(f)) ans = ANSWERS.profile;
    if (/بازار/.test(f)) ans = ANSWERS.market;
    if (/ثبت کالا/.test(f)) ans = ANSWERS.product;
    if (/پیام/.test(f)) ans = ANSWERS.messenger;
    if (/گزارش/.test(f)) ans = ANSWERS.report;
    add(`${a} ${f}`, ans);
  }
  for (const f of WORDS.features) for (const a of WORDS.actions) {
    let ans = ANSWERS.default;
    if (/پروفایل/.test(f)) ans = ANSWERS.profile;
    if (/بازار/.test(f)) ans = ANSWERS.market;
    if (/ثبت کالا/.test(f)) ans = ANSWERS.product;
    if (/پیام/.test(f)) ans = ANSWERS.messenger;
    if (/گزارش/.test(f)) ans = ANSWERS.report;
    add(`${f} ${a}`, ans);
  }
  for (const s1 of WORDS.subjects) for (const s2 of WORDS.subjects) add(`${s1} ${s2}`, ANSWERS.intro);
  for (const f1 of WORDS.features) for (const f2 of WORDS.features) {
    let ans = ANSWERS.default;
    if (/پروفایل/.test(f1) || /پروفایل/.test(f2)) ans = ANSWERS.profile;
    if (/بازار/.test(f1) || /بازار/.test(f2)) ans = ANSWERS.market;
    if (/ثبت کالا/.test(f1) || /ثبت کالا/.test(f2)) ans = ANSWERS.product;
    if (/پیام/.test(f1) || /پیام/.test(f2)) ans = ANSWERS.messenger;
    if (/گزارش/.test(f1) || /گزارش/.test(f2)) ans = ANSWERS.report;
    add(`${f1} ${f2}`, ans);
  }
  for (const g1 of WORDS.general) for (const g2 of WORDS.general) {
    let ans = ANSWERS.default;
    if (/آدرس/.test(g1) || /آدرس/.test(g2)) ans = ANSWERS.link;
    if (/رایگان/.test(g1) || /رایگان/.test(g2)) ans = ANSWERS.free;
    add(`${g1} ${g2}`, ans);
  }
  
  add("سلام", ANSWERS.greeting);
  add("درود", ANSWERS.greeting);
  add("خوبی", ANSWERS.greeting);
  add("خداحافظ", ANSWERS.bye);
  add("بای", ANSWERS.bye);
  add("گردآلو", ANSWERS.self);
  add("خودت", ANSWERS.self);
  add("تو کی هستی", ANSWERS.self);
  
  add("چت هوشمند", "من می‌تونم به هر سوالی جواب بدم، از موضوعات عمومی تا تخصصی. کافیه بپرسی!");
  add("تولید تصویر", "من می‌تونم تصاویر خلاقانه و حرفه‌ای بسازم. فقط کافیه توصیف کنی که چه تصویری می‌خوای.");
  add("تولید ویدیو", "تولید ویدیو از ایده تا اجرا. من می‌تونم بهت در ساخت ویدیوهای جذاب کمک کنم.");
  add("پژوهش و تحقیق", "من می‌تونم اطلاعات دقیق و معتبر رو برات جمع‌آوری کنم و در پژوهش‌هات کمکت کنم.");
  add("نوشتن متن", "مقاله، داستان، کپشن، ایمیل و هر متن دیگه‌ای که بخوای، برات می‌نویسم.");
  add("برنامه‌نویسی", "من می‌تونم کد بنویسم، باگ‌ها رو رفع کنم و برنامه‌نویسی رو بهت آموزش بدم.");
  add("ترجمه", "من مترجمی سریع و دقیق هستم و می‌تونم به زبان‌های مختلف ترجمه کنم.");
  add("صدا و گفتار", "تبدیل متن به صدا و بالعکس، ساخت پادکست و ... از امکانات منه.");
  add("موسیقی", "من می‌تونم در ساخت آهنگ، تنظیم و نوشتن متن ترانه بهت کمک کنم.");
  add("ابزارها", "من ابزارهای کاربردی زیادی دارم؛ از محاسبات ریاضی تا تبدیل واحدها و...");
  add("امکانات گردآلو", "گردآلو امکانات زیادی داره: چت، تولید تصویر، تولید ویدیو، پژوهش، نوشتن متن، برنامه‌نویسی، ترجمه، صدا، موسیقی و ابزارهای کاربردی!");
}

buildKnowledgeBase();
console.log(`✅ پایگاه دانش گردآلو: ${KNOWLEDGE.length} موضوع`);

function findAnswer(text) {
  const t = text.toLowerCase().trim();
  for (const item of KNOWLEDGE) {
    if (t === item.keywords[0]) return item.answer;
  }
  for (const item of KNOWLEDGE) {
    if (item.keywords.some(k => t.includes(k))) return item.answer;
  }
  return null;
}

// ============================================
// تعامل با چت
// ============================================

function removeWelcome() {
  if (welcomeHeader && !welcomeHeader.classList.contains('hidden')) {
    welcomeHeader.classList.add('hidden');
  }
}

function addMessage(text, sender) {
  removeWelcome();
  
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  if (sender === 'bot') {
    avatar.innerHTML = '<i class="fa-solid fa-leaf" style="color:#f59e0b"></i>';
  } else {
    avatar.textContent = 'Z';
  }

  const content = document.createElement('div');
  content.className = 'msg-content';

  const role = document.createElement('div');
  role.className = 'msg-role';
  role.textContent = sender === 'bot' ? 'گردآلو' : 'شما';

  const textEl = document.createElement('div');
  textEl.className = 'msg-text';
  textEl.innerHTML = text.replace(/\n/g, '<br>');

  content.appendChild(role);
  content.appendChild(textEl);
  msg.appendChild(avatar);
  msg.appendChild(content);
  
  chatMessages.appendChild(msg);
  
  chatArea.scrollTop = chatArea.scrollHeight;
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = '';
  addMessage(text, 'user');

  setTimeout(() => {
    const answer = findAnswer(text) || ANSWERS.default;
    addMessage(answer, 'bot');
  }, 500);
}

// ارسال با دکمه
sendBtn.addEventListener('click', sendMessage);

// ارسال با کلید Enter
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// تابعی که برای تمام دکمه‌های HTML (سایدبار چپ، راست، بنر و کارت‌ها) استفاده می‌شود
function sendSuggestion(event, text) {
  if (event) event.preventDefault();
  userInput.value = text;
  sendMessage();
  
  // تغییر حالت فعال منو (اگر از سایدبار راست کلیک شده باشد)
  if (event && event.currentTarget.classList.contains('menu-item')) {
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
  }
}

// ریست کردن چت (دکمه خانه)
function resetChat(event) {
  if (event) event.preventDefault();
  
  chatMessages.innerHTML = `
    <div class="message bot">
      <div class="msg-avatar"><i class="fa-solid fa-leaf" style="color:#f59e0b"></i></div>
      <div class="msg-content">
        <div class="msg-role">گردآلو</div>
        <div class="msg-text">
          سلام! من گردآلو هستم.<br>
          هر سوالی داری بپرس یا از یکی از امکانات زیر استفاده کن.
        </div>
      </div>
    </div>
  `;
  
  if (welcomeHeader) {
    welcomeHeader.classList.remove('hidden');
  }
  
  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
  
  userInput.focus();
}