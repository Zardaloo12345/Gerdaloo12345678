// ============================================
// گردآلو - Gerdaloo AI v2.0
// دیزاین ChatGPT-like + استریم + Markdown + حافظه + صدا
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
const sidebarClose = document.getElementById('sidebarClose');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');
const memoryCount = document.getElementById('memoryCount');

// ===== حافظه =====
const MEMORY_KEY = 'gerdaloo_memory_v2';

function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY)) || { facts: [], history: [], conversations: [] };
  } catch {
    return { facts: [], history: [], conversations: [] };
  }
}

function saveMemory() {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

let memory = loadMemory();
memoryCount.textContent = memory.facts.length;

// ===== پایگاه دانش زردآلو =====
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
  if (!SR) {
    micBtn.disabled = true;
    return null;
  }

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

  // پایگاه دانش محلی
  const siteAnswer = findSiteAnswer(text);
  if (siteAnswer) {
    addMessage(siteAnswer, 'bot');
    speak(siteAnswer);
    memory.history.push({ role: 'assistant', content: siteAnswer });
    saveMemory();
    return;
  }

  // استریم Ollama
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

// تم تاریک
const savedTheme = localStorage.getItem('gerdaloo_theme');
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
    localStorage.setItem('gerdaloo_theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
    localStorage.setItem('gerdaloo_theme', 'dark');
  }
});

// سایدبار موبایل
menuBtn.addEventListener('click', () => sidebar.classList.add('open'));
sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));

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

// ===== آماده‌سازی صدا =====
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

userInput.focus();
console.log('🍑 گردآلو v2.0 — دیزاین ChatGPT-like آماده شد');