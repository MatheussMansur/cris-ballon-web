// Filtros escolhidos na tela da loja
const state = {
  category: "",
  tag: "",
  search: "",
  sort: "relevant"
};

// Monta a lista de categorias com a quantidade de produtos de cada uma
function renderCategories() {
  const list = document.getElementById("category-list");
  list.textContent = "";

  addCategoryButton(list, "", "Todas", PRODUCTS.length);
  CATEGORIES.forEach(function (category) {
    const total = PRODUCTS.filter(function (product) {
      return product.category === category;
    }).length;
    addCategoryButton(list, category, category, total);
  });
}

function addCategoryButton(list, value, label, total) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.textContent = label + " ";

  const count = document.createElement("span");
  count.textContent = "(" + total + ")";
  button.appendChild(count);

  if (state.category === value && state.tag === "") {
    button.classList.add("active");
  }

  button.addEventListener("click", function () {
    state.category = value;
    state.tag = "";
    document.getElementById("category-list").classList.remove("open");
    render();
  });

  item.appendChild(button);
  list.appendChild(item);
}

// Monta o cartão de um produto
function createCard(product) {
  const card = document.createElement("div");
  card.classList.add("card");

  if (product.tag !== "") {
    const tag = document.createElement("span");
    tag.classList.add("card-tag");
    if (product.tag === "Promoção") {
      tag.classList.add("sale");
    }
    tag.textContent = product.tag;
    card.appendChild(tag);
  }

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.name;
  card.appendChild(image);

  const info = document.createElement("div");
  info.classList.add("card-info");

  const name = document.createElement("p");
  name.classList.add("card-name");
  name.textContent = product.name;
  info.appendChild(name);

  const bottom = document.createElement("div");
  bottom.classList.add("card-bottom");

  const price = document.createElement("span");
  price.classList.add("card-price");
  price.textContent = formatPrice(product.price);
  bottom.appendChild(price);

  const addButton = document.createElement("button");
  addButton.classList.add("add-button");
  addButton.textContent = "+";
  addButton.title = "Adicionar ao carrinho";
  addButton.addEventListener("click", function () {
    addToCart(product.id);
    updateCartBadge();
  });
  bottom.appendChild(addButton);

  info.appendChild(bottom);
  card.appendChild(info);
  return card;
}

function itemCountText(total) {
  if (total === 1) {
    return "1 item";
  }
  return total + " itens";
}

function titleText() {
  if (state.category !== "") {
    return state.category;
  }
  if (state.tag === "Destaque") {
    return "Destaques";
  }
  if (state.tag === "Promoção") {
    return "Promoções";
  }
  return "Todos os produtos";
}

// Marca no menu a opção que está escolhida
function renderMenu() {
  document.getElementById("menu-home").classList.toggle("active", state.category === "" && state.tag === "");
  document.getElementById("menu-highlights").classList.toggle("active", state.tag === "Destaque");
  document.getElementById("menu-sales").classList.toggle("active", state.tag === "Promoção");
}

