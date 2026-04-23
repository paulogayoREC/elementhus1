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
const articleCommentForms = Array.from(document.querySelectorAll("[data-article-comment-form]"));
const articleCommentLists = Array.from(document.querySelectorAll("[data-article-comment-list]"));
const articleCommentNameStorageKey = "encontreAquiTechArticleComment:name";
const articleCommentMessageLimit = 500;
const mainScriptElement = document.currentScript;
const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
const feedbackApiBase = mainScriptElement?.src
  ? new URL("../../api/", mainScriptElement.src).toString()
  : new URL("/api/", window.location.origin).toString();
const feedbackState = {
  csrfToken: "",
  items: [],
  apiAvailable: true,
  hasLoaded: false
};
const articleCommentState = {
  itemsBySlug: new Map(),
  loadedSlugs: new Set()
};
const editorialCategories = window.editorialData?.categories || {};
let menuBackdrop = null;
let menuLastFocusedElement = null;

const queueIdleTask = (callback, timeout = 1200) => {
  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, { timeout });
  }

  return window.setTimeout(callback, 1);
};

const getFocusableElements = (root) => (
  Array.from(root?.querySelectorAll(focusableSelector) || []).filter((element) => (
    element.tabIndex >= 0
    && !element.closest("[hidden]")
    && !element.closest('[aria-hidden="true"]')
    && element.getAttribute("aria-hidden") !== "true"
  ))
);

const trapFocusWithin = (container, event) => {
  if (event.key !== "Tab") return;

  const focusableElements = getFocusableElements(container);
  if (!focusableElements.length) return;

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const ensureHoneypotField = (form) => {
  if (!form || form.querySelector('input[name="website"]')) return;

  const wrapper = document.createElement("div");
  wrapper.className = "bot-field";
  wrapper.setAttribute("aria-hidden", "true");

  const input = document.createElement("input");
  input.type = "text";
  input.name = "website";
  input.tabIndex = -1;
  input.autocomplete = "off";
  input.setAttribute("aria-hidden", "true");

  wrapper.append(input);
  form.prepend(wrapper);
};

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
  ".section-heading, .topic-card, .topic-card-preview, .topic-feature, .content-card, .feature-copy, .tech-picks-panel, .tech-pick-card, .feedback-form, .comment-stream, .portrait-wrap, .about-copy, .affiliate-note, .product-category, .curator-layout, .focus-panel, .article-hero-copy, .article-hero-figure, .article-content, .article-aside, .article-comment-panel, .article-archive-card"
);

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const ensureMenuBackdrop = () => {
  if (menuBackdrop) return menuBackdrop;

  menuBackdrop = document.createElement("button");
  menuBackdrop.type = "button";
  menuBackdrop.className = "site-menu-backdrop";
  menuBackdrop.hidden = true;
  menuBackdrop.setAttribute("aria-label", "Fechar menu");
  menuBackdrop.addEventListener("click", () => closeMenu());
  document.body.append(menuBackdrop);

  return menuBackdrop;
};

const focusFirstMenuItem = () => {
  getFocusableElements(menu)[0]?.focus();
};

const closeMenu = ({ restoreFocus = true } = {}) => {
  if (!menu || !menuToggle) return;
  menu.classList.remove("is-open");
  header?.classList.remove("menu-active");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");

  if (menuBackdrop) {
    menuBackdrop.classList.remove("is-visible");
    menuBackdrop.hidden = true;
  }

  if (restoreFocus && menuLastFocusedElement instanceof HTMLElement) {
    menuLastFocusedElement.focus();
  }
};

const openMenu = () => {
  if (!menu || !menuToggle) return;
  menuLastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : menuToggle;
  menu.classList.add("is-open");
  header?.classList.add("menu-active");
  document.body.classList.add("menu-open");
  menuToggle.setAttribute("aria-expanded", "true");

  const backdrop = ensureMenuBackdrop();
  backdrop.hidden = false;
  window.requestAnimationFrame(() => {
    backdrop.classList.add("is-visible");
  });
  window.setTimeout(focusFirstMenuItem, 40);
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
  link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
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

  if (menu?.classList.contains("is-open")) {
    trapFocusWithin(menu, event);
  }
});

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMenu({ restoreFocus: false });
  }
});
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

