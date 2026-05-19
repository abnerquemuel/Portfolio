export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Metodo nao permitido." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({
      error: "A chave OPENAI_API_KEY nao foi configurada no servidor."
    });
  }

  try {
    const { message, history = [] } = request.body || {};

    if (!message || typeof message !== "string") {
      return response.status(400).json({ error: "Mensagem invalida." });
    }

    const input = [
      {
        role: "developer",
        content:
          "Voce e um assistente em portugues do Brasil. Responda de forma clara, curta e util. Se nao souber, diga que nao tem certeza. Use o contexto da conversa quando a pergunta fizer referencia a algo anterior."
      },
      ...history.slice(-8).map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: String(item.content || "").slice(0, 1000)
      })),
      {
        role: "user",
        content: message
      }
    ];

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        input,
        max_output_tokens: 500
      })
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return response.status(aiResponse.status).json({
        error: data.error?.message || "Erro ao chamar a IA."
      });
    }

    const answer = extractOutputText(data) || "Nao consegui gerar uma resposta agora.";
    return response.status(200).json({ answer });
  } catch {
    return response.status(500).json({
      error: "Erro interno ao processar a mensagem."
    });
  }
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .join("")
    .trim();
}
