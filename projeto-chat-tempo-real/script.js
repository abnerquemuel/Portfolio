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
const contextKey = "portfolio-chat-context";
const aiEndpointKey = "portfolio-chat-ai-endpoint";
const userId = crypto.randomUUID();

let userName = localStorage.getItem("portfolio-chat-name") || "";
let messages = loadMessages();
let chatContext = loadContext();

const botUserId = "portfolio-chat-bot";
const botName = "Assistente";

function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function loadContext() {
  try {
    return JSON.parse(localStorage.getItem(contextKey)) || null;
  } catch {
    return null;
  }
}

function saveContext(context) {
  chatContext = context;
  localStorage.setItem(contextKey, JSON.stringify(context));
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

function getAiEndpoint() {
  return localStorage.getItem(aiEndpointKey) || window.CHAT_AI_ENDPOINT || "";
}

function getConversationHistory() {
  return messages.slice(-10).map((message) => ({
    role: message.userId === botUserId ? "assistant" : "user",
    content: message.text
  }));
}

async function getAiReply(text) {
  const endpoint = getAiEndpoint();
  if (!endpoint) return null;

  const aiResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: text,
      history: getConversationHistory()
    })
  });

  const data = await aiResponse.json();

  if (!aiResponse.ok) {
    throw new Error(data.error || "Erro ao chamar IA.");
  }

  return data.answer || null;
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getLocalBotReply(text) {
  const normalized = normalizeText(text);

  if (/\b(oi|ola|bom dia|boa tarde|boa noite)\b/.test(normalized)) {
    return `Oi, ${userName}! Como posso ajudar hoje?`;
  }

  if (normalized.includes("tudo bem")) {
    return "Tudo certo por aqui. E com voce?";
  }

  if (
    normalized.includes("meu projeto de calculadora") ||
    normalized.includes("projeto calculadora") ||
    normalized.includes("minha calculadora")
  ) {
    return "A calculadora ja esta no seu portfolio. Ficou um bom primeiro projeto.";
  }

  if (
    normalized.includes("meu portfolio") ||
    normalized.includes("meu portifolio") ||
    normalized.includes("seu portfolio") ||
    normalized.includes("seu portifolio")
  ) {
    return "Seu portfolio esta ganhando projetos bem legais. Continue adicionando exemplos praticos.";
  }

  if (normalized.includes("obrigado") || normalized.includes("valeu")) {
    return "De nada! Estou por aqui.";
  }

  return null;
}

function getKnownAnswer(text) {
  const normalized = normalizeText(text);

  if (/\bquem\s+(descobriu|encontrou|chegou\s+ao?)\s+(o\s+)?brasil\b/.test(normalized)) {
    return {
      title: "Descobrimento do Brasil",
      subject: "Pedro Alvares Cabral",
      intent: "discoverer",
      answer: "Pela versao historica mais conhecida, Pedro Alvares Cabral chegou ao Brasil em 22 de abril de 1500, comandando uma expedicao portuguesa.",
      url: "https://pt.wikipedia.org/wiki/Descobrimento_do_Brasil"
    };
  }

  if (/\bquem\s+(colonizou|colonizava|colonizou\s+o|dominou)\s+(o\s+)?brasil\b/.test(normalized)) {
    return {
      title: "Colonizacao do Brasil",
      subject: "Portugal",
      intent: "colonizer",
      answer: "O Brasil foi colonizado por Portugal. A colonizacao portuguesa comecou no seculo XVI, apos a chegada da expedicao de Pedro Alvares Cabral em 1500.",
      url: "https://pt.wikipedia.org/wiki/Brasil_Col%C3%B4nia"
    };
  }

  if (/\bquem\s+(inventou|criou)\s+(a\s+)?internet\b/.test(normalized)) {
    return {
      title: "Internet",
      subject: "Vint Cerf e Bob Kahn",
      intent: "inventor",
      answer: "A internet nao foi criada por uma unica pessoa. Uma parte essencial da tecnologia foi desenvolvida por Vint Cerf e Bob Kahn, que criaram o protocolo TCP/IP.",
      url: "https://pt.wikipedia.org/wiki/Internet"
    };
  }

  return null;
}

