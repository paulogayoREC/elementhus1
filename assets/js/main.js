const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const feedbackForm = document.querySelector("[data-feedback-form]");
const feedbackList = document.querySelector("[data-feedback-list]");
const feedbackStatus = document.querySelector("[data-feedback-status]");
const feedbackMessage = document.querySelector("[data-feedback-message]");
const feedbackCount = document.querySelector("[data-feedback-count]");
const feedbackName = feedbackForm?.querySelector('input[name="name"]');
const feedbackNameStorageKey = "encontreAquiTechFeedback:name";
const feedbackMessageLimit = 500;
const mainScriptElement = document.currentScript;
const feedbackApiBase = mainScriptElement?.src
  ? new URL("../../api/", mainScriptElement.src).toString()
  : new URL("/api/", window.location.origin).toString();
const feedbackState = {
  csrfToken: "",
  items: [],
  apiAvailable: true
};
const editorialCategories = window.editorialData?.categories || {};

const formatEditorialDate = (value) => {
  if (!value) return "";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
};

const getEditorialItems = (key) => {
  const items = editorialCategories[key]?.items;
  return Array.isArray(items) ? items : [];
};

const getFeaturedEditorialItem = (key) => {
  const items = getEditorialItems(key);
  return items.find((item) => item.featured) || items[0];
};

const createTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  return element;
};

const renderHomeEditorialHighlights = () => {
  document.querySelectorAll("[data-editorial-feature]").forEach((card) => {
    const key = card.dataset.editorialFeature;
    const item = getFeaturedEditorialItem(key);
    const slot = card.querySelector("[data-feature-slot]");

    if (!item || !slot) return;

    const meta = [item.source, formatEditorialDate(item.date)].filter(Boolean).join(" · ");
    slot.textContent = "";

    slot.append(
      createTextElement("span", "topic-feature-label", "Destaque"),
      createTextElement("strong", "topic-feature-title", item.title),
      createTextElement("span", "topic-feature-meta", meta)
    );
  });
};

const renderTopicEditorialLists = () => {
  document.querySelectorAll("[data-topic-list]").forEach((list) => {
    const key = list.dataset.topicList;
    const items = getEditorialItems(key).slice(0, 2);

    list.textContent = "";

    items.forEach((item) => {
      const article = document.createElement("article");
      article.className = "content-card";

      const imageWrap = document.createElement("div");
      imageWrap.className = "content-card-media";

      const image = document.createElement("img");
      image.src = item.image || "assets/img/astronaut-earth.png";
      image.alt = "";
      image.loading = "lazy";
      imageWrap.append(image);

      const body = document.createElement("div");
      body.className = "content-card-body";

      const tag = createTextElement("span", "content-tag", item.tag || "Tecnologia");
      const title = createTextElement("h3", "", item.title);
      const summary = createTextElement("p", "", item.summary);
      const meta = createTextElement(
        "span",
        "content-meta",
        [item.source, formatEditorialDate(item.date)].filter(Boolean).join(" · ")
      );

      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ler na fonte";
      link.setAttribute("aria-label", `Ler na fonte: ${item.title}`);

      body.append(tag, title, summary, meta, link);
      article.append(imageWrap, body);
      list.append(article);
    });
  });
};

renderHomeEditorialHighlights();
renderTopicEditorialLists();

const revealTargets = document.querySelectorAll(
  ".section-heading, .topic-card, .topic-card-preview, .topic-feature, .content-card, .feature-copy, .tech-picks-panel, .tech-pick-card, .feedback-form, .comment-stream, .portrait-wrap, .about-copy, .affiliate-note, .product-category, .curator-layout, .focus-panel, .article-hero-copy, .article-hero-figure, .article-content, .article-aside"
);

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeMenu = () => {
  if (!menu || !menuToggle) return;
  menu.classList.remove("is-open");
  header?.classList.remove("menu-active");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

const openMenu = () => {
  if (!menu || !menuToggle) return;
  menu.classList.add("is-open");
  header?.classList.add("menu-active");
  document.body.classList.add("menu-open");
  menuToggle.setAttribute("aria-expanded", "true");
};

menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  if (expanded) {
    closeMenu();
  } else {
    openMenu();
  }
});

