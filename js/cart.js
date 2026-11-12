// Carrinho salvo no localStorage do navegador
const CART_KEY = "cb_cart";

// Procura o produto pelo id
function findProduct(id) {
  return PRODUCTS.find(function (product) {
    return product.id === id;
  });
}

// Lê o carrinho; se não tiver nada ou estiver com erro, começa vazio
function getCart() {
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem(CART_KEY));
  } catch (error) {
    cart = [];
  }
  if (!Array.isArray(cart)) {
    cart = [];
  }
  return cart.filter(function (item) {
    return item !== null && findProduct(item.id) !== undefined;
  });
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(id) {
  const cart = getCart();
  const item = cart.find(function (cartItem) {
    return cartItem.id === id;
  });
  if (item) {
    item.quantity = item.quantity + 1;
  } else {
    cart.push({ id: id, quantity: 1 });
  }
  saveCart(cart);
}

// Muda a quantidade (+1 ou -1); se chegar a 0 o produto sai do carrinho
function changeQuantity(id, delta) {
  let cart = getCart();
  cart.forEach(function (item) {
    if (item.id === id) {
      item.quantity = item.quantity + delta;
    }
  });
  cart = cart.filter(function (item) {
    return item.quantity > 0;
  });
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter(function (item) {
    return item.id !== id;
  });
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

// Quantidade total de itens (soma das quantidades)
function cartCount() {
  let total = 0;
  getCart().forEach(function (item) {
    total = total + item.quantity;
  });
  return total;
}

// Valor total do pedido
function cartTotal() {
  let total = 0;
  getCart().forEach(function (item) {
    total = total + findProduct(item.id).price * item.quantity;
  });
  return total;
}

// Atualiza o número do ícone do carrinho
function updateCartBadge() {
  document.getElementById("cart-count").textContent = cartCount();
}

// Mostra o preço no formato R$ 0,00
function formatPrice(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