// Mostra os produtos na grade de acordo com os filtros
function render() {
  const list = PRODUCTS.filter(function (product) {
    if (state.category !== "" && product.category !== state.category) {
      return false;
    }
    if (state.tag !== "" && product.tag !== state.tag) {
      return false;
    }
    if (state.search !== "" && !product.name.toLowerCase().includes(state.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  // ordena só a lista filtrada
  if (state.sort === "price-asc") {
    list.sort(function (a, b) {
      return a.price - b.price;
    });
  }
  if (state.sort === "price-desc") {
    list.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  renderCategories();
  renderMenu();
  document.getElementById("shop-title").textContent = titleText();

  const grid = document.getElementById("product-grid");
  grid.textContent = "";
  list.forEach(function (product) {
    grid.appendChild(createCard(product));
  });

  document.getElementById("item-count").textContent = itemCountText(list.length);
  document.getElementById("empty-search").classList.toggle("hidden", list.length > 0);
}

// Troca entre a tela da loja e a tela do carrinho
function showScreen(name) {
  document.getElementById("shop-screen").classList.toggle("hidden", name !== "shop");
  document.getElementById("cart-screen").classList.toggle("hidden", name !== "cart");
  if (name === "cart") {
    document.getElementById("order-message").classList.add("hidden");
    document.getElementById("menu-home").classList.remove("active");
    document.getElementById("menu-highlights").classList.remove("active");
    document.getElementById("menu-sales").classList.remove("active");
    renderCart();
  }
  window.scrollTo(0, 0);
}

// Monta uma linha do carrinho
function createCartItem(item) {
  const product = findProduct(item.id);

  const row = document.createElement("li");
  row.classList.add("cart-item");

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.name;
  row.appendChild(image);

  const info = document.createElement("div");
  info.classList.add("cart-item-info");
  const name = document.createElement("p");
  name.classList.add("cart-item-name");
  name.textContent = product.name;
  const price = document.createElement("p");
  price.classList.add("cart-item-price");
  price.textContent = formatPrice(product.price);
  info.appendChild(name);
  info.appendChild(price);
  row.appendChild(info);

  const quantity = document.createElement("div");
  quantity.classList.add("quantity");
  const minus = document.createElement("button");
  minus.textContent = "-";
  minus.addEventListener("click", function () {
    changeQuantity(product.id, -1);
    renderCart();
    updateCartBadge();
  });
  const number = document.createElement("span");
  number.textContent = item.quantity;
  const plus = document.createElement("button");
  plus.textContent = "+";
  plus.addEventListener("click", function () {
    changeQuantity(product.id, 1);
    renderCart();
    updateCartBadge();
  });
  quantity.appendChild(minus);
  quantity.appendChild(number);
  quantity.appendChild(plus);
  row.appendChild(quantity);

  const remove = document.createElement("button");
  remove.classList.add("remove-button");
  remove.textContent = "Remover";
  remove.addEventListener("click", function () {
    removeFromCart(product.id);
    renderCart();
    updateCartBadge();
  });
  row.appendChild(remove);

  return row;
}

// Mostra os produtos do carrinho e o total
function renderCart() {
  const cart = getCart();
  const list = document.getElementById("cart-list");
  list.textContent = "";
  cart.forEach(function (item) {
    list.appendChild(createCartItem(item));
  });

  const empty = cart.length === 0;
  document.getElementById("cart-empty").classList.toggle("hidden", !empty);
  document.getElementById("cart-total").classList.toggle("hidden", empty);
  document.getElementById("finish-button").classList.toggle("hidden", empty);
  document.getElementById("cart-total-value").textContent = formatPrice(cartTotal());
}

// Botão Categorias (aparece só no celular)
document.getElementById("categories-button").addEventListener("click", function () {
  document.getElementById("category-list").classList.toggle("open");
});

// Ícone do carrinho
document.getElementById("cart-button").addEventListener("click", function () {
  showScreen("cart");
});

// Finalizar pedido: esvazia o carrinho e mostra a mensagem
document.getElementById("finish-button").addEventListener("click", function () {
  clearCart();
  renderCart();
  updateCartBadge();
  document.getElementById("cart-empty").classList.add("hidden");
  document.getElementById("order-message").classList.remove("hidden");
});

// Menu: Início, Destaques e Promoções
document.getElementById("menu-home").addEventListener("click", function () {
  state.category = "";
  state.tag = "";
  state.search = "";
  state.sort = "relevant";
  document.getElementById("search-input").value = "";
  document.getElementById("sort-select").value = "relevant";
  showScreen("shop");
  render();
});

document.getElementById("menu-highlights").addEventListener("click", function () {
  state.category = "";
  state.tag = "Destaque";
  showScreen("shop");
  render();
});

document.getElementById("menu-sales").addEventListener("click", function () {
  state.category = "";
  state.tag = "Promoção";
  showScreen("shop");
  render();
});

// Busca pelo nome enquanto digita
document.getElementById("search-input").addEventListener("input", function () {
  state.search = this.value.trim();
  showScreen("shop");
  render();
});

// Ordenar por preço
document.getElementById("sort-select").addEventListener("change", function () {
  state.sort = this.value;
  render();
});

render();
renderCart();
updateCartBadge();
