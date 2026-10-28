// ====== ساعت زنده ======
setInterval(() => {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('fa-IR');
}, 1000);

// ====== سیستم لاگین ======
document.getElementById('sign-in-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sign-in-btn');
  btn.innerHTML = 'در حال اتصال...';
  btn.disabled = true;

  try {
    const user = await puter.auth.signIn();
    const username = user.username || 'کاربر پرانتز';
    localStorage.setItem('gerdaloo_logged_in', 'true');
    localStorage.setItem('gerdaloo_username', username);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    initApp();
  } catch (error) {
    alert("ورود انجام نشد. دوباره تلاش کنید.");
    btn.innerHTML = 'ورود با حساب کاربری';
    btn.disabled = false;
  }
});

// ====== خروج ======
async function logout() {
  if (!confirm("آیا می‌خواهید خارج شوید؟")) return;
  try { await puter.auth.signOut(); } catch(e) {}
  localStorage.removeItem('gerdaloo_logged_in');
  localStorage.removeItem('gerdaloo_username');
  location.reload();
}

// ====== بررسی وضعیت لاگین در شروع ======
window.onload = async function() {
  if (localStorage.getItem('gerdaloo_logged_in')) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    initApp();
  }
};

// ====== شروع برنامه ======
function initApp() {
  loadSettings();
  const username = localStorage.getItem('gerdaloo_username') || 'کاربر';
  document.getElementById('user-display').textContent = username;
  if (chats.length === 0) startNewChat();
  else loadChat(chats[0].id);
}

// ====== متغیرهای اصلی ======
const chatContainer = document.getElementById('chat');
const welcomeScreen = document.getElementById('welcome-screen');
const input = document.getElementById('i');
const sendBtn = document.getElementById('send');
const historyList = document.getElementById('history-list');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

let chats = JSON.parse(localStorage.getItem('gerdaloo_history')) || [];
let currentChatId = null;
let recognition = null;
let isRecording = false;