function getContextReply(text) {
  if (!chatContext) return null;

  const normalized = normalizeText(text);
  const asksAboutPreviousSubject = /\b(ele|ela|isso|esse|essa|eles|elas)\b/.test(normalized);
  if (!asksAboutPreviousSubject) return null;

  if (chatContext.intent === "discoverer" && /\b(descobriu|encontrou|chegou)\b/.test(normalized)) {
    return `Sim. Eu estava falando de ${chatContext.subject}. Pela versao historica mais conhecida, foi ele quem chegou ao Brasil em 22 de abril de 1500.\n\nFonte: ${chatContext.title} - ${chatContext.url}`;
  }

  if (chatContext.intent === "discoverer" && /\b(ano|data|quando)\b/.test(normalized)) {
    return `Foi em 1500. A chegada da expedicao de Pedro Alvares Cabral ao Brasil aconteceu em 22 de abril de 1500.\n\nFonte: ${chatContext.title} - ${chatContext.url}`;
  }

  if (chatContext.intent === "inventor" && /\b(inventou|criou)\b/.test(normalized)) {
    return `Sim, eu estava falando de ${chatContext.subject}. Esse foi o nome ligado a resposta anterior.\n\nFonte: ${chatContext.title} - ${chatContext.url}`;
  }

  if (chatContext.intent === "colonizer" && /\b(ano|data|quando)\b/.test(normalized)) {
    return `A colonizacao portuguesa do Brasil comecou no seculo XVI, depois da chegada de Pedro Alvares Cabral em 1500.\n\nFonte: ${chatContext.title} - ${chatContext.url}`;
  }

  if (chatContext.intent === "colonizer" && /\b(colonizou|colonizava|dominou)\b/.test(normalized)) {
    return `Sim. Eu estava falando de ${chatContext.subject}. Foi Portugal que colonizou o Brasil.\n\nFonte: ${chatContext.title} - ${chatContext.url}`;
  }

  return `Voce esta falando de ${chatContext.title}. Resumo: ${chatContext.answer}\n\nFonte: ${chatContext.url}`;
}

function buildSearchQuery(text) {
  return normalizeText(text)
    .replace(/[?!.,;:()[\]{}"']/g, " ")
    .replace(/\b(pesquise|pesquisar|procure|procurar|busque|buscar)\b/g, " ")
    .replace(/\b(me fala sobre|me fale sobre|fale sobre|me diga sobre|explique sobre)\b/g, " ")
    .replace(/\b(o que e|o que eh|quem e|quem foi|quem descobriu|quem inventou|quem criou|qual e|qual foi|onde fica|quando foi|para que serve|como funciona)\b/g, " ")
    .replace(/\b(o|a|os|as|um|uma|uns|umas|do|da|dos|das|de|em|no|na|nos|nas)\b/g, " ")
    .replace(/\b(pra mim|para mim|por favor|pfv)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getQueryWords(text) {
  return buildSearchQuery(text)
    .split(" ")
    .filter((word) => word.length > 2);
}

function scoreSearchResult(result, queryWords) {
  const title = normalizeText(result.title || "");
  const snippet = normalizeText(result.snippet || "").replace(/<[^>]*>/g, " ");
  const searchable = `${title} ${snippet}`;
  const matches = queryWords.filter((word) => searchable.includes(word)).length;
  const extraTitleWords = title
    .split(/\s+/)
    .filter((word) => word.length > 2 && !queryWords.includes(word)).length;

  return matches * 10 - extraTitleWords;
}

function trimExtract(extract) {
  const cleanExtract = extract.replace(/\s+/g, " ").trim();

  if (cleanExtract.length <= 620) {
    return cleanExtract;
  }

  return `${cleanExtract.slice(0, 620).replace(/\s+\S*$/, "")}...`;
}

async function searchWikipedia(text) {
  const query = buildSearchQuery(text);
  const queryWords = getQueryWords(text);
  if (query.length < 3) return null;

  const searchUrl = new URL("https://pt.wikipedia.org/w/api.php");
  searchUrl.search = new URLSearchParams({
    action: "query",
    format: "json",
    list: "search",
    origin: "*",
    srlimit: "5",
    srsearch: query
  });

  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) return null;

  const searchData = await searchResponse.json();
  const results = searchData.query?.search || [];
  const bestResult = results
    .filter((result) => result.title)
    .sort((first, second) => scoreSearchResult(second, queryWords) - scoreSearchResult(first, queryWords))[0];
  const title = bestResult?.title;
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

  return {
    title: page.title,
    subject: page.title,
    intent: "topic",
    extract: trimExtract(page.extract),
    url: page.fullurl
  };
}

async function getBotReply(text) {
  const localReply = getLocalBotReply(text);
  if (localReply) return localReply;

  try {
    const aiReply = await getAiReply(text);
    if (aiReply) return aiReply;
  } catch {
    console.warn("A IA nao respondeu. Usando fallback simples.");
  }

  const contextReply = getContextReply(text);
  if (contextReply) return contextReply;

  const knownAnswer = getKnownAnswer(text);
  if (knownAnswer) {
    saveContext(knownAnswer);
    return `${knownAnswer.answer}\n\nFonte: ${knownAnswer.title} - ${knownAnswer.url}`;
  }

  try {
    const result = await searchWikipedia(text);
    if (result) {
      saveContext({
        title: result.title,
        subject: result.subject,
        intent: result.intent,
        answer: result.extract,
        url: result.url
      });
      return `Encontrei isto sobre ${result.title}:\n\n${result.extract}\n\nFonte: ${result.url}`;
    }
  } catch {
    return "Tentei pesquisar na internet, mas nao consegui buscar a resposta agora.";
  }

  return "Pesquisei, mas nao encontrei uma resposta boa para essa pergunta. Tente perguntar com o nome principal do assunto.";
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
  chatContext = null;
  localStorage.removeItem(contextKey);
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
