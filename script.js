// ============================================
// گردآلو - Gerdaloo AI v3.0
// ============================================

const onboarding = document.getElementById('onboarding');
const app = document.getElementById('app');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const nextStep1 = document.getElementById('nextStep1');
const nextStep2 = document.getElementById('nextStep2');
const backStep2 = document.getElementById('backStep2');
const backStep3 = document.getElementById('backStep3');
const zardalooNumber = document.getElementById('zardalooNumber');
const userEmail = document.getElementById('userEmail');
const progressSteps = document.querySelectorAll('.progress-step');

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
const brandBtn = document.getElementById('brandBtn');
const newChatBtn = document.getElementById('newChatBtn');
const memoryCount = document.getElementById('memoryCount');
const displayUserName = document.getElementById('displayUserName');
const displayUserPlan = document.getElementById('displayUserPlan');

const settingsModal = document.getElementById('settingsModal');
const openSettings = document.getElementById('openSettings');
const closeSettings = document.getElementById('closeSettings');
const settingTheme = document.getElementById('settingTheme');
const settingVoice = document.getElementById('settingVoice');
const settingZardaloo = document.getElementById('settingZardaloo');
const settingEmail = document.getElementById('settingEmail');
const clearMemory = document.getElementById('clearMemory');

const MEMORY_KEY = 'gerdaloo_memory_v4';

function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY)) || {
      facts: [],
      history: [],
      profile: { zardaloo: '', email: '', hasProduct: null, loginMethod: null }
    };
  } catch {
    return { facts: [], history: [], profile: { zardaloo: '', email: '', hasProduct: null, loginMethod: null } };
  }
}

function saveMemory() {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

let memory = loadMemory();
memoryCount.textContent = memory.facts.length;

// ===== ثبت‌نام =====
let currentStep = 1;

function showStep(step) {
  currentStep = step;
  step1.classList.remove('active');
  step2.classList.remove('active');
  step3.classList.remove('active');
  if (step === 1) step1.classList.add('active');
  if (step === 2) step2.classList.add('active');
  if (step === 3) step3.classList.add('active');
  progressSteps.forEach((el, i) => el.classList.toggle('active', i < step));
}

nextStep1.addEventListener('click', () => {
  const num = zardalooNumber.value.trim();
  if (!num) {
    zardalooNumber.focus();
    zardalooNumber.style.borderColor = '#ef4444';
    return;
  }
  zardalooNumber.style.borderColor = '';
  memory.profile.zardaloo = num;
  saveMemory();
  showStep(2);
});

backStep2.addEventListener('click', () => showStep(1));

nextStep2.addEventListener('click', () => {
  const email = userEmail.value.trim();
  if (!email || !email.includes('@')) {
    userEmail.focus();
    userEmail.style.borderColor = '#ef4444';
    return;
  }
  userEmail.style.borderColor = '';
  memory.profile.email = email;
  saveMemory();
  showStep(3);
});

backStep3.addEventListener('click', () => showStep(2));

document.querySelectorAll('input[name="hasProduct"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    memory.profile.hasProduct = e.target.value;
    saveMemory();
  });
});

function completeOnboarding(method) {
  memory.profile.loginMethod = method;
  saveMemory();
  onboarding.style.display = 'none';
  app.style.display = 'flex';
  displayUserName.textContent = memory.profile.zardaloo || 'zardaloo12345';
  displayUserPlan.textContent = `ورود با ${method}`;
  settingZardaloo.textContent = memory.profile.zardaloo || '---';
  settingEmail.textContent = memory.profile.email || '---';
  userInput.focus();
}

document.getElementById('loginGoogle').addEventListener('click', () => completeOnboarding('گوگل'));
document.getElementById('loginDeepSeek').addEventListener('click', () => completeOnboarding('دیپ‌سیک'));
document.getElementById('loginZardaloo').addEventListener('click', () => completeOnboarding('زردآلو'));

// ===== پایگاه دانش =====
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

// ===== صدا =====
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
  } catch (e) {}
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove('recording');
}

// ===== چت =====
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
  if (!voiceEnabled) window.speechSynthesis.cancel();
  settingVoice.classList.toggle('active', voiceEnabled);
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  settingTheme.classList.toggle('active');
});

settingTheme.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  settingTheme.classList.toggle('active');
});

settingVoice.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  settingVoice.classList.toggle('active', voiceEnabled);
  voiceToggle.classList.toggle('off', !voiceEnabled);
  if (!voiceEnabled) window.speechSynthesis.cancel();
});

// کلیک روی آرم زردآلو = باز/بسته کردن پنل
brandBtn.addEventListener('click', () => {
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('collapsed');
  }
});

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

menuBtn.addEventListener('click', () => sidebar.classList.add('open'));

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
  sidebar.classList.remove('open');
});

openSettings.addEventListener('click', () => {
  settingZardaloo.textContent = memory.profile.zardaloo || '---';
  settingEmail.textContent = memory.profile.email || '---';
  settingTheme.classList.toggle('active', document.body.classList.contains('light-mode'));
  settingVoice.classList.toggle('active', voiceEnabled);
  settingsModal.classList.add('open');
});

closeSettings.addEventListener('click', () => settingsModal.classList.remove('open'));
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) settingsModal.classList.remove('open');
});

clearMemory.addEventListener('click', () => {
  if (confirm('همه خاطرات و تاریخچه پاک شود؟')) {
    memory.facts = [];
    memory.history = [];
    saveMemory();
    memoryCount.textContent = '0';
    chatMessages.innerHTML = `
      <div class="welcome">
        <div class="welcome-icon">🍑</div>
        <h1>چطور می‌تونم کمکت کنم؟</h1>
        <p>دستیار هوشمند سایت زردآلو</p>
      </div>
    `;
    alert('حافظه پاک شد ✅');
  }
});

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// ===== شروع =====
if (memory.profile.loginMethod) {
  onboarding.style.display = 'none';
  app.style.display = 'flex';
  displayUserName.textContent = memory.profile.zardaloo || 'zardaloo12345';
  displayUserPlan.textContent = `ورود با ${memory.profile.loginMethod}`;
  settingZardaloo.textContent = memory.profile.zardaloo || '---';
  settingEmail.textContent = memory.profile.email || '---';
  userInput.focus();
} else {
  showStep(1);
}

console.log('🍑 گردآلو v3.0 آماده است');