menu?.querySelectorAll("a, button").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const createMobileShareButton = () => {
  const shareButton = document.querySelector("[data-share-site]");

  if (!shareButton || !menuToggle || document.querySelector("[data-share-site-mobile]")) {
    return;
  }

  const mobileShareButton = shareButton.cloneNode(true);
  mobileShareButton.classList.add("nav-share-button-mobile");
  mobileShareButton.dataset.shareSiteMobile = "";
  menuToggle.before(mobileShareButton);
};

const copyShareUrl = async (url) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const field = document.createElement("textarea");
  field.value = url;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "-9999px";
  field.style.left = "-9999px";
  document.body.append(field);
  field.select();
  document.execCommand("copy");
  field.remove();
};

const setShareButtonFeedback = (button, message) => {
  const originalLabel = button.dataset.shareOriginalLabel || button.getAttribute("aria-label") || "Compartilhar";
  button.dataset.shareOriginalLabel = originalLabel;
  button.classList.add("is-copied");
  button.setAttribute("aria-label", message);
  button.title = message;

  window.clearTimeout(Number(button.dataset.shareTimer || 0));
  button.dataset.shareTimer = String(window.setTimeout(() => {
    button.classList.remove("is-copied");
    button.setAttribute("aria-label", originalLabel);
    button.title = "Compartilhar";
  }, 1800));
};

createMobileShareButton();

document.querySelectorAll("[data-share-site]").forEach((button) => {
  button.addEventListener("click", async () => {
    closeMenu();

    const url = button.dataset.shareUrl || window.location.origin;
    const shareData = {
      title: "Encontre Aqui Tech | Encontre Antes de Todo Mundo",
      text: "Notícias, Alertas de Segurança, Tutoriais, Curiosidades para viver melhor no mundo Tech!",
      url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await copyShareUrl(url);
      setShareButtonFeedback(button, "Link copiado");
    } catch (error) {
      if (error?.name === "AbortError") return;

      try {
        await copyShareUrl(url);
        setShareButtonFeedback(button, "Link copiado");
      } catch {
        setShareButtonFeedback(button, "Não foi possível copiar");
      }
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

if ("IntersectionObserver" in window) {
  revealTargets.forEach((target) => {
    target.setAttribute("data-reveal", "");
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const original = link.textContent;
    link.textContent = "Link Amazon em breve";
    window.setTimeout(() => {
      link.textContent = original;
    }, 1800);
  });
});

const feedbackApiRequest = async (endpoint, options = {}) => {
  const [path, query = ""] = endpoint.split("?");
  const headers = {
    Accept: "application/json",
    ...(options.headers || {})
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
    headers["X-CSRF-Token"] = feedbackState.csrfToken;
  }

  const response = await fetch(`${feedbackApiBase}${path}.php${query ? `?${query}` : ""}`, {
    credentials: "same-origin",
    ...options,
    headers
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {
      ok: false,
      message: "Resposta inesperada do servidor."
    };
  }

  if (!response.ok || data.ok === false) {
    const error = new Error(data.message || "Não foi possível concluir a ação.");
    error.payload = data;
    error.status = response.status;
    throw error;
  }

  return data;
};

const ensureFeedbackSession = async () => {
  if (feedbackState.csrfToken) return;

  const data = await feedbackApiRequest("session");
  feedbackState.csrfToken = data.csrfToken || "";
};

const restoreFeedbackName = () => {
  if (!feedbackName) return;

  const storedName = window.localStorage.getItem(feedbackNameStorageKey);
  if (storedName && !feedbackName.value) {
    feedbackName.value = storedName;
  }
};

const renderStars = (rating) => {
  const score = Math.max(1, Math.min(5, Number(rating) || 1));
  return "★".repeat(score) + "☆".repeat(5 - score);
};

const updateFeedbackCount = () => {
  if (!feedbackMessage || !feedbackCount) return;

  const currentLength = feedbackMessage.value.length;
  feedbackCount.textContent = `${currentLength}/${feedbackMessageLimit} caracteres`;
  feedbackCount.classList.toggle("is-near-limit", currentLength >= feedbackMessageLimit * 0.9);
};

const renderFeedbackItems = () => {
  if (!feedbackList) return;

  const items = feedbackState.items.slice(0, 5);
  feedbackList.textContent = "";
  feedbackList.classList.toggle("is-empty", !items.length);

  if (!items.length) {
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "comment-card";

    const meta = document.createElement("div");
    meta.className = "comment-meta";

    const name = document.createElement("strong");
    name.textContent = item.name || "Visitante";

    const stars = document.createElement("div");
    stars.className = "comment-stars";
    stars.setAttribute("aria-label", `${item.rating} de 5 estrelas`);
    stars.textContent = renderStars(item.rating);

    const message = document.createElement("p");
    message.textContent = item.message;

    meta.append(name, stars);
    card.append(meta, message);
    feedbackList.append(card);
  });
};

const loadFeedbackItems = async () => {
  if (!feedbackList) return;

  try {
    const data = await feedbackApiRequest("comments?limit=5");
    feedbackState.apiAvailable = true;
    feedbackState.items = Array.isArray(data.comments) ? data.comments : [];
    renderFeedbackItems();
  } catch {
    feedbackState.apiAvailable = false;
    feedbackState.items = [];
    renderFeedbackItems();
    if (feedbackStatus) {
      feedbackStatus.textContent = "Comentários disponíveis quando o site estiver conectado ao PHP e MySQL.";
    }
  }
};

feedbackMessage?.addEventListener("input", updateFeedbackCount);

feedbackForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(feedbackForm);
  const nextItem = {
    name: String(formData.get("name") || "").trim().slice(0, 48),
    rating: Number(formData.get("rating") || 5),
    message: String(formData.get("message") || "").trim().slice(0, feedbackMessageLimit),
    createdAt: Date.now()
  };

  if (!nextItem.name || !nextItem.message || nextItem.rating < 1 || nextItem.rating > 5) {
    if (feedbackStatus) {
      feedbackStatus.textContent = "Preencha nome, mensagem e uma nota de 1 a 5 estrelas.";
    }
    return;
  }

  const submitButton = feedbackForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  if (feedbackStatus) {
    feedbackStatus.textContent = "Publicando no banco de dados...";
  }

  try {
    await ensureFeedbackSession();

    if (!feedbackState.csrfToken) {
      throw new Error("Sessão indisponível. Atualize a página e tente novamente.");
    }

    const data = await feedbackApiRequest("comments", {
      method: "POST",
      body: JSON.stringify(nextItem)
    });

    window.localStorage.setItem(feedbackNameStorageKey, nextItem.name);
    if (data.comment) {
      feedbackState.items = [data.comment, ...feedbackState.items].slice(0, 5);
    } else {
      await loadFeedbackItems();
    }

    renderFeedbackItems();
    feedbackForm.reset();
    if (feedbackName) {
      feedbackName.value = nextItem.name;
    }
    updateFeedbackCount();

    if (feedbackStatus) {
      feedbackStatus.textContent = data.message || `Comentário publicado com ${nextItem.rating} de 5 estrelas.`;
    }
  } catch (error) {
    if (feedbackStatus) {
      feedbackStatus.textContent = error.payload?.message || error.message || "Não foi possível publicar o comentário agora.";
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

restoreFeedbackName();
updateFeedbackCount();
renderFeedbackItems();
loadFeedbackItems();