// ====== تنظیمات ======
function openSettings() { document.getElementById('settings-modal').style.display = 'flex'; }
function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; }

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('gerdaloo_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

function applyCustomColors() {
  const cUser = document.getElementById('color-user').value;
  const cBot = document.getElementById('color-bot').value;
  const cFont = document.getElementById('color-font').value;
  localStorage.setItem('gerdaloo_color_user', cUser);
  localStorage.setItem('gerdaloo_color_bot', cBot);
  localStorage.setItem('gerdaloo_color_font', cFont);
  document.documentElement.style.setProperty('--user-msg-bg', cUser);
  document.documentElement.style.setProperty('--bot-msg-bg', cBot);
  document.documentElement.style.setProperty('--bot-msg-text', cFont);
}

function changeLanguage() {
  localStorage.setItem('gerdaloo_lang', document.getElementById('lang-select').value);
}

function loadSettings() {
  if (localStorage.getItem('gerdaloo_theme') === 'light') document.body.classList.add('light-mode');
  const cUser = localStorage.getItem('gerdaloo_color_user') || '#1e40af';
  const cBot = localStorage.getItem('gerdaloo_color_bot') || '#ffffff';
  const cFont = localStorage.getItem('gerdaloo_color_font') || '#0f172a';
  document.getElementById('color-user').value = cUser;
  document.getElementById('color-bot').value = cBot;
  document.getElementById('color-font').value = cFont;
  document.documentElement.style.setProperty('--user-msg-bg', cUser);
  document.documentElement.style.setProperty('--bot-msg-bg', cBot);
  document.documentElement.style.setProperty('--bot-msg-text', cFont);

  const lang = localStorage.getItem('gerdaloo_lang') || 'fa';
  document.getElementById('lang-select').value = lang;
}

// ====== مدیریت تاریخچه و نوار کناری ======
function toggleSidebar() {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  if (sidebar.classList.contains('open')) renderHistory();
}

function startNewChat() {
  currentChatId = Date.now().toString();
  const newChat = { id: currentChatId, title: 'گفتگوی جدید', messages: [] };
  chats.unshift(newChat);
  saveChats();
  welcomeScreen.style.display = 'flex';
  chatContainer.style.display = 'none';
  chatContainer.innerHTML = '';
  toggleSidebar();
}

function loadChat(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  currentChatId = chatId;
  
  if (chat.messages.length > 0) {
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    chatContainer.innerHTML = '';
    chat.messages.forEach(m => {
      if (m.role === 'user') chatContainer.innerHTML += `<div class="msg user">${m.content}</div>`;
      else if (m.role === 'assistant') chatContainer.innerHTML += `<div class="msg bot">${marked.parse(m.content)}</div>`;
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } else {
    welcomeScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
  }
  toggleSidebar();
}

function deleteChat(chatId, event) {
  event.stopPropagation();
  if (!confirm('آیا از حذف این چت مطمئن هستید؟')) return;
  chats = chats.filter(c => c.id !== chatId);
  saveChats();
  if (currentChatId === chatId) {
    if (chats.length > 0) loadChat(chats[0].id);
    else startNewChat();
  } else renderHistory();
}

function saveChats() { localStorage.setItem('gerdaloo_history', JSON.stringify(chats)); }

function renderHistory() {
  historyList.innerHTML = '';
  if (chats.length === 0) {
    historyList.innerHTML = '<div style="text-align:center; color:var(--text-muted); font-size:13px; margin-top:20px;">هنوز چتی نداری</div>';
    return;
  }
  chats.forEach(chat => {
    const div = document.createElement('div');
    div.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
    const userMsg = chat.messages.find(m => m.role === 'user');
    const title = userMsg ? userMsg.content.substring(0, 25) + (userMsg.content.length > 25 ? '...' : '') : 'گفتگوی جدید';
    div.innerHTML = `<span class="history-title">${title}</span><button class="delete-chat-btn" onclick="deleteChat('${chat.id}', event)">🗑️</button>`;
    div.onclick = () => loadChat(chat.id);
    historyList.appendChild(div);
  });
}

// ====== میکروفن ======
function toggleRecording() {
  const micBtn = document.getElementById('mic-btn');
  if (isRecording) { if (recognition) recognition.stop(); return; }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { alert("مرورگر شما از میکروفن پشتیبانی نمی‌کند."); return; }
  
  recognition = new SpeechRecognition();
  recognition.lang = 'fa-IR';
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onstart = () => { isRecording = true; micBtn.style.color = "#ef4444"; input.placeholder = "در حال شنیدن..."; };
  recognition.onresult = (event) => { input.value = event.results[0][0].transcript; sendMessage(); };
  recognition.onerror = () => { isRecording = false; micBtn.style.color = ""; input.placeholder = "پیامت رو اینجا بنویس..."; };
  recognition.onend = () => { isRecording = false; micBtn.style.color = ""; input.placeholder = "پیامت رو اینجا بنویس..."; };
  recognition.start();
}

// ====== ارسال پیام ======
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  if (!currentChatId) startNewChat();
  welcomeScreen.style.display = 'none';
  chatContainer.style.display = 'flex';

  const currentChat = chats.find(c => c.id === currentChatId);
  if (!currentChat) return;

  // تشخیص هویت سازنده
  if (text.includes("عرفان ریاحی") || text.includes("عرفان ریاحي")) {
    const creatorMsg = "سلام جناب عرفان ریاحی! 👑\n\nمن شما را به عنوان **سازنده و خالق خودم** شناختم. این یک افتخار بزرگ برای من است که با شما صحبت می‌کنم.";
    chatContainer.innerHTML += `<div class="msg user">${text}</div>`;
    input.value = '';
    setTimeout(() => {
      chatContainer.innerHTML += `<div class="msg bot" style="border: 2px solid gold;">${marked.parse(creatorMsg)}</div>`;
      currentChat.messages.push({ role: "user", content: text });
      currentChat.messages.push({ role: "assistant", content: creatorMsg });
      saveChats();
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 600);
    return;
  }

  const lang = localStorage.getItem('gerdaloo_lang') || 'fa';
  const langMap = { fa: "فارسی", en: "English" };

  const systemPrompt = {
    role: "system",
    content: `تو "پرانتز" هستی، یک دستیار هوشمند. تو توسط "عرفان ریاحی" طراحی شده‌ای. زبان پاسخ‌دهی: ${langMap[lang]}.`
  };

  chatContainer.innerHTML += `<div class="msg user">${text}</div>`;
  input.value = '';
  
  const messagesToSend = [systemPrompt, ...currentChat.messages, { role: "user", content: text }];
  currentChat.messages.push({ role: "user", content: text });
  
  if (currentChat.title === 'گفتگوی جدید') {
    currentChat.title = text.substring(0, 30);
    renderHistory();
  }
  saveChats();

  sendBtn.disabled = true;
  const botMsgDiv = document.createElement('div');
  botMsgDiv.className = 'msg bot';
  botMsgDiv.innerHTML = '<span style="color: var(--accent);">در حال پردازش...</span>';
  chatContainer.appendChild(botMsgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    // ⚡ استفاده از مدل سریع و رایگان StepFun
    const response = await puter.ai.chat(messagesToSend, { 
        model: "stepfun/step-3.5-flash:free", 
        stream: true 
    });
    
    botMsgDiv.innerHTML = '';
    let fullReply = '';
    
    for await (const part of response) {
      if (part?.text) {
        fullReply += part.text;
        botMsgDiv.innerHTML = marked.parse(fullReply); 
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
    
    currentChat.messages.push({ role: "assistant", content: fullReply });
    saveChats();
  } catch (error) {
    console.error("Error details:", error);
    botMsgDiv.innerHTML = '⚠️ خطا در پردازش. لطفاً دوباره تلاش کنید یا اتصال خود را بررسی کنید.';
  } finally {
    sendBtn.disabled = false;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// ====== ارسال با Enter ======
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
});