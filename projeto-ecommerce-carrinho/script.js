const products = [
  {
    id: 1,
    name: "Kit Cafe Especial Aurora",
    category: "Mercearia",
    price: 42.9,
    description: "Graos selecionados com torra media e notas de chocolate.",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    name: "Azeite Extra Virgem Reserva",
    category: "Mercearia",
    price: 59.9,
    description: "Baixa acidez para finalizar saladas, massas e paes.",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    name: "Fone Bluetooth Pulse",
    category: "Eletronicos",
    price: 189.9,
    description: "Som limpo, bateria duradoura e estojo compacto.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    name: "Smartwatch Fit Pro",
    category: "Eletronicos",
    price: 279.9,
    description: "Monitore treinos, sono e notificacoes do celular.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 5,
    name: "Mochila Urbana Canvas",
    category: "Acessorios",
    price: 149.9,
    description: "Compartimento para notebook e bolsos de acesso rapido.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 6,
    name: "Garrafa Termica Steel",
    category: "Acessorios",
    price: 79.9,
    description: "Mantem bebidas frias ou quentes durante a rotina.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 7,
    name: "Camiseta Algodao Premium",
    category: "Moda",
    price: 69.9,
    description: "Malha macia, corte moderno e acabamento reforcado.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 8,
    name: "Tenis Casual Street",
    category: "Moda",
    price: 249.9,
    description: "Solado leve para uso diario com visual versatil.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
  }
];

const CART_KEY = "mercato-cart";
const shippingFee = 18.9;

let activeCategory = "Todos";
let searchTerm = "";
let cart = loadCart();

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const productGrid = document.querySelector("#productGrid");
const productTemplate = document.querySelector("#productTemplate");
const categoryList = document.querySelector("#categoryList");
const productCount = document.querySelector("#productCount");
const productsTitle = document.querySelector("#productsTitle");
const searchInput = document.querySelector("#searchInput");
const cartDrawer = document.querySelector("#cartDrawer");
const cartToggle = document.querySelector("#cartToggle");
const closeCart = document.querySelector("#closeCart");
const overlay = document.querySelector("#overlay");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const subtotal = document.querySelector("#subtotal");
const shipping = document.querySelector("#shipping");
const total = document.querySelector("#total");
const heroCartTotal = document.querySelector("#heroCartTotal");
const heroCartItems = document.querySelector("#heroCartItems");
const clearCart = document.querySelector("#clearCart");
const checkoutButton = document.querySelector("#checkoutButton");

function formatMoney(value) {
  return moneyFormatter.format(value);
}

function loadCart() {
  const storedCart = localStorage.getItem(CART_KEY);

  if (!storedCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCategories() {
  return ["Todos", ...new Set(products.map((product) => product.category))];
}

function getCartProduct(productId) {
  return products.find((product) => product.id === Number(productId));
}

function getCartTotals() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalValue = cart.reduce((sum, item) => {
    const product = getCartProduct(item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
  const shippingValue = subtotalValue > 0 ? shippingFee : 0;

  return {
    itemCount,
    subtotalValue,
    shippingValue,
    totalValue: subtotalValue + shippingValue
  };
}

function renderCategories() {
  categoryList.innerHTML = "";

  getCategories().forEach((category) => {
    const amount = category === "Todos"
      ? products.length
      : products.filter((product) => product.category === category).length;
    const button = document.createElement("button");
    button.className = `category-button${category === activeCategory ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `<span>${category}</span><strong>${amount}</strong>`;
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderProducts();
    });
    categoryList.appendChild(button);
  });
}

function getFilteredProducts() {
  return products.filter((product) => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const matchesSearch = !normalizedTerm || product.name.toLowerCase().includes(normalizedTerm) || product.description.toLowerCase().includes(normalizedTerm);
    return matchesCategory && matchesSearch;
  });
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();

  productGrid.innerHTML = "";
  productsTitle.textContent = activeCategory === "Todos" ? "Todos os produtos" : activeCategory;
  productCount.textContent = `${filteredProducts.length} produto${filteredProducts.length === 1 ? "" : "s"}`;

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = '<div class="empty-cart"><strong>Nenhum produto encontrado</strong><span>Tente outra busca ou categoria.</span></div>';
    return;
  }

  filteredProducts.forEach((product) => {
    const card = productTemplate.content.cloneNode(true);
    const image = card.querySelector(".product-image");
    const category = card.querySelector(".product-category");
    const title = card.querySelector("h3");
    const description = card.querySelector("p");
    const price = card.querySelector(".product-footer strong");
    const button = card.querySelector(".product-footer button");

    image.src = product.image;
    image.alt = product.name;
    category.textContent = product.category;
    title.textContent = product.name;
    description.textContent = product.description;
    price.textContent = formatMoney(product.price);
    button.addEventListener("click", () => addToCart(product.id));

    productGrid.appendChild(card);
  });
}

function renderCart() {
  const totals = getCartTotals();

  cartItems.innerHTML = "";
  cartCount.textContent = totals.itemCount;
  subtotal.textContent = formatMoney(totals.subtotalValue);
  shipping.textContent = formatMoney(totals.shippingValue);
  total.textContent = formatMoney(totals.totalValue);
  heroCartTotal.textContent = formatMoney(totals.totalValue);
  heroCartItems.textContent = `${totals.itemCount} ite${totals.itemCount === 1 ? "m" : "ns"} selecionado${totals.itemCount === 1 ? "" : "s"}`;
  clearCart.disabled = cart.length === 0;
  checkoutButton.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart"><strong>Seu carrinho esta vazio</strong><span>Adicione produtos para ver a logica do carrinho em acao.</span></div>';
    return;
  }

  cart.forEach((item) => {
    const product = getCartProduct(item.id);

    if (!product) {
      return;
    }

    const article = document.createElement("article");
    article.className = "cart-item";
    article.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="cart-item-info">
        <h3>${product.name}</h3>
        <strong>${formatMoney(product.price * item.quantity)}</strong>
        <div class="cart-actions">
          <div class="quantity-control" aria-label="Quantidade de ${product.name}">
            <button type="button" data-action="decrease" data-id="${product.id}" aria-label="Diminuir quantidade">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-action="increase" data-id="${product.id}" aria-label="Aumentar quantidade">+</button>
          </div>
          <button class="remove-button" type="button" data-action="remove" data-id="${product.id}">Remover</button>
        </div>
      </div>
    `;
    cartItems.appendChild(article);
  });
}

function updateCart(productId, quantity) {
  cart = cart
    .map((item) => item.id === productId ? { ...item, quantity } : item)
    .filter((item) => item.quantity > 0);
  saveCart();
  renderCart();
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    updateCart(productId, existingItem.quantity + 1);
  } else {
    cart.push({ id: productId, quantity: 1 });
    saveCart();
    renderCart();
  }

  openCart();
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}

function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
}

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

cartToggle.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartDrawer);
overlay.addEventListener("click", closeCartDrawer);

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const productId = Number(button.dataset.id);
  const action = button.dataset.action;
  const item = cart.find((cartItem) => cartItem.id === productId);

  if (!item) {
    return;
  }

  if (action === "increase") {
    updateCart(productId, item.quantity + 1);
  }

  if (action === "decrease") {
    updateCart(productId, item.quantity - 1);
  }

  if (action === "remove") {
    updateCart(productId, 0);
  }
});

clearCart.addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
});

checkoutButton.addEventListener("click", () => {
  const totals = getCartTotals();
  alert(`Compra simulada com sucesso! Total: ${formatMoney(totals.totalValue)}`);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCartDrawer();
  }
});

renderCategories();
renderProducts();
renderCart();