const openHashTargetDetails = () => {
  if (!window.location.hash) return;

  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = document.getElementById(id);
  const details = target?.closest("details");

  if (details instanceof HTMLDetailsElement) {
    details.open = true;
  }
};

window.addEventListener("hashchange", openHashTargetDetails);
openHashTargetDetails();

document.querySelectorAll("[data-archive-limit]").forEach((grid) => {
  const limit = Math.max(1, Number(grid.dataset.archiveLimit) || 5);
  const cards = Array.from(grid.querySelectorAll(".article-archive-card"));
  cards.slice(limit).forEach((card) => card.remove());
});

document.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const button = target.closest("[data-about-story-close]");

  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const details = button.closest("details");
  const summary = details?.querySelector("summary");

  if (!(details instanceof HTMLDetailsElement) || !(summary instanceof HTMLElement)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  details.open = false;
  window.requestAnimationFrame(() => {
    summary.focus();
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

const loadFeedbackWhenVisible = () => {
  if (!feedbackForm && !feedbackList) return;

  const trigger = feedbackForm?.closest(".community-section") || feedbackList;
  const startLoading = () => {
    if (feedbackState.hasLoaded) return;
    feedbackState.hasLoaded = true;
    loadFeedbackItems();
  };

  feedbackForm?.addEventListener("focusin", startLoading, { once: true });

  if (!trigger || !("IntersectionObserver" in window)) {
    queueIdleTask(startLoading);
    return;
  }

  const observer = new IntersectionObserver((entries, instance) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    instance.disconnect();
    startLoading();
  }, { rootMargin: "280px 0px" });

  observer.observe(trigger);
};

const formatCommentTimestamp = (value) => {
  if (!value) return "";

  const normalized = String(value).includes("T")
    ? String(value)
    : String(value).replace(" ", "T");
  const date = new Date(normalized.endsWith("Z") ? normalized : `${normalized}Z`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

const getArticleCommentSlugs = () => (
  [...new Set(articleCommentLists.map((list) => list.dataset.contentSlug).filter(Boolean))]
);

const renderArticleCommentItems = (contentSlug) => {
  const lists = articleCommentLists.filter((list) => list.dataset.contentSlug === contentSlug);
  const items = articleCommentState.itemsBySlug.get(contentSlug) || [];

  lists.forEach((list) => {
    list.textContent = "";
    list.classList.toggle("is-empty", !items.length);

    items.slice(0, 5).forEach((item) => {
      const card = document.createElement("article");
      card.className = "comment-card article-comment-card";

      const meta = document.createElement("div");
      meta.className = "comment-meta";

      const name = document.createElement("strong");
      name.textContent = item.name || "Visitante";

      const date = document.createElement("time");
      date.dateTime = item.createdAt || "";
      date.textContent = formatCommentTimestamp(item.createdAt);

      const message = document.createElement("p");
      message.textContent = item.message;

      meta.append(name, date);
      card.append(meta, message);
      list.append(card);
    });
  });
};

const loadArticleCommentItems = async (contentSlug) => {
  if (!contentSlug) return;

  try {
    const data = await feedbackApiRequest(`article-comments?content=${encodeURIComponent(contentSlug)}&limit=5`);
    articleCommentState.itemsBySlug.set(contentSlug, Array.isArray(data.comments) ? data.comments : []);
    renderArticleCommentItems(contentSlug);
  } catch {
    articleCommentState.itemsBySlug.set(contentSlug, []);
    renderArticleCommentItems(contentSlug);

    document
      .querySelectorAll(`[data-article-comment-status][data-content-slug="${contentSlug}"]`)
      .forEach((status) => {
        status.textContent = "Comentários disponíveis quando o site estiver conectado ao PHP e MySQL.";
      });
  }
};

const requestArticleCommentLoad = (contentSlug) => {
  if (!contentSlug || articleCommentState.loadedSlugs.has(contentSlug)) {
    return;
  }

  articleCommentState.loadedSlugs.add(contentSlug);
  loadArticleCommentItems(contentSlug);
};

const scheduleArticleCommentLoads = () => {
  if (!articleCommentLists.length) return;

  articleCommentForms.forEach((form) => {
    ensureHoneypotField(form);
    form.addEventListener("focusin", () => {
      requestArticleCommentLoad(form.dataset.contentSlug || "");
    }, { once: true });
  });

  if (!("IntersectionObserver" in window)) {
    queueIdleTask(() => {
      getArticleCommentSlugs().forEach(requestArticleCommentLoad);
    });
    return;
  }

  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      instance.unobserve(entry.target);
      requestArticleCommentLoad(entry.target.dataset.contentSlug || "");
    });
  }, { rootMargin: "240px 0px" });

  articleCommentLists.forEach((list) => observer.observe(list));
};

const updateArticleCommentCount = (form) => {
  const message = form.querySelector("[data-article-comment-message]");
  const count = form.querySelector("[data-article-comment-count]");

  if (!message || !count) return;

  const currentLength = message.value.length;
  count.textContent = `${currentLength}/${articleCommentMessageLimit} caracteres`;
  count.classList.toggle("is-near-limit", currentLength >= articleCommentMessageLimit * 0.9);
};

const restoreArticleCommentName = (form) => {
  const name = form.querySelector('input[name="name"]');
  if (!name) return;

  const storedName = window.localStorage.getItem(articleCommentNameStorageKey);
  if (storedName && !name.value) {
    name.value = storedName;
  }
};

const currentPageSlug = () => {
  const page = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
  return page;
};

const setupArticleCommentForms = () => {
  articleCommentForms.forEach((form) => {
    restoreArticleCommentName(form);
    updateArticleCommentCount(form);

    const messageField = form.querySelector("[data-article-comment-message]");
    messageField?.addEventListener("input", () => updateArticleCommentCount(form));

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const contentSlug = form.dataset.contentSlug || "";
      const contentTitle = form.dataset.contentTitle || "";
      const status = form.querySelector("[data-article-comment-status]");
      const submitButton = form.querySelector('button[type="submit"]');
      const submittedName = String(formData.get("name") || "").trim().slice(0, 48);
      const nextItem = {
        contentSlug,
        pageSlug: currentPageSlug(),
        contentTitle,
        name: submittedName || "Visitante",
        message: String(formData.get("message") || "").trim().slice(0, articleCommentMessageLimit),
        website: String(formData.get("website") || "").trim()
      };

      if (!nextItem.contentSlug || !nextItem.contentTitle || nextItem.message.length < 3) {
        if (status) {
          status.textContent = "Escreva um comentário antes de publicar.";
        }
        return;
      }

      if (submitButton) submitButton.disabled = true;
      if (status) {
        status.textContent = "Publicando comentário...";
      }

      try {
        await ensureFeedbackSession();

        if (!feedbackState.csrfToken) {
          throw new Error("Sessão indisponível. Atualize a página e tente novamente.");
        }

        const data = await feedbackApiRequest("article-comments", {
          method: "POST",
          body: JSON.stringify(nextItem)
        });

        window.localStorage.setItem(articleCommentNameStorageKey, nextItem.name);
        if (data.comment) {
          const previousItems = articleCommentState.itemsBySlug.get(contentSlug) || [];
          articleCommentState.itemsBySlug.set(contentSlug, [data.comment, ...previousItems].slice(0, 5));
          renderArticleCommentItems(contentSlug);
        } else {
          await loadArticleCommentItems(contentSlug);
        }

        form.reset();
        const name = form.querySelector('input[name="name"]');
        if (name) {
          name.value = nextItem.name;
        }
        updateArticleCommentCount(form);

        if (status) {
          status.textContent = data.message || "Comentário publicado.";
        }
      } catch (error) {
        if (status) {
          status.textContent = error.payload?.message || error.message || "Não foi possível publicar o comentário agora.";
        }
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
};

feedbackMessage?.addEventListener("input", updateFeedbackCount);
ensureHoneypotField(feedbackForm);

feedbackForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(feedbackForm);
  const nextItem = {
    name: String(formData.get("name") || "").trim().slice(0, 48),
    rating: Number(formData.get("rating") || 5),
    message: String(formData.get("message") || "").trim().slice(0, feedbackMessageLimit),
    website: String(formData.get("website") || "").trim(),
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
setupArticleCommentForms();
getArticleCommentSlugs().forEach((contentSlug) => {
  renderArticleCommentItems(contentSlug);
});
loadFeedbackWhenVisible();
scheduleArticleCommentLoads();
