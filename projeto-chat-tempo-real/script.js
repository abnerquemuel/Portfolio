const nameForm = document.querySelector("#nameForm");
const nameInput = document.querySelector("#nameInput");
const identityPanel = document.querySelector("#identityPanel");
const messagesEl = document.querySelector("#messages");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const sendButton = messageForm.querySelector("button");
const clearButton = document.querySelector("#clearChat");

const channel = new BroadcastChannel("portfolio-chat");
const storageKey = "portfolio-chat-messages";
const userId = crypto.randomUUID();

let userName = localStorage.getItem("portfolio-chat-name") || "";
let messages = loadMessages();

const botUserId = "portfolio-chat-bot";
const botName = "Bot";

function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function saveMessages() {
  localStorage.setItem(storageKey, JSON.stringify(messages.slice(-80)));
}

function formatTime(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function createMessageElement(message) {
  const article = document.createElement("article");
  article.className = `message${message.userId === userId ? " sent" : ""}`;

  const meta = document.createElement("span");
  meta.className = "message-meta";
  meta.textContent = `${message.name} - ${formatTime(new Date(message.createdAt))}`;

  const text = document.createElement("p");
  text.className = "message-text";
  text.textContent = message.text;

  article.append(meta, text);
  return article;
}

function renderMessages() {
  messagesEl.replaceChildren(...messages.map(createMessageElement));
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function enableChat(name) {
  userName = name.trim();
  localStorage.setItem("portfolio-chat-name", userName);
  identityPanel.style.display = "none";
  messageInput.disabled = false;
  sendButton.disabled = false;
  messageInput.focus();
}

function sendMessage(text) {
  const message = {
    id: crypto.randomUUID(),
    userId,
    name: userName,
    text,
    createdAt: new Date().toISOString()
  };

  messages.push(message);
  saveMessages();
  renderMessages();
  channel.postMessage({ type: "message", message });
  scheduleBotReply(text);
}

function getLocalBotReply(text) {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("oi") || normalized.includes("ola")) {
    return `Oi, ${userName}! Como posso ajudar hoje?`;
  }

  if (normalized.includes("tudo bem")) {
    return "Tudo certo por aqui. E com voce?";
  }

  if (normalized.includes("calculadora")) {
    return "A calculadora ja esta no seu portfolio. Ficou um bom primeiro projeto.";
  }

  if (normalized.includes("portfolio")) {
    return "Seu portfolio esta ganhando projetos bem legais. Continue adicionando exemplos praticos.";
  }

  if (normalized.includes("obrigado") || normalized.includes("valeu")) {
    return "De nada! Estou por aqui.";
  }

  return null;
}

async function searchWikipedia(text) {
  const searchUrl = new URL("https://pt.wikipedia.org/w/api.php");
  searchUrl.search = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    origin: "*",
    srsearch: text
  });

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) return null;

  const searchData = await searchResponse.json();
  const title = searchData.query?.search?.[0]?.title;
  if (!title) return null;

  const summaryUrl = new URL("https://pt.wikipedia.org/w/api.php");
  summaryUrl.search = new URLSearchParams({
    action: "query",
    exintro: "1",
    explaintext: "1",
    format: "json",
    inprop: "url",
    origin: "*",
    prop: "extracts|info",
    redirects: "1",
    titles: title
  });

  const summaryResponse = await fetch(summaryUrl);
  if (!summaryResponse.ok) return null;

  const summaryData = await summaryResponse.json();
  const pages = Object.values(summaryData.query?.pages || {});
  const page = pages.find((item) => item.extract);
  if (!page) return null;

  const extract = page.extract.length > 520
    ? `${page.extract.slice(0, 520).replace(/\s+\S*$/, "")}...`
    : page.extract;

  return `${extract}\n\nFonte: Wikipedia - ${page.fullurl}`;
}

async function getBotReply(text) {
  const localReply = getLocalBotReply(text);
  if (localReply) return localReply;

  try {
    const internetReply = await searchWikipedia(text);
    if (internetReply) return internetReply;
  } catch {
    return "Tentei pesquisar na internet, mas nao consegui buscar a resposta agora.";
  }

  return "Pesquisei, mas nao encontrei uma resposta confiavel para essa pergunta.";
}

function scheduleBotReply(text) {
  window.setTimeout(async () => {
    const replyText = await getBotReply(text);
    const reply = {
      id: crypto.randomUUID(),
      userId: botUserId,
      name: botName,
      text: replyText,
      createdAt: new Date().toISOString()
    };

    messages.push(reply);
    saveMessages();
    renderMessages();
    channel.postMessage({ type: "message", message: reply });
  }, 700);
}

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!nameInput.value.trim()) return;
  enableChat(nameInput.value);
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !userName) return;

  sendMessage(text);
  messageInput.value = "";
});

clearButton.addEventListener("click", () => {
  messages = [];
  saveMessages();
  renderMessages();
  channel.postMessage({ type: "clear" });
});

channel.addEventListener("message", (event) => {
  if (event.data.type === "clear") {
    messages = [];
    renderMessages();
    return;
  }

  if (event.data.type === "message") {
    const exists = messages.some((message) => message.id === event.data.message.id);
    if (!exists) {
      messages.push(event.data.message);
      saveMessages();
      renderMessages();
    }
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === storageKey) {
    messages = loadMessages();
    renderMessages();
  }
});

if (userName) {
  nameInput.value = userName;
  enableChat(userName);
}

renderMessages();
