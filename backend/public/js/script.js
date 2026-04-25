function resolveApiUrl() {
  const protocol = window.location.protocol;
  const host = window.location.hostname;

  if (protocol === "file:") {
    return "http://127.0.0.1:3000/api/order";
  }

  const isLocalNetwork =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

  if (isLocalNetwork) {
    return `http://${host}:3000/api/order`;
  }

  return "/api/order";
}

const API_URL = resolveApiUrl();

const viewBtn = document.querySelector(".header__contacts");
const popup = document.querySelector(".popup");
const field = document.querySelector(".field");
const input = document.querySelector(".url");
const copyBtn = document.querySelector(".copy-btn");
const toastContainer = document.querySelector(".copy-toast-container");

let copiedTimer;

if (viewBtn && popup) {
  viewBtn.addEventListener("click", () => {
    popup.classList.toggle("show");
  });
}

if (copyBtn && input && field && toastContainer) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(input.value);
    } catch (error) {
      input.select();
      input.setSelectionRange(0, 99999);
      document.execCommand("copy");
      window.getSelection().removeAllRanges();
    }

    clearTimeout(copiedTimer);
    field.classList.remove("copied");
    void field.offsetWidth;
    field.classList.add("copied");

    function updateToasts() {
      const toasts = [...toastContainer.querySelectorAll(".copy-toast")];

      toasts.forEach((toast, index) => {
        toast.style.zIndex = String(100 - index);
        toast.style.setProperty("--toast-y", `${index * 16}px`);
        toast.style.setProperty("--toast-scale", `${1 - index * 0.04}`);
        toast.style.opacity = index === 0 ? "1" : index === 1 ? "0.92" : "0.82";

        if (index === 0) {
          toast.classList.remove("is-stacked");
        } else {
          toast.classList.add("is-stacked");
        }
      });
    }

    const toast = document.createElement("div");
    toast.className = "copy-toast";
    toast.innerHTML = `
      <span class="copy-toast__title">Ссылка скопирована</span>
      <span class="copy-toast__brand">mornin’</span>
    `;

    toastContainer.prepend(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");

      requestAnimationFrame(() => {
        updateToasts();
      });
    });

    setTimeout(() => {
      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();
        updateToasts();
      }, 280);
    }, 900);

    copiedTimer = setTimeout(() => {
      field.classList.remove("copied");
    }, 1000);
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".contacts-box") && popup) {
    popup.classList.remove("show");
  }
});

const state = {
  items: [],
};

const cartTrigger = document.getElementById("cartTrigger");
const cartTotal = document.getElementById("cartTotal");
const cartBadge = document.getElementById("cartBadge");

const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartCloseBtn = document.getElementById("cartCloseBtn");

const cartItemsStep = document.getElementById("cartItemsStep");
const checkoutStep = document.getElementById("checkoutStep");

const cartList = document.getElementById("cartList");
const drawerTotal = document.getElementById("drawerTotal");
const goToCheckoutBtn = document.getElementById("goToCheckoutBtn");
const backToCartBtn = document.getElementById("backToCartBtn");

const cartSuccessPopup = document.getElementById("cartSuccessPopup");
const closeSuccessPopupBtn = document.getElementById("closeSuccessPopupBtn");

const privacyConsent = document.getElementById("privacyConsent");
const cartConsentBlock = document.getElementById("cartConsentBlock");

const motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let cartAnimationToken = 0;
let lastCartSnapshot = {
  count: 0,
  total: 0,
};

function shouldAnimateCart() {
  return !motionMediaQuery.matches;
}

function cancelAnimations(element) {
  if (!element?.getAnimations) return;
  element.getAnimations().forEach((animation) => animation.cancel());
}

function animateCartElement(element, keyframes, options) {
  if (!element || !shouldAnimateCart()) return null;
  cancelAnimations(element);
  return element.animate(keyframes, options);
}

function animateCartTriggerPulse() {
  animateCartElement(
    cartTrigger,
    [
      { transform: "scale(1)" },
      { transform: "scale(1.04)" },
      { transform: "scale(0.985)" },
      { transform: "scale(1)" },
    ],
    {
      duration: 360,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  );
}

function animateCartBadgePop() {
  if (!cartBadge || cartBadge.hidden) return;

  animateCartElement(
    cartBadge,
    [
      { transform: "scale(0.72)", opacity: 0.4 },
      { transform: "scale(1.15)", opacity: 1, offset: 0.55 },
      { transform: "scale(1)" },
    ],
    {
      duration: 320,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  );
}

function animateCartTotals() {
  [cartTotal, drawerTotal].forEach((node) => {
    animateCartElement(
      node,
      [
        { transform: "translateY(0) scale(1)", opacity: 1 },
        {
          transform: "translateY(-2px) scale(1.04)",
          opacity: 0.82,
          offset: 0.45,
        },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ],
      {
        duration: 260,
        easing: "ease-out",
      },
    );
  });
}

function animateCartItemChange(id, source) {
  if (!cartList || !id) return;

  const item = [...cartList.querySelectorAll(".cart-item")].find(
    (element) => element.dataset.cartItemId === id,
  );

  if (!item) return;

  const keyframes =
    source === "add"
      ? [
          { opacity: 0, transform: "translateY(14px) scale(0.96)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ]
      : source === "plus"
        ? [
            { transform: "scale(1)" },
            { transform: "scale(1.03)" },
            { transform: "scale(1)" },
          ]
        : [
            { transform: "scale(1)" },
            { transform: "scale(0.985)" },
            { transform: "scale(1)" },
          ];

  animateCartElement(item, keyframes, {
    duration: source === "add" ? 320 : 220,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  });
}

function animateDrawerOpen() {
  animateCartElement(cartOverlay, [{ opacity: 0 }, { opacity: 1 }], {
    duration: 180,
    easing: "ease-out",
    fill: "forwards",
  });

  animateCartElement(
    cartDrawer,
    [
      { transform: "translateX(42px)", opacity: 0 },
      { transform: "translateX(0)", opacity: 1 },
    ],
    {
      duration: 280,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    },
  );
}

function animateDrawerClose(onFinish) {
  if (!shouldAnimateCart()) {
    onFinish?.();
    return;
  }

  const animationId = ++cartAnimationToken;

  cancelAnimations(cartOverlay);
  cancelAnimations(cartDrawer);

  cartOverlay.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 160,
    easing: "ease-in",
    fill: "forwards",
  });

  const drawerAnimation = cartDrawer.animate(
    [
      { transform: "translateX(0)", opacity: 1 },
      { transform: "translateX(36px)", opacity: 0 },
    ],
    {
      duration: 220,
      easing: "cubic-bezier(0.4, 0, 1, 1)",
      fill: "forwards",
    },
  );

  drawerAnimation.onfinish = () => {
    if (animationId !== cartAnimationToken) return;
    onFinish?.();
    cancelAnimations(cartOverlay);
    cancelAnimations(cartDrawer);
  };
}

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function getTotalCount() {
  return state.items.reduce((sum, item) => sum + item.qty, 0);
}

function getTotalPrice() {
  return state.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

let cartScrollY = 0;
let cartHistoryOpened = false;
let ignoreNextCartPopstate = false;

function lockBodyForCart() {
  if (document.body.classList.contains("cart-lock")) return;

  cartScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.classList.add("cart-lock");
  document.body.style.position = "fixed";
  document.body.style.top = `-${cartScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

function unlockBodyForCart() {
  if (!document.body.classList.contains("cart-lock")) return;

  const savedScrollY =
    Math.abs(parseInt(document.body.style.top || "0", 10)) || cartScrollY;

  document.body.classList.remove("cart-lock");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";

  window.scrollTo(0, savedScrollY);
}

function pushCartHistoryState() {
  if (cartHistoryOpened) return;

  const historyState =
    window.history.state && typeof window.history.state === "object"
      ? window.history.state
      : {};

  window.history.pushState(
    {
      ...historyState,
      __morninCartOpened: true,
    },
    "",
  );

  cartHistoryOpened = true;
}

function syncCartHistoryOnClose() {
  if (!cartHistoryOpened) return;

  ignoreNextCartPopstate = true;
  cartHistoryOpened = false;
  window.history.back();
}

function openDrawer() {
  if (!cartOverlay || !cartDrawer) return;
  if (cartDrawer.classList.contains("is-open")) return;

  cartOverlay.classList.add("is-open");
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  lockBodyForCart();
  animateDrawerOpen();
  pushCartHistoryState();
}

function closeDrawer(options = {}) {
  const { fromPopState = false, syncHistory = true } = options;

  if (!cartOverlay || !cartDrawer) return;
  if (!cartDrawer.classList.contains("is-open")) return;

  if (!fromPopState && syncHistory) {
    syncCartHistoryOnClose();
  }

  animateDrawerClose(() => {
    cartOverlay.classList.remove("is-open");
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    unlockBodyForCart();
    showItemsStep();
  });
}

function showItemsStep() {
  if (!cartItemsStep || !checkoutStep) return;

  cartItemsStep.classList.add("cart-step--active");
  checkoutStep.classList.remove("cart-step--active");
}

function showCheckoutStep() {
  if (!cartItemsStep || !checkoutStep) return;
  if (!state.items.length) return;

  cartItemsStep.classList.remove("cart-step--active");
  checkoutStep.classList.add("cart-step--active");
}

function showSuccessPopup() {
  if (cartSuccessPopup) {
    cartSuccessPopup.classList.add("is-open");
  }
}

function closeSuccessPopup() {
  if (cartSuccessPopup) {
    cartSuccessPopup.classList.remove("is-open");
  }
}

function setConsentErrorState(hasError) {
  if (!cartConsentBlock) return;
  cartConsentBlock.classList.toggle("cart-consent--error", hasError);
}

function validateConsent() {
  if (!privacyConsent) return true;

  const isChecked = privacyConsent.checked;
  setConsentErrorState(!isChecked);
  return isChecked;
}

function addToCart(product) {
  const normalizedPrice = Number(product?.price);

  if (
    !product ||
    !product.id ||
    !product.name ||
    !Number.isFinite(normalizedPrice)
  ) {
    console.log("Не удалось добавить товар:", product);
    return;
  }

  const previousCount = getTotalCount();
  const previousTotal = getTotalPrice();

  const existing = state.items.find((item) => item.id === product.id);
  let changeSource = "add";

  if (existing) {
    existing.qty += 1;
    changeSource = "plus";
  } else {
    state.items.push({
      id: product.id,
      name: product.name,
      price: normalizedPrice,
      qty: 1,
    });
  }

  renderCart({
    changedId: product.id,
    changeSource,
    previousCount,
    previousTotal,
  });
}

function changeItemQty(id, delta) {
  const item = state.items.find((i) => i.id === id);
  if (!item) return;

  const previousCount = getTotalCount();
  const previousTotal = getTotalPrice();

  item.qty += delta;
  let changeSource = delta > 0 ? "plus" : "minus";

  if (item.qty <= 0) {
    state.items = state.items.filter((i) => i.id !== id);
    changeSource = "remove";
  }

  renderCart({
    changedId: id,
    changeSource,
    previousCount,
    previousTotal,
  });
}

function removeItem(id) {
  const previousCount = getTotalCount();
  const previousTotal = getTotalPrice();

  state.items = state.items.filter((i) => i.id !== id);

  renderCart({
    changedId: id,
    changeSource: "remove",
    previousCount,
    previousTotal,
  });
}

function renderTrigger() {
  const totalCount = getTotalCount();
  const totalPrice = getTotalPrice();

  if (cartTotal) {
    cartTotal.textContent = formatPrice(totalPrice);
  }

  if (drawerTotal) {
    drawerTotal.textContent = `${formatPrice(totalPrice)} din`;
  }

  if (cartBadge) {
    cartBadge.textContent = totalCount;
    cartBadge.hidden = totalCount === 0;
  }

  if (cartTrigger) {
    cartTrigger.classList.toggle("has-items", totalCount > 0);
  }

  if (goToCheckoutBtn) {
    goToCheckoutBtn.disabled = totalCount === 0;
  }
}

function renderList() {
  if (!cartList) return;

  if (!state.items.length) {
    cartList.innerHTML = '<div class="cart-empty">Корзина пока пуста</div>';
    return;
  }

  cartList.innerHTML = state.items
    .map((item) => {
      const itemTotal = item.price * item.qty;

      return `
        <div class="cart-item" data-cart-item-id="${item.id}">
          <div class="cart-item__info">
            <div class="cart-item__name">${item.name}</div>
            <div class="cart-item__meta">${formatPrice(item.price)} din × ${item.qty} = ${formatPrice(itemTotal)} din</div>
          </div>

          <div class="cart-item__controls">
            <button class="cart-qty-btn" type="button" data-action="minus" data-id="${item.id}">−</button>
            <span class="cart-item__qty">${item.qty}</span>
            <button class="cart-qty-btn" type="button" data-action="plus" data-id="${item.id}">+</button>
            <button class="cart-remove-btn" type="button" data-action="remove" data-id="${item.id}">×</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderCart(changeMeta = null) {
  renderTrigger();
  renderList();
  syncCatalogButtons();

  const currentCount = getTotalCount();
  const currentTotal = getTotalPrice();

  if (!state.items.length) {
    showItemsStep();
  }

  if (changeMeta) {
    const { changedId, changeSource, previousCount, previousTotal } =
      changeMeta;

    if (currentCount !== previousCount) {
      animateCartBadgePop();
      animateCartTriggerPulse();
    }

    if (currentTotal !== previousTotal) {
      animateCartTotals();
    }

    if (changeSource !== "remove") {
      requestAnimationFrame(() => {
        animateCartItemChange(changedId, changeSource);
      });
    }
  }

  lastCartSnapshot = {
    count: currentCount,
    total: currentTotal,
  };
}

if (cartTrigger) {
  cartTrigger.addEventListener("click", openDrawer);
}

if (cartCloseBtn) {
  cartCloseBtn.addEventListener("click", closeDrawer);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeDrawer);
}

window.addEventListener("popstate", () => {
  if (ignoreNextCartPopstate) {
    ignoreNextCartPopstate = false;
    return;
  }

  if (cartDrawer?.classList.contains("is-open")) {
    cartHistoryOpened = false;
    closeDrawer({
      fromPopState: true,
      syncHistory: false,
    });
  }
});

if (goToCheckoutBtn) {
  goToCheckoutBtn.addEventListener("click", showCheckoutStep);
}

if (backToCartBtn) {
  backToCartBtn.addEventListener("click", showItemsStep);
}

if (closeSuccessPopupBtn) {
  closeSuccessPopupBtn.addEventListener("click", closeSuccessPopup);
}

if (privacyConsent) {
  privacyConsent.addEventListener("change", () => {
    if (privacyConsent.checked) {
      setConsentErrorState(false);
    }
  });
}

if (cartList) {
  cartList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === "plus") changeItemQty(id, 1);
    if (action === "minus") changeItemQty(id, -1);
    if (action === "remove") removeItem(id);
  });
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(value) {
  if (!value) return 0;

  const cleaned = String(value)
    .replace(/\s+/g, "")
    .replace(/din/gi, "")
    .replace(/₽/g, "")
    .replace(/руб\.?/gi, "")
    .replace(/,/g, ".");

  const match = cleaned.match(/\d+(\.\d+)?/);
  return match ? Math.round(Number(match[0])) : 0;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['’"]/g, "")
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function getTextFromSelectors(root, selectors) {
  if (!root) return "";

  for (const selector of selectors) {
    const el = root.querySelector(selector);
    const text = normalizeText(el?.textContent || "");
    if (text) return text;
  }

  return "";
}

function getPriceFromSelectors(root, selectors) {
  if (!root) return 0;

  for (const selector of selectors) {
    const el = root.querySelector(selector);
    const price = parsePrice(el?.textContent || "");
    if (price) return price;
  }

  return 0;
}

function getDatasetValue(el, keys) {
  if (!el || !el.dataset) return "";

  for (const key of keys) {
    const value = el.dataset[key];
    if (value) return normalizeText(value);
  }

  return "";
}

function getSelectedProductOption(card) {
  if (!card) return null;

  return card.querySelector("[data-product-option]:checked");
}

function syncProductCardOption(card) {
  const selectedOption = getSelectedProductOption(card);
  if (!selectedOption) return;

  const countEl = card.querySelector(".product-card__count");
  const weightEl = card.querySelector(".product-card__weight");
  const priceEl = card.querySelector(".product-card__price");
  const addBtn = card.querySelector("[data-add-to-cart]");

  const count = getDatasetValue(selectedOption, ["count", "size", "sizeLabel"]);
  const weight = getDatasetValue(selectedOption, ["weight"]);
  const price = parsePrice(getDatasetValue(selectedOption, ["price"]));
  const id = getDatasetValue(selectedOption, ["id", "productId", "itemId", "sku"]);
  const name = getDatasetValue(selectedOption, ["name", "title", "productName", "itemName"]);

  if (countEl && count) countEl.textContent = count;
  if (weightEl && weight) weightEl.textContent = weight;
  if (priceEl && price) {
    priceEl.innerHTML = `${formatPrice(price)} <span>din</span>`;
  }

  if (addBtn) {
    if (!addBtn.dataset.defaultLabel) {
      addBtn.dataset.defaultLabel = "Добавить +";
    }

    if (id) addBtn.dataset.id = id;
    if (name) addBtn.dataset.name = name;
    if (price) addBtn.dataset.price = String(price);
  }
}

function syncAllProductCardOptions() {
  document.querySelectorAll(".product-card").forEach((card) => {
    syncProductCardOption(card);
  });
}

function isIgnoredButton(btn) {
  if (!btn) return true;

  return Boolean(
    btn.closest("#cartDrawer") ||
    btn.closest("#cartList") ||
    btn.closest("#checkoutStep") ||
    btn.closest(".popup") ||
    btn.closest(".contacts-box") ||
    btn.classList.contains("copy-btn") ||
    btn.classList.contains("cart-qty-btn") ||
    btn.classList.contains("cart-remove-btn") ||
    btn.id === "cartTrigger" ||
    btn.id === "cartCloseBtn" ||
    btn.id === "goToCheckoutBtn" ||
    btn.id === "backToCartBtn" ||
    btn.id === "closeSuccessPopupBtn",
  );
}

function looksLikeAddButton(btn) {
  if (!btn || isIgnoredButton(btn)) return false;

  if (btn.hasAttribute("data-add-to-cart")) return true;

  const text = normalizeText(btn.textContent).toLowerCase();
  const className = String(btn.className || "").toLowerCase();

  return (
    text.includes("в корзину") ||
    text.includes("добавить") ||
    text.includes("купить") ||
    text.includes("заказать") ||
    className.includes("add-to-cart") ||
    className.includes("addtocart") ||
    className.includes("product-card__btn") ||
    className.includes("product__btn") ||
    className.includes("card__btn") ||
    className.includes("sauce-item__btn") ||
    className.includes("vibe")
  );
}

function getPossibleCard(btn) {
  if (!btn) return null;

  const selectors = [
    ".product-card",
    ".sauce-item",
    ".product-card_vibe",
    ".product-card-vibe",
    ".product-card__item",
    ".vibe-card",
    ".vibe__item",
    ".vibe__card",
    ".product",
    ".catalog__item",
    ".shop__item",
    ".card",
    ".item",
    ".swiper-slide",
    "article",
    "li",
  ];

  for (const selector of selectors) {
    const found = btn.closest(selector);
    if (found) return found;
  }

  let node = btn.parentElement;
  let depth = 0;

  while (node && depth < 10) {
    const hasTitle =
      getTextFromSelectors(node, [
        ".product-card__title",
        ".product-card__name",
        ".sauce-item__title",
        ".product__title",
        ".product__name",
        ".card__title",
        ".card__name",
        ".item__title",
        ".item__name",
        ".vibe__title",
        ".vibe-card__title",
        ".vibe-card__name",
        "h1",
        "h2",
        "h3",
        "h4",
      ]) !== "";

    const hasPrice =
      getPriceFromSelectors(node, [
        ".product-card__price",
        ".sauce-item__price",
        ".product__price",
        ".card__price",
        ".item__price",
        ".vibe__price",
        ".vibe-card__price",
        ".price",
      ]) > 0;

    if (hasTitle || hasPrice) {
      return node;
    }

    node = node.parentElement;
    depth += 1;
  }

  return btn.parentElement;
}

function getProductName(card, btn) {
  const selectedOption = getSelectedProductOption(card);

  return (
    getDatasetValue(selectedOption, ["name", "title", "productName", "itemName"]) ||
    getDatasetValue(btn, ["name", "title", "productName", "itemName"]) ||
    getDatasetValue(card, ["name", "title", "productName", "itemName"]) ||
    getTextFromSelectors(card, [
      ".product-card__title",
      ".product-card__name",
      ".sauce-item__title",
      ".product__title",
      ".product__name",
      ".card__title",
      ".card__name",
      ".item__title",
      ".item__name",
      ".vibe__title",
      ".vibe-card__title",
      ".vibe-card__name",
      "h1",
      "h2",
      "h3",
      "h4",
    ]) ||
    normalizeText(card?.querySelector("img")?.alt || "") ||
    "Товар"
  );
}

function getProductPrice(card, btn) {
  const selectedOption = getSelectedProductOption(card);

  return (
    parsePrice(
      getDatasetValue(selectedOption, ["price", "productPrice", "itemPrice", "cost"]),
    ) ||
    parsePrice(
      getDatasetValue(btn, ["price", "productPrice", "itemPrice", "cost"]),
    ) ||
    parsePrice(
      getDatasetValue(card, ["price", "productPrice", "itemPrice", "cost"]),
    ) ||
    getPriceFromSelectors(card, [
      ".product-card__price",
      ".sauce-item__price",
      ".product__price",
      ".card__price",
      ".item__price",
      ".vibe__price",
      ".vibe-card__price",
      ".price",
    ]) ||
    0
  );
}

function getProductId(card, btn, name, price) {
  const selectedOption = getSelectedProductOption(card);

  return (
    getDatasetValue(selectedOption, ["id", "productId", "itemId", "sku"]) ||
    getDatasetValue(btn, ["id", "productId", "itemId", "sku"]) ||
    getDatasetValue(card, ["id", "productId", "itemId", "sku"]) ||
    `${slugify(name)}-${price}`
  );
}

function handleAddToCart(event) {
  const counterControl = event.target.closest("[data-card-action]");

  if (counterControl) {
    event.preventDefault();

    const action = counterControl.dataset.cardAction;
    const id = counterControl.dataset.productId;

    if (!id) return;

    if (action === "plus") {
      changeItemQty(id, 1);
    }

    if (action === "minus") {
      changeItemQty(id, -1);
    }

    return;
  }

  const btn = event.target.closest("button, a, [role='button'], .btn");
  if (!btn) return;

  if (btn.classList.contains("is-in-cart")) return;
  if (!looksLikeAddButton(btn)) return;

  event.preventDefault();

  const card = getPossibleCard(btn);
  const name = getProductName(card, btn);
  const price = getProductPrice(card, btn);
  const id = getProductId(card, btn, name, price);

  if (!price) {
    console.log("НЕ НАЙДЕНА ЦЕНА", { btn, card, name, price, id });
    return;
  }

  addToCart({
    id,
    name,
    price,
  });
}

function getCartItemById(id) {
  return state.items.find((item) => item.id === id);
}

function syncSingleCatalogButton(btn) {
  if (!btn) return;

  const card = getPossibleCard(btn);
  if (!card) return;

  const name = getProductName(card, btn);
  const price = getProductPrice(card, btn);
  const id = getProductId(card, btn, name, price);

  if (!id || !price) return;

  if (!btn.dataset.defaultLabel) {
    btn.dataset.defaultLabel = normalizeText(btn.textContent) || "Добавить";
  }

  btn.dataset.productId = id;
  btn.dataset.productName = name;
  btn.dataset.productPrice = String(price);

  const cartItem = getCartItemById(id);

  if (!cartItem) {
    btn.classList.remove("is-in-cart");
    btn.innerHTML = `<span class="card-counter__label">${btn.dataset.defaultLabel}</span>`;
    return;
  }

  btn.classList.add("is-in-cart");
  btn.innerHTML = `
    <span
      class="card-counter__control"
      data-card-action="minus"
      data-product-id="${id}"
      aria-label="Уменьшить количество"
    >−</span>
    <span class="card-counter__qty">${cartItem.qty}</span>
    <span
      class="card-counter__control"
      data-card-action="plus"
      data-product-id="${id}"
      aria-label="Увеличить количество"
    >+</span>
  `;
}

function syncCatalogButtons() {
  document
    .querySelectorAll(".product-card__btn, .sauce-item__btn")
    .forEach((btn) => {
      syncSingleCatalogButton(btn);
    });
}

document.addEventListener("change", (event) => {
  const option = event.target.closest("[data-product-option]");
  if (!option) return;

  const card = option.closest(".product-card");
  if (!card) return;

  syncProductCardOption(card);
  syncCatalogButtons();
});

document.addEventListener("click", handleAddToCart);

const commentTextarea = document.querySelector('textarea[name="comment"]');
const MAX_COMMENT_WORDS = 2000;

if (commentTextarea) {
  const normalizeCommentWords = () => {
    let words = commentTextarea.value.match(/\S+/g) || [];

    if (words.length > MAX_COMMENT_WORDS) {
      words = words.slice(0, MAX_COMMENT_WORDS);
      commentTextarea.value = words.join(" ");
    }
  };

  commentTextarea.addEventListener("input", normalizeCommentWords);
  commentTextarea.addEventListener("paste", () => {
    setTimeout(normalizeCommentWords, 0);
  });
}

function getSelectedMessengerValue(form, formData) {
  const directValue = normalizeText(formData.get("messenger") || "");
  if (directValue) return directValue;

  const checkedRadio = form?.querySelector('input[name="messenger"]:checked');
  if (checkedRadio) {
    return normalizeText(checkedRadio.value);
  }

  const activeEl = form?.querySelector(
    ".messenger-btn.active, .messenger-btn.is-active, .messenger-option.active, .messenger-option.is-active, [data-messenger].active, [data-messenger].is-active",
  );

  if (!activeEl) return "";

  return normalizeText(
    activeEl.value ||
      activeEl.dataset?.messenger ||
      activeEl.dataset?.value ||
      activeEl.textContent ||
      "",
  );
}

function getErrorMessage(error) {
  const raw = normalizeText(error?.message || "");
  const lower = raw.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("load failed") ||
    lower.includes("networkerror")
  ) {
    return "Не удалось связаться с сервером заказа. Проверь, что сервер запущен и адрес API указан правильно.";
  }

  if (lower.includes("405")) {
    return "Ошибка сервера 405";
  }

  if (lower.includes("400")) {
    return "Проверь заполнение полей заказа.";
  }

  if (lower.includes("timeout") || lower.includes("aborted")) {
    return "Сервер слишком долго отвечает. Попробуй еще раз.";
  }

  return raw || "Не удалось отправить заказ";
}

async function sendOrder(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    let result = null;

    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = {
        ok: response.ok,
        message: normalizeText(text) || `Ошибка сервера ${response.status}`,
      };
    }

    if (!response.ok) {
      throw new Error(result?.message || `Ошибка сервера ${response.status}`);
    }

    if (result && result.ok === false) {
      throw new Error(result.message || "Ошибка отправки заказа");
    }

    return result;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  } finally {
    clearTimeout(timeoutId);
  }
}

if (checkoutStep) {
  checkoutStep.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!state.items.length) return;

    if (!validateConsent()) {
      privacyConsent?.focus();
      return;
    }

    const submitBtn = document.getElementById("submitOrderBtn");
    const initialBtnText = submitBtn ? submitBtn.textContent : "";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Отправка...";
    }

    const formData = new FormData(checkoutStep);

    const payload = {
      customer: {
        fullName: normalizeText(formData.get("fullName")),
        phone: normalizeText(formData.get("phone")),
        messenger: getSelectedMessengerValue(checkoutStep, formData),
        messengerContact: normalizeText(formData.get("messengerContact")),
        comment: normalizeText(formData.get("comment")),
        delivery: normalizeText(formData.get("delivery")),
      },
      items: state.items,
      total: getTotalPrice(),
    };

    try {
      await sendOrder(payload);

      state.items = [];
      checkoutStep.reset();
      setConsentErrorState(false);
      renderCart();
      showItemsStep();
      closeDrawer();
      showSuccessPopup();
    } catch (error) {
      console.error("Ошибка отправки заказа:", error);
      alert(getErrorMessage(error));
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = initialBtnText || "Оформить заказ";
      }
    }
  });
}

syncAllProductCardOptions();
renderCart();

const newsTrack = document.getElementById("newsTrack");
const newsModal = document.getElementById("newsModal");
const newsModalClose = document.getElementById("newsModalClose");
const newsModalTitle = document.getElementById("newsModalTitle");
const newsModalText = document.getElementById("newsModalText");
const newsModalImage = document.getElementById("newsModalImage");
const newsModalLink = document.getElementById("newsModalLink");

if (newsTrack && newsModal) {
  let newsAnimationFrame = null;
  let lastFocusedNewsCard = null;
  let preventNewsClick = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let newsScrollRafId = 0;
  let newsScrollToken = 0;
  let lockedActiveNewsCard = null;

  function getAllNewsCards() {
    return Array.from(newsTrack.querySelectorAll(".news-card"));
  }

  function getTrackCenter() {
    const trackRect = newsTrack.getBoundingClientRect();
    return trackRect.left + trackRect.width / 2;
  }

  function getCardCenter(card) {
    const rect = card.getBoundingClientRect();
    return rect.left + rect.width / 2;
  }

  function isCardInFocus(card) {
    if (!card) return false;
    return Math.abs(getTrackCenter() - getCardCenter(card)) <= 24;
  }

  function updateActiveNewsCard() {
    const newsCards = getAllNewsCards();
    if (!newsCards.length) return;

    if (lockedActiveNewsCard) {
      newsCards.forEach((card) => {
        card.classList.toggle("is-active", card === lockedActiveNewsCard);
      });
      return;
    }

    const trackCenter = getTrackCenter();

    let closestCard = null;
    let minDistance = Infinity;

    newsCards.forEach((card) => {
      const cardCenter = getCardCenter(card);
      const distance = Math.abs(trackCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestCard = card;
      }
    });

    newsCards.forEach((card) => {
      card.classList.toggle("is-active", card === closestCard);
    });
  }

  function requestActiveNewsCardUpdate() {
    if (newsAnimationFrame) return;

    newsAnimationFrame = requestAnimationFrame(() => {
      updateActiveNewsCard();
      newsAnimationFrame = null;
    });
  }

  function getTargetScrollLeft(card) {
    const trackRect = newsTrack.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const rawTarget =
      newsTrack.scrollLeft +
      (cardRect.left - trackRect.left) -
      (trackRect.width - cardRect.width) / 2;

    const maxScrollLeft = newsTrack.scrollWidth - newsTrack.clientWidth;

    return Math.max(0, Math.min(rawTarget, maxScrollLeft));
  }

  function animateNewsTrackTo(targetScrollLeft, onComplete) {
    cancelAnimationFrame(newsScrollRafId);

    const startScrollLeft = newsTrack.scrollLeft;
    const distance = targetScrollLeft - startScrollLeft;

    if (Math.abs(distance) < 1) {
      newsTrack.scrollLeft = targetScrollLeft;
      updateActiveNewsCard();
      onComplete?.();
      return;
    }

    const duration = Math.min(1400, Math.max(850, Math.abs(distance) * 1.4));
    const token = ++newsScrollToken;
    const startTime = performance.now();

    newsTrack.classList.add("is-auto-scrolling");

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now) => {
      if (token !== newsScrollToken) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      newsTrack.scrollLeft = startScrollLeft + distance * eased;
      updateActiveNewsCard();

      if (progress < 1) {
        newsScrollRafId = requestAnimationFrame(step);
      } else {
        newsTrack.scrollLeft = targetScrollLeft;

        setTimeout(() => {
          newsTrack.classList.remove("is-auto-scrolling");
          updateActiveNewsCard();
          onComplete?.();
        }, 90);
      }
    };

    newsScrollRafId = requestAnimationFrame(step);
  }

  function focusCardAndOpen(card) {
    if (!card) return;

    lockedActiveNewsCard = card;
    updateActiveNewsCard();

    animateNewsTrackTo(getTargetScrollLeft(card), () => {
      lockedActiveNewsCard = null;
      updateActiveNewsCard();
      openNewsModal(card);
    });
  }

  function openNewsModal(card) {
    if (!card) return;

    lastFocusedNewsCard = card;

    const image = card.querySelector(".news-card__image");
    const title = card.querySelector(".news-card__title");
    const desc = card.querySelector(".news-card__desc");
    const full = card.querySelector(".news-card__full");

    newsModalTitle.textContent = title ? title.textContent.trim() : "";
    newsModalText.innerHTML = full
      ? full.innerHTML
      : `<p>${desc ? desc.textContent.trim() : ""}</p>`;

    if (image) {
      newsModalImage.src = image.getAttribute("src") || "";
      newsModalImage.alt = image.getAttribute("alt") || "";
    } else {
      newsModalImage.src = "";
      newsModalImage.alt = "";
    }

    newsModalLink.href = card.dataset.link || "https://t.me/mornin_rs";

    newsModal.classList.add("is-open");
    newsModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("news-modal-lock");
  }

  function closeNewsModal() {
    newsModal.classList.remove("is-open");
    newsModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("news-modal-lock");

    if (lastFocusedNewsCard) {
      lastFocusedNewsCard.focus();
    }
  }

  newsTrack.addEventListener(
    "scroll",
    () => {
      requestActiveNewsCardUpdate();
    },
    { passive: true },
  );

  newsTrack.addEventListener("pointerdown", (event) => {
    preventNewsClick = false;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;

    cancelAnimationFrame(newsScrollRafId);
    newsScrollToken += 1;
    lockedActiveNewsCard = null;
    newsTrack.classList.remove("is-auto-scrolling");
  });

  newsTrack.addEventListener("pointermove", (event) => {
    const deltaX = Math.abs(event.clientX - pointerStartX);
    const deltaY = Math.abs(event.clientY - pointerStartY);

    if (deltaX > 8 || deltaY > 8) {
      preventNewsClick = true;
    }
  });

  newsTrack.addEventListener("click", (event) => {
    const card = event.target.closest(".news-card");
    if (!card) return;

    if (preventNewsClick) {
      preventNewsClick = false;
      return;
    }

    if (isCardInFocus(card)) {
      openNewsModal(card);
      return;
    }

    focusCardAndOpen(card);
  });

  newsTrack.addEventListener("keydown", (event) => {
    const card = event.target.closest(".news-card");
    if (!card) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isCardInFocus(card)) {
        openNewsModal(card);
        return;
      }

      focusCardAndOpen(card);
    }
  });

  if (newsModalClose) {
    newsModalClose.addEventListener("click", closeNewsModal);
  }

  newsModal.addEventListener("click", (event) => {
    if (event.target === newsModal) {
      closeNewsModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && newsModal.classList.contains("is-open")) {
      closeNewsModal();
    }
  });

  window.addEventListener("load", () => {
    requestActiveNewsCardUpdate();
  });

  window.addEventListener("resize", () => {
    requestActiveNewsCardUpdate();
  });

  requestActiveNewsCardUpdate();
}

const heroCatalogBtn = document.querySelector(".brand-hero__btn--primary");
const catalogSection = document.querySelector("#catalog");

if (heroCatalogBtn && catalogSection) {
  heroCatalogBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const startY = window.pageYOffset;
    const targetY =
      catalogSection.getBoundingClientRect().top + window.pageYOffset - 24;
    const distance = targetY - startY;
    const duration = 1100;
    let startTime = null;

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateScroll = (currentTime) => {
      if (!startTime) startTime = currentTime;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  });
}

const backToCartLink = document.getElementById("backToCartLink");
const cartZone = document.getElementById("cart-zone");

function smoothScrollTo(targetY, duration = 1100) {
  const startY = window.pageYOffset;
  const distance = targetY - startY;
  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;

    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

if (backToCartLink && cartZone) {
  backToCartLink.addEventListener("click", (event) => {
    event.preventDefault();

    const offset = 20;
    const targetY =
      cartZone.getBoundingClientRect().top + window.pageYOffset - offset;

    smoothScrollTo(targetY, 1200);
  });
}