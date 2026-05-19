# Configuracao da IA do chat

O chat ja esta preparado para usar uma API de IA, mas a chave nao pode ficar no GitHub Pages.

## Passos

1. Crie uma chave em `https://platform.openai.com/api-keys`.
2. Importe este repositorio na Vercel.
3. Na Vercel, adicione a variavel de ambiente:

```txt
OPENAI_API_KEY=sua_chave_aqui
```

4. Opcionalmente, adicione:

```txt
OPENAI_MODEL=gpt-5.4-mini
```

5. Depois do deploy, copie a URL da API:

```txt
https://seu-projeto.vercel.app/api/chat
```

6. Cole essa URL em `projeto-chat-tempo-real/config.js`:

```js
window.CHAT_AI_ENDPOINT = "https://seu-projeto.vercel.app/api/chat";
```

7. Publique o commit novamente no GitHub.

Enquanto `CHAT_AI_ENDPOINT` estiver vazio, o chat continua usando o modo simples com Wikipedia.
