// ============================================
// گردآلو - Gerdaloo AI v3.0 (Offline 1000+ Topics)
// بدون API، بدون Ollama — پایگاه دانش ۱۰۰۰+ موضوعی
// ============================================

const chatMessages = document.getElementById('chatMessages');
const chatArea = document.getElementById('chatArea');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const voiceToggle = document.getElementById('voiceToggle');
const themeToggle = document.getElementById('themeToggle');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const newChatBtn = document.getElementById('newChatBtn');
const memoryCount = document.getElementById('memoryCount');

// ===== حافظه =====
const MEMORY_KEY = 'gerdaloo_memory_offline_v3';
let memory = JSON.parse(localStorage.getItem(MEMORY_KEY)) || { facts: [], history: [] };
memoryCount.textContent = memory.facts.length;

function saveMemory() {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

// ============================================
// پایگاه دانش: پاسخ‌های پایه
// ============================================
const ANSWERS = {
  intro: "سایت زردآلو یک بازار آنلاین برای خرید و فروش کالاست. شعارش «با زردآلو خرید راحته!» است و توسط عرفان ریاحی ساخته شده. 🍑",
  creator: "سازنده و مالک سایت زردآلو، عرفان ریاحی است. 🧑🏻‍💻",
  link: "آدرس سایت زردآلو: https://zardaloo12345.github.io/zardaloo.online.shop/ 🌍",
  profile: "برای استفاده از زردآلو، اول باید پروفایل خودت را بسازی: نام، شماره تماس و شماره زردآلو. 👤",
  market: "بخش «بازار زردآلو» محل خرید و فروش کالاست. می‌توانی کالای جدید ثبت کنی یا کالاهای موجود را ببینی. 🛒",
  product: "برای ثبت کالای جدید، از بخش «ثبت کالای جدید» در منو استفاده کن. نام، توضیحات، قیمت و تصویر کالا را وارد کن. 📦",
  cart: "سبد خریدت فعلاً خالی است. بعد از انتخاب کالاها از بازار، آن‌ها را به سبد اضافه کن. 🛍️",
  messenger: "بخش «پیام‌رسان» زردآلو برای ارتباط با فروشندگان یا خریداران است. 💬",
  report: "بخش «گزارش فروشنده» آمار تعداد کالا، ارزش کل (تومان) و بازدید کل را نشان می‌دهد. 📊",
  free: "سایت زردآلو رایگان است و برای استفاده از آن هزینه‌ای نیاز نیست. 🆓",
  thanks: "از این عزیزان تشکر شده: شهاب‌الدین ریاحی، دکتر عباس امیدی، آقای زارعی، کوشان طلائی، ملیحه همت‌گیر، سپهر میر قادری، سید ابوالفضل صمصام شریعت، محمد پارسا آیتی، محمد طاها نیرومند، آقای قاسمی، کیان عسگری، مانی شیروی. 🙏",
  self: "من گردآلو هستم، دستیار هوشمند و آفلاین سایت زردآلو. می‌تونم درباره سایت زردآلو بهت اطلاعات بدم. 🍑",
  greeting: "سلام! خوشحالم که باهام حرف می‌زنی 😊 چه کمکی می‌تونم بکنم؟",
  bye: "خداحافظ! بازم بیا پیشم 👋",
  default: "متأسفم، هنوز درباره این موضوع چیزی یاد نگرفته‌ام. می‌تونی درباره سایت زردآلو، بازار، پروفایل یا ثبت کالا ازم بپرسی. 🍑"
};

// ============================================
// کلمات کلیدی پایه (ترکیب‌ها)
// ============================================
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

// ============================================
// تولید پایگاه دانش ۱۰۰۰+ موضوعی
// ============================================
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
  // ۱. subjects × actions (۱۰ × ۱۰ = ۱۰۰)
  for (const s of WORDS.subjects) {
    for (const a of WORDS.actions) {
      add(`${s} ${a}`, ANSWERS.intro);
    }
  }

  // ۲. features × featureActions (۲۰ × ۱۰ = ۲۰۰)
  for (const f of WORDS.features) {
    for (const fa of WORDS.featureActions) {
      let ans = ANSWERS.default;
      if (/پروفایل|ثبت‌نام|ورود/.test(f)) ans = ANSWERS.profile;
      if (/بازار|خرید|فروش|قیمت|تخفیف|پرداخت|ارسال|تحویل|گارانتی/.test(f)) ans = ANSWERS.market;
      if (/ثبت کالا|مدیریت|دسته‌بندی|جستجو|فیلتر/.test(f)) ans = ANSWERS.product;
      if (/سبد/.test(f)) ans = ANSWERS.cart;
      if (/پیام/.test(f)) ans = ANSWERS.messenger;
      if (/گزارش/.test(f)) ans = ANSWERS.report;
      add(`${f} ${fa}`, ans);
    }
  }

  // ۳. people × peopleQuestions (۱۳ × ۱۰ = ۱۳۰)
  for (const p of WORDS.people) {
    for (const q of WORDS.peopleQuestions) {
      const ans = p === "عرفان ریاحی" ? ANSWERS.creator : ANSWERS.thanks;
      add(`${p} ${q}`, ans);
    }
  }

  // ۴. general × generalQuestions (۳۸ × ۱۰ = ۳۸۰)
  for (const g of WORDS.general) {
    for (const gq of WORDS.generalQuestions) {
      let ans = ANSWERS.default;
      if (/آدرس|لینک|گیت|github/.test(g)) ans = ANSWERS.link;
      if (/امنیت|حریم|قوانین|شرایط/.test(g)) ans = ANSWERS.default;
      if (/پشتیبانی|تماس|ارتباط|سوال|پاسخ|راهنما|آموزش|کمک/.test(g)) ans = ANSWERS.default;
      if (/دمو|نمونه|تست/.test(g)) ans = ANSWERS.intro;
      if (/رایگان|هزینه|پرداخت/.test(g)) ans = ANSWERS.free;
      if (/زبان|فارسی/.test(g)) ans = ANSWERS.default;
      if (/موبایل|اپلیکیشن/.test(g)) ans = ANSWERS.intro;
      if (/نسخه|آپدیت|به‌روزرسانی/.test(g)) ans = ANSWERS.default;
      if (/باگ|خطا|مشکل|عیب/.test(g)) ans = ANSWERS.default;
      if (/مزیت|ویژگی|قابلیت|امکانات/.test(g)) ans = ANSWERS.intro;
      add(`${g} ${gq}`, ans);
    }
  }

  // ۵. subjects × features (۱۰ × ۲۰ = ۲۰۰)
  for (const s of WORDS.subjects) {
    for (const f of WORDS.features) {
      let ans = ANSWERS.default;
      if (/پروفایل/.test(f)) ans = ANSWERS.profile;
      if (/بازار|خرید|فروش/.test(f)) ans = ANSWERS.market;
      if (/ثبت کالا|مدیریت/.test(f)) ans = ANSWERS.product;
      if (/پیام/.test(f)) ans = ANSWERS.messenger;
      if (/گزارش/.test(f)) ans = ANSWERS.report;
      add(`${s} ${f}`, ans);
    }
  }

  // ۶. features × subjects (۲۰ × ۱۰ = ۲۰۰)
  for (const f of WORDS.features) {
    for (const s of WORDS.subjects) {
      let ans = ANSWERS.default;
      if (/پروفایل/.test(f)) ans = ANSWERS.profile;
      if (/بازار|خرید|فروش/.test(f)) ans = ANSWERS.market;
      if (/ثبت کالا|مدیریت/.test(f)) ans = ANSWERS.product;
      if (/پیام/.test(f)) ans = ANSWERS.messenger;
      if (/گزارش/.test(f)) ans = ANSWERS.report;
      add(`${f} ${s}`, ans);
    }
  }

  // ۷. subjects × people (۱۰ × ۱۳ = ۱۳۰)
  for (const s of WORDS.subjects) {
    for (const p of WORDS.people) {
      const ans = p === "عرفان ریاحی" ? ANSWERS.creator : ANSWERS.thanks;
      add(`${s} ${p}`, ans);
    }
  }

  // ۸. people × subjects (۱۳ × ۱۰ = ۱۳۰)
  for (const p of WORDS.people) {
    for (const s of WORDS.subjects) {
      const ans = p === "عرفان ریاحی" ? ANSWERS.creator : ANSWERS.thanks;
      add(`${p} ${s}`, ans);
    }
  }

  // ۹. features × general (۲۰ × ۳۸ = ۷۶۰)
  for (const f of WORDS.features) {
    for (const g of WORDS.general) {
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
  }

  // ۱۰. general × features (۳۸ × ۲۰ = ۷۶۰)
  for (const g of WORDS.general) {
    for (const f of WORDS.features) {
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
  }

  // ۱۱. people × general (۱۳ × ۳۸ = ۴۹۴)
  for (const p of WORDS.people) {
    for (const g of WORDS.general) {
      let ans = ANSWERS.default;
      if (p === "عرفان ریاحی") ans = ANSWERS.creator;
      if (/آدرس|لینک/.test(g)) ans = ANSWERS.link;
      add(`${p} ${g}`, ans);
    }
  }

  // ۱۲. general × people (۳۸ × ۱۳ = ۴۹۴)
  for (const g of WORDS.general) {
    for (const p of WORDS.people) {
      let ans = ANSWERS.default;
      if (p === "عرفان ریاحی") ans = ANSWERS.creator;
      if (/آدرس|لینک/.test(g)) ans = ANSWERS.link;
      add(`${g} ${p}`, ans);
    }
  }

  // ۱۳. subjects × general (۱۰ × ۳۸ = ۳۸۰)
  for (const s of WORDS.subjects) {
    for (const g of WORDS.general) {
      let ans = ANSWERS.default;
      if (/آدرس|لینک/.test(g)) ans = ANSWERS.link;
      if (/رایگان/.test(g)) ans = ANSWERS.free;
      add(`${s} ${g}`, ans);
    }
  }

  // ۱۴. general × subjects (۳۸ × ۱۰ = ۳۸۰)
  for (const g of WORDS.general) {
    for (const s of WORDS.subjects) {
      let ans = ANSWERS.default;
      if (/آدرس|لینک/.test(g)) ans = ANSWERS.link;
      if (/رایگان/.test(g)) ans = ANSWERS.free;
      add(`${g} ${s}`, ans);
    }
  }

  // ۱۵. actions × features (۱۰ × ۲۰ = ۲۰۰)
  for (const a of WORDS.actions) {
    for (const f of WORDS.features) {
      let ans = ANSWERS.default;
      if (/پروفایل/.test(f)) ans = ANSWERS.profile;
      if (/بازار/.test(f)) ans = ANSWERS.market;
      if (/ثبت کالا/.test(f)) ans = ANSWERS.product;
      if (/پیام/.test(f)) ans = ANSWERS.messenger;
      if (/گزارش/.test(f)) ans = ANSWERS.report;
      add(`${a} ${f}`, ans);
    }
  }

  // ۱۶. features × actions (۲۰ × ۱۰ = ۲۰۰)
  for (const f of WORDS.features) {
    for (const a of WORDS.actions) {
      let ans = ANSWERS.default;
      if (/پروفایل/.test(f)) ans = ANSWERS.profile;
      if (/بازار/.test(f)) ans = ANSWERS.market;
      if (/ثبت کالا/.test(f)) ans = ANSWERS.product;
      if (/پیام/.test(f)) ans = ANSWERS.messenger;
      if (/گزارش/.test(f)) ans = ANSWERS.report;
      add(`${f} ${a}`, ans);
    }
  }

  // ۱۷. subjects × subjects (۱۰ × ۱۰ = ۱۰۰)
  for (const s1 of WORDS.subjects) {
    for (const s2 of WORDS.subjects) {
      add(`${s1} ${s2}`, ANSWERS.intro);
    }
  }

  // ۱۸. features × features (۲۰ × ۲۰ = ۴۰۰)
  for (const f1 of WORDS.features) {
    for (const f2 of WORDS.features) {
      let ans = ANSWERS.default;
      if (/پروفایل/.test(f1) || /پروفایل/.test(f2)) ans = ANSWERS.profile;
      if (/بازار/.test(f1) || /بازار/.test(f2)) ans = ANSWERS.market;
      if (/ثبت کالا/.test(f1) || /ثبت کالا/.test(f2)) ans = ANSWERS.product;
      if (/پیام/.test(f1) || /پیام/.test(f2)) ans = ANSWERS.messenger;
      if (/گزارش/.test(f1) || /گزارش/.test(f2)) ans = ANSWERS.report;
      add(`${f1} ${f2}`, ans);
    }
  }

  // ۱۹. general × general (۳۸ × ۳۸ = ۱۴۴۴)
  for (const g1 of WORDS.general) {
    for (const g2 of WORDS.general) {
      let ans = ANSWERS.default;
      if (/آدرس/.test(g1) || /آدرس/.test(g2)) ans = ANSWERS.link;
      if (/رایگان/.test(g1) || /رایگان/.test(g2)) ans = ANSWERS.free;
      if (/مزیت|ویژگی/.test(g1) || /مزیت|ویژگی/.test(g2)) ans = ANSWERS.intro;
      add(`${g1} ${g2}`, ans);
    }
  }

  // ۲۰. subjects × peopleQuestions (۱۰ × ۱۰ = ۱۰۰)
  for (const s of WORDS.subjects) {
    for (const q of WORDS.peopleQuestions) {
      add(`${s} ${q}`, ANSWERS.default);
    }
  }

  // ۲۱. greeting و bye
  add("سلام", ANSWERS.greeting);
  add("درود", ANSWERS.greeting);
  add("خوبی", ANSWERS.greeting);
  add("خداحافظ", ANSWERS.bye);
  add("بای", ANSWERS.bye);
  add("گردآلو", ANSWERS.self);
  add("خودت", ANSWERS.self);
  add("تو کی هستی", ANSWERS.self);
}

buildKnowledgeBase();
console.log(`✅ پایگاه دانش گردآلو ساخته شد: ${KNOWLEDGE.length} موضوع`);

// ===== جستجو در پایگاه دانش =====
function findAnswer(text) {
  const t = text.toLowerCase().trim();
  // اول تطبیق دقیق
  for (const item of KNOWLEDGE) {
    if (t === item.keywords[0]) return item.answer;
  }
  // بعد تطبیق جزئی (کلیدواژه در متن)
  for (const item of KNOWLEDGE) {
    if (item.keywords.some(k => t.includes(k))) return item.answer;
  }
  return null;
}

// ===== بخش صوتی =====
let voiceEnabled = true;
let isRecording = false;
let recognition = null;

function speak(text) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ''));
  utterance.lang = 'fa-IR';
  utterance.rate = 0.95;
  const voices = window.speechSynthesis.getVoices();
  const faVoice = voices.find(v => v.lang.startsWith('fa'));
  if (faVoice) utterance.voice = faVoice;
  window.speechSynthesis.speak(utterance);
}

function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { micBtn.disabled = true; return null; }
  const rec = new SR();
  rec.lang = 'fa-IR';
  rec.continuous = false;
  rec.interimResults = false;
  rec.onresult = (event) => {
    userInput.value = event.results[0][0].transcript;
    sendMessage();
  };
  rec.onerror = () => stopRecording();
  rec.onend = () => stopRecording();
  return rec;
}

function startRecording() {
  if (!recognition) recognition = initSpeechRecognition();
  if (!recognition) return;
  try {
    recognition.start();
    isRecording = true;
    micBtn.classList.add('recording');
    micBtn.textContent = '⏹️';
  } catch (e) {}
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove('recording');
  micBtn.textContent = '🎤';
}

// ===== پیام‌ها =====
function removeWelcome() {
  const w = chatMessages.querySelector('.welcome');
  if (w) w.remove();
}

function addMessage(text, sender) {
  removeWelcome();
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = sender === 'bot' ? '🍑' : 'Z';

  const content = document.createElement('div');
  content.className = 'message-content';

  const role = document.createElement('div');
  role.className = 'message-role';
  role.textContent = sender === 'bot' ? 'گردآلو' : 'شما';

  const textEl = document.createElement('div');
  textEl.className = 'message-text';
  textEl.textContent = text;

  content.appendChild(role);
  content.appendChild(textEl);
  msg.appendChild(avatar);
  msg.appendChild(content);
  chatMessages.appendChild(msg);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ===== ارسال =====
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = '';
  userInput.style.height = 'auto';

  addMessage(text, 'user');
  memory.history.push({ role: 'user', content: text });

  const answer = findAnswer(text) || ANSWERS.default;

  setTimeout(() => {
    addMessage(answer, 'bot');
    speak(answer);
    memory.history.push({ role: 'assistant', content: answer });
    saveMemory();
  }, 400);
}

// ===== رویدادها =====
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
});

micBtn.addEventListener('click', () => {
  if (isRecording) { if (recognition) recognition.stop(); stopRecording(); }
  else startRecording();
});

voiceToggle.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  voiceToggle.classList.toggle('off', !voiceEnabled);
  voiceToggle.textContent = voiceEnabled ? '🔊' : '🔇';
  if (!voiceEnabled) window.speechSynthesis.cancel();
});

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
});

newChatBtn.addEventListener('click', () => {
  chatMessages.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">🍑</div>
      <h1>چطور می‌تونم کمکت کنم؟</h1>
      <p>دستیار هوشمند سایت زردآلو</p>
    </div>
  `;
  memory.history = [];
  saveMemory();
});

userInput.focus();
console.log('🍑 گردآلو v3.0 (Offline 1000+ Topics) آماده است');