# Mercato - E-commerce com Carrinho

Projeto intermediario de loja virtual para treinar gerenciamento de estado, filtros, calculos dinamicos, atualizacao de interface em tempo real e persistencia com Local Storage.

## Funcionalidades

- Listagem de produtos com imagem, categoria, descricao e preco.
- Filtro por categoria.
- Busca por nome ou descricao.
- Carrinho lateral com abertura imediata ao adicionar produto.
- Incremento, decremento e remocao de itens.
- Calculo automatico de subtotal, frete e total.
- Persistencia do carrinho no navegador com `localStorage`.
- Layout responsivo para desktop e mobile.

## Como executar

Abra o arquivo `index.html` no navegador.

Como alternativa, dentro da pasta do projeto, rode um servidor local simples:

```bash
python -m http.server 5500
```

Depois acesse `http://localhost:5500`.

## Estrutura

```text
.
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Ideias para evoluir

- Tela de checkout com formulario.
- Cupom de desconto.
- Pagina de detalhes do produto.
- Ordenacao por preco.
- Integracao com API fake.
