// ============================================
// گردآلو - Gerdaloo AI v2.0
// استریم + Markdown + حافظه + صدا + پایگاه دانش
// ============================================

const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatMessages = document.getElementById('chatMessages');
const memoryCount = document.getElementById('memoryCount');

// ===== حافظه پایدار =====
const MEMORY_KEY = 'gerdaloo_memory';

function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY)) || { facts: [], history: [] };
  } catch {
    return { facts: [], history: [] };
  }
}

function saveMemory(memory) {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

let memory = loadMemory();
memoryCount.textContent = memory.facts.length;

// ===== پایگاه دانش سایت زردآلو =====
const ANSWERS = {
  intro: "سایت زردآلو یک بازار آنلاین برای خرید و فروش کالاست. شعارش «با زردآلو خرید راحته!» است و توسط عرفان ریاحی ساخته شده. 🍑",
  profile: "برای استفاده از زردآلو، اول باید پروفایل خودت را بسازی و اطلاعاتت را کامل کنی: نام، شماره تماس و شماره زردآلو. 👤",
  market: "بخش «بازار زردآلو» محل خرید و فروش کالاست. می‌توانی کالای جدید ثبت کنی یا کالاهای موجود را ببینی و خرید کنی. 🛒",
  product: "برای ثبت کالای جدید، از بخش «ثبت کالای جدید» در منوی زردآلو استفاده کن. نام، توضیحات، قیمت و تصویر کالا را وارد کن. 📦",
  messenger: "بخش «پیام‌رسان» زردآلو برای ارتباط با فروشندگان یا خریداران است. 💬",
  report: "بخش «گزارش فروشنده» آمار تعداد کالا، ارزش کل (تومان) و بازدید کل را نشان می‌دهد. 📊",
  creator: "سازنده و مالک سایت زردآلو، عرفان ریاحی است. 🧑🏻‍💻",
  link: "سایت زردآلو در این آدرس در دسترس است: https://zardaloo12345.github.io/zardaloo.online.shop/ 🌍",
  thanks: "از این عزیزان تشکر شده: شهاب‌الدین ریاحی، دکتر عباس امیدی، آقای زارعی، کوشان طلائی، ملیحه همت‌گیر، سپهر میر قادری، سید ابوالفضل صمصام شریعت، محمد پارسا آیتی، محمد طاها نیرومند، آقای قاسمی، کیان عسگری، مانی شیروی. 🙏",
  free: "سایت زردآلو رایگان است و برای استفاده از آن هزینه‌ای نیاز نیست. 🆓",
  default: "برای اطلاعات بیشتر درباره این موضوع، می‌توانی از پیام‌رسان سایت یا گیت‌هاب پروژه کمک بگیری. 🍑"
};

// ===== جستجو در پایگاه دانش =====
function findSiteAnswer(text) {
  const t = text.trim().toLowerCase();
  if (/زردآلو چیه|سایت زردآلو|بازار آنلاین/.test(t)) return ANSWERS.intro;
  if (/پروفایل|ثبت نام|ثبت‌نام|ورود/.test(t)) return ANSWERS.profile;
  if (/بازار|خرید|فروش|سبد/.test(t)) return ANSWERS.market;
  if (/ثبت کالا|مدیریت کالا|محصول جدید/.test(t)) return ANSWERS.product;
  if (/پیام|چت|گفتگو/.test(t)) return ANSWERS.messenger;
  if (/گزارش|آمار|بازدید/.test(t)) return ANSWERS.report;
  if (/سازنده|عرفان|مالک|مدیر/.test(t)) return ANSWERS.creator;
  if (/آدرس|لینک|گیت|github/.test(t)) return ANSWERS.link;
  if (/تشکر|قدردانی|همکار/.test(t)) return ANSWERS.thanks;
  if (/رایگان|هزینه|پرداخت/.test(t)) return ANSWERS.free;
  return null;
}

// ===== استریم از Ollama =====
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
        { role: 'system', content: `تو گردآلو هستی، دستیار هوشمند و مهربان سایت زردآلو. پاسخ‌ها را به فارسی و با Markdown بنویس.${memoryContext}` },
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

const voiceToggle = document.getElementById('voiceToggle');
const micBtn = document.getElementById('micBtn');

function speak(text) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fa-IR';
  utterance.rate = 0.95;
  const voices = window.speechSynthesis.getVoices();
  const faVoice = voices.find(v => v.lang.startsWith('fa'));
  if (faVoice) utterance.voice = faVoice;
  window.speechSynthesis.speak(utterance);
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.disabled = true;
    micBtn.title = 'مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند';
    return null;
  }

  const rec = new SpeechRecognition();
  rec.lang = 'fa-IR';
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    chatForm.dispatchEvent(new Event('submit'));
  };

  rec.onerror = (event) => {
    console.error('Speech error:', event.error);
    if (event.error === 'not-allowed') {
      addMessage('دسترسی به میکروفن داده نشد. لطفاً اجازه بده. 🎤', 'bot');
    } else if (event.error === 'no-speech') {
      addMessage('صدایی شنیده نشد. دوباره تلاش کن. 🎤', 'bot');
    }
    stopRecording();
  };

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
    userInput.placeholder = 'در حال شنیدن...';
  } catch (e) { console.error(e); }
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove('recording');
  micBtn.textContent = '🎤';
  userInput.placeholder = 'پیامت را بنویس یا میکروفن را بزن...';
}

micBtn.addEventListener('click', () => {
  if (isRecording) {
    if (recognition) recognition.stop();
    stopRecording();
  } else {
    startRecording();
  }
});

voiceToggle.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  voiceToggle.classList.toggle('off', !voiceEnabled);
  voiceToggle.textContent = voiceEnabled ? '🔊' : '🔇';
  if (!voiceEnabled) window.speechSynthesis.cancel();
});

// ===== افزودن پیام =====
function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  const avatar = document.createElement('span');
  avatar.className = 'avatar';
  avatar.textContent = sender === 'bot' ? '🍑' : '🧑';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== رویداد ارسال =====
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  memory.history.push({ role: 'user', content: text });
  saveMemory(memory);
  userInput.value = '';
  userInput.focus();

  // اول: پایگاه دانش محلی
  const siteAnswer = findSiteAnswer(text);
  if (siteAnswer) {
    addMessage(siteAnswer, 'bot');
    speak(siteAnswer);
    memory.history.push({ role: 'assistant', content: siteAnswer });
    saveMemory(memory);
    return;
  }

  // دوم: استریم از Ollama با Markdown
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.innerHTML = `<span class="avatar">🍑</span><div class="bubble"></div>`;
  chatMessages.appendChild(msg);
  const bubble = msg.querySelector('.bubble');

  try {
    const fullReply = await streamOllama(text, (chunk, accumulated) => {
      bubble.innerHTML = marked.parse(accumulated);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
    memory.history.push({ role: 'assistant', content: fullReply });
    saveMemory(memory);
    speak(fullReply.replace(/[#*`]/g, '')); // حذف Markdown قبل از خواندن
  } catch (err) {
    bubble.textContent = 'خطا در اتصال. Ollama را چک کن. 🍑';
  }
});

// ===== سوالات سریع =====
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    userInput.value = chip.dataset.q;
    chatForm.dispatchEvent(new Event('submit'));
  });
});

// ===== آماده‌سازی صدا =====
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

userInput.focus();
console.log('🍑 گردآلو v2.0 آماده است: استریم + Markdown + حافظه + صدا');
