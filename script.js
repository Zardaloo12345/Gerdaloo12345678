// ============================================
// گردآلو - Gerdaloo AI v2.0
// ثبت‌نام چندمرحله‌ای + استریم + Markdown + حافظه + صدا + تنظیمات
// ============================================

// ===== عناصر ثبت‌نام =====
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

// ===== عناصر چت =====
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
const chatHistory = document.getElementById('chatHistory');
const memoryCount = document.getElementById('memoryCount');
const displayUserName = document.getElementById('displayUserName');
const displayUserPlan = document.getElementById('displayUserPlan');

// ===== عناصر تنظیمات =====
const settingsModal = document.getElementById('settingsModal');
const openSettings = document.getElementById('openSettings');
const closeSettings = document.getElementById('closeSettings');
const settingTheme = document.getElementById('settingTheme');
const settingVoice = document.getElementById('settingVoice');
const settingZardaloo = document.getElementById('settingZardaloo');
const settingEmail = document.getElementById('settingEmail');
const clearMemory = document.getElementById('clearMemory');

// ===== حافظه =====
const MEMORY_KEY = 'gerdaloo_memory_v3';

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

// ===== وضعیت ثبت‌نام =====
let currentStep = 1;

function showStep(step) {
  currentStep = step;
  // مخفی کردن همه
  step1.classList.remove('active');
  step2.classList.remove('active');
  step3.classList.remove('active');
  // نمایش مرحله فعلی
  if (step === 1) step1.classList.add('active');
  if (step === 2) step2.classList.add('active');
  if (step === 3) step3.classList.add('active');
  // به‌روزرسانی نوار پیشرفت
  progressSteps.forEach((el, i) => {
    el.classList.toggle('active', i < step);
  });
}

// مرحله ۱ → ۲
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

// مرحله ۲ → ۱
backStep2.addEventListener('click', () => showStep(1));

// مرحله ۲ → ۳
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

// مرحله ۳ → ۲
backStep3.addEventListener('click', () => showStep(2));

// انتخاب رادیو
document.querySelectorAll('input[name="hasProduct"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    memory.profile.hasProduct = e.target.value;
    saveMemory();
  });
});

// ===== ورود =====
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

// ===== سایدبار جمع‌شونده =====
sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// ===== پایگاه دانش =====
const ANSWERS = {
  intro: "سایت زردآلو یک بازار آنلاین برای خرید و فروش کالاست. شعارش «با زردآلو خرید راحته!» است و توسط عرفان ریاحی ساخته شده. 🍑",
  profile: "برای استفاده از زردآلو، اول باید پروفایل خودت را بسازی: نام، شماره تماس و شماره زردآلو. 👤",
  market: "بخش «بازار زردآلو» محل خرید و فروش کالاست. 🛒",
  creator: "سازنده و مالک سایت زردآلو، عرفان ریاحی است. 🧑🏻‍💻",
  link: "آدرس سایت: https://zardaloo12345.github.io/zardaloo.online.shop/ 🌍",
  default: "برای اطلاعات بیشتر از پیام‌رسان سایت یا گیت‌هاب کمک بگیر. 🍑"
};

function findSiteAnswer(text) {
  const t = text.toLowerCase();
  if (/زردآلو چیه|سایت زردآلو|بازار آنلاین/.test(t)) return ANSWERS.intro;
  if (/پروفایل|ثبت نام|ثبت‌نام|ورود/.test(t)) return ANSWERS.profile;
  if (/بازار|خرید|فروش|سبد/.test(t)) return ANSWERS.market;
  if (/سازنده|عرفان|مالک/.test(t)) return ANSWERS.creator;
  if (/آدرس|لینک|گیت|github/.test(t)) return ANSWERS.link;
  return null;
}

// ===== استریم Ollama =====
async function streamOllama(userMessage, onChunk) {
  const memoryContext = memory.facts.length
    ? `\nچیزهایی که درباره کاربر می‌دانی: ${memory.facts.join('، ')}`
    : '';

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3',
      messages: [
        { role: 'system', content: `تو گردآلو هستی، دستیار هوشمند سایت زردآلو. پاسخ‌ها را فارسی و با Markdown بنویس.${memoryContext}` },
        ...memory.history.slice(-10),
        { role: 'user', content: userMessage }
      ],
      stream: true
    })
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n').filter(Boolean)) {
      try {
        const json = JSON.parse(line);
        if (json.message?.content) {
          fullText += json.message.content;
          onChunk(json.message.content, fullText);
        }
      } catch (e) {}
    }
  }
  return fullText;
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
  } catch (e) {}
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove('recording');
}

// ===== پیام‌ها =====
function removeWelcome() {
  const welcome = chatMessages.querySelector('.welcome');
  if (welcome) welcome.remove();
}

function addMessage(text, sender, streaming = false) {
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

  if (streaming) {
    textEl.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  } else if (sender === 'bot') {
    textEl.innerHTML = marked.parse(text);
  } else {
    textEl.textContent = text;
  }

  content.appendChild(role);
  content.appendChild(textEl);
  msg.appendChild(avatar);
  msg.appendChild(content);
  chatMessages.appendChild(msg);
  chatArea.scrollTop = chatArea.scrollHeight;

  return textEl;
}

// ===== ارسال =====
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = '';
  userInput.style.height = 'auto';

  addMessage(text, 'user');
  memory.history.push({ role: 'user', content: text });
  saveMemory();

  const siteAnswer = findSiteAnswer(text);
  if (siteAnswer) {
    addMessage(siteAnswer, 'bot');
    speak(siteAnswer);
    memory.history.push({ role: 'assistant', content: siteAnswer });
    saveMemory();
    return;
  }

  const textEl = addMessage('', 'bot', true);
  sendBtn.disabled = true;

  try {
    const fullReply = await streamOllama(text, (chunk, accumulated) => {
      textEl.innerHTML = marked.parse(accumulated);
      chatArea.scrollTop = chatArea.scrollHeight;
    });
    memory.history.push({ role: 'assistant', content: fullReply });
    saveMemory();
    speak(fullReply);
  } catch (err) {
    textEl.textContent = 'خطا در اتصال. Ollama را چک کن. 🍑';
  } finally {
    sendBtn.disabled = false;
  }
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

// تم تاریک
const savedTheme = localStorage.getItem('gerdaloo_theme');
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.classList.add('off');
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.classList.remove('off');
    settingTheme.classList.remove('active');
    localStorage.setItem('gerdaloo_theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.classList.add('off');
    settingTheme.classList.add('active');
    localStorage.setItem('gerdaloo_theme', 'dark');
  }
}

themeToggle.addEventListener('click', toggleTheme);
settingTheme.addEventListener('click', toggleTheme);

settingVoice.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  settingVoice.classList.toggle('active', voiceEnabled);
  voiceToggle.classList.toggle('off', !voiceEnabled);
  if (!voiceEnabled) window.speechSynthesis.cancel();
});

// سایدبار موبایل
menuBtn.addEventListener('click', () => sidebar.classList.add('open'));

// گفتگوی جدید
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

// تنظیمات
openSettings.addEventListener('click', () => {
  settingZardaloo.textContent = memory.profile.zardaloo || '---';
  settingEmail.textContent = memory.profile.email || '---';
  settingTheme.classList.toggle('active', document.documentElement.getAttribute('data-theme') === 'dark');
  settingVoice.classList.toggle('active', voiceEnabled);
  settingsModal.classList.add('open');
});

closeSettings.addEventListener('click', () => settingsModal.classList.remove('open'));
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) settingsModal.classList.remove('open');
});

// پاک کردن حافظه
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

// ===== آماده‌سازی صدا =====
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// ===== شروع =====
// اگر قبلاً ثبت‌نام کرده، مستقیم برو به اپ
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

console.log('🍑 گردآلو v2.0 — ثبت‌نام چندمرحله‌ای + تنظیمات + سایدبار جمع‌شونده');