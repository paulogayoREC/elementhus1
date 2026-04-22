(() => {
  const panel = document.querySelector("[data-tech-picks-panel]");

  if (!panel || !("fetch" in window) || !("DOMParser" in window)) {
    return;
  }

  const sourcePages = [
    { category: "Monitores", url: "indicacoes/monitores.html" },
    { category: "Teclados", url: "indicacoes/teclados.html" },
    { category: "Mouse", url: "indicacoes/mouse.html" },
    { category: "Placa Mãe", url: "indicacoes/placa-mae.html" },
    { category: "Placa de Vídeo", url: "indicacoes/placa-de-video.html" },
    { category: "Fontes", url: "indicacoes/fontes.html" },
    { category: "Memórias e Armazenamento", url: "indicacoes/memorias-armazenamento.html" },
    { category: "Gabinetes", url: "indicacoes/gabinetes.html" },
    { category: "Fones", url: "indicacoes/fones.html" },
    { category: "Redes", url: "indicacoes/redes.html" },
    { category: "Cooler e Refrigeração", url: "indicacoes/cooler-refrigeracao.html" },
    { category: "Casa Inteligente", url: "indicacoes/casa-inteligente.html" },
    { category: "Smartphones", url: "indicacoes/smartphones.html" },
    { category: "Notebooks", url: "indicacoes/notebooks.html" },
    { category: "Desktops", url: "indicacoes/desktops.html" },
    { category: "PC Gamming", url: "indicacoes/pc-gamming.html" },
    { category: "Impressoras", url: "indicacoes/impressoras.html" },
    { category: "Tablets", url: "indicacoes/tablets.html" },
    { category: "Peças e Componentes", url: "indicacoes/pecas-componentes.html" },
    { category: "Games", url: "indicacoes/games.html" }
  ];

  const picksPerDay = 5;
  const siteTimeZone = "America/Recife";
  const rotationBaseDay = getDayNumber("2026-01-01");
  let activeDateKey = "";
  let productCatalog = [];

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function getSiteDateKey(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: siteTimeZone,
      year: "numeric"
    }).formatToParts(date);
    const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  }

  function getDayNumber(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);

    return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  }

  function hashString(value) {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function createRandom(seed) {
    let value = seed >>> 0;

    return () => {
      value += 0x6d2b79f5;
      let next = value;
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);

      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleProducts(products, seedText) {
    const shuffled = [...products];
    const random = createRandom(hashString(seedText));

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
  }

  function pickProductsForDay(products, dayNumber, previousIds) {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const picked = [];
      const pickedIds = new Set();
      const shuffled = shuffleProducts(products, `vitrine-tech:${dayNumber}:${attempt}`);

      for (const product of shuffled) {
        if (pickedIds.has(product.id) || previousIds.has(product.id)) {
          continue;
        }

        picked.push(product);
        pickedIds.add(product.id);

        if (picked.length === picksPerDay) {
          return picked;
        }
      }
    }

    return products.filter((product) => !previousIds.has(product.id)).slice(0, picksPerDay);
  }

  function getDailyProducts(products, dateKey) {
    const targetDay = getDayNumber(dateKey);
    const firstDay = Math.min(rotationBaseDay, targetDay);
    let previousIds = new Set();
    let selected = [];

    for (let day = firstDay; day <= targetDay; day += 1) {
      selected = pickProductsForDay(products, day, previousIds);
      previousIds = new Set(selected.map((product) => product.id));
    }

    return selected;
  }

  function createPickCard(product, index) {
    const card = document.createElement("a");
    card.className = index === 0 ? "tech-pick-card tech-pick-featured" : "tech-pick-card";
    card.href = product.href;
    card.target = "_blank";
    card.rel = "sponsored noopener noreferrer";
    card.dataset.techPickId = product.id;

    const category = document.createElement("span");
    category.className = "tech-pick-category";
    category.textContent = product.category;

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.alt;
    image.width = 900;
    image.height = 900;
    image.loading = "lazy";
    image.decoding = "async";

    const title = document.createElement("strong");
    title.textContent = product.title;

    const linkLabel = document.createElement("span");
    linkLabel.className = "tech-pick-link";
    linkLabel.textContent = "Encontre Aqui";

    card.append(category, image, title, linkLabel);

    return card;
  }

  function renderDailyShowcase() {
    if (productCatalog.length < picksPerDay * 2) {
      return;
    }

    const dateKey = getSiteDateKey();

    if (dateKey === activeDateKey) {
      return;
    }

    const dailyProducts = getDailyProducts(productCatalog, dateKey);

    if (dailyProducts.length < picksPerDay) {
      return;
    }

    panel.textContent = "";
    dailyProducts.forEach((product, index) => {
      panel.append(createPickCard(product, index));
    });

    activeDateKey = dateKey;
    panel.dataset.techPicksDate = dateKey;
  }

  async function fetchProductsFromSource(source) {
    const response = await fetch(source.url, {
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error(`Não foi possível carregar ${source.url}`);
    }

    const html = await response.text();
    const documentFragment = new DOMParser().parseFromString(html, "text/html");
    const sourceBaseUrl = new URL(source.url, window.location.href);

    return Array.from(documentFragment.querySelectorAll(".affiliate-product-card"))
      .map((card, index) => {
        const image = card.querySelector(".product-media img");
        const title = card.querySelector(".product-info h4");
        const link = card.querySelector(".product-buy-link[href]");
        const href = link?.getAttribute("href") || "";
        const imagePath = image?.getAttribute("src") || "";
        const productTitle = cleanText(title?.textContent);

        if (!href || !imagePath || !productTitle) {
          return null;
        }

        return {
          alt: cleanText(image?.getAttribute("alt")) || productTitle,
          category: source.category,
          href,
          id: `${source.url}:${href}:${index}`,
          image: new URL(imagePath, sourceBaseUrl).href,
          title: productTitle
        };
      })
      .filter(Boolean);
  }

  function normalizeCatalog(products) {
    const catalogByLink = new Map();

    products.forEach((product) => {
      if (!catalogByLink.has(product.href)) {
        catalogByLink.set(product.href, product);
      }
    });

    return Array.from(catalogByLink.values());
  }

  async function initTechShowcase() {
    const results = await Promise.allSettled(sourcePages.map(fetchProductsFromSource));
    productCatalog = normalizeCatalog(
      results.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    );

    renderDailyShowcase();

    window.setInterval(renderDailyShowcase, 30000);
  }

  initTechShowcase().catch(() => {
    productCatalog = [];
  });
})();
