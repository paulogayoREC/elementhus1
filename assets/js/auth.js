const authState = {
  csrfToken: "",
  user: null,
  apiAvailable: true
};

const authScriptElement = document.currentScript;
const authApiBase = authScriptElement?.src
  ? new URL("../../api/", authScriptElement.src).toString()
  : new URL("/api/", window.location.origin).toString();
const authPasswordIsStrong = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

const getFirstName = (name) => String(name || "Visitante").trim().split(/\s+/)[0] || "Visitante";

const closeSiteMenuForAuth = () => {
  document.querySelector("[data-menu]")?.classList.remove("is-open");
  document.querySelector("[data-header]")?.classList.remove("menu-active");
  document.body.classList.remove("menu-open");
  document.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "false");
};

const createAuthModal = () => {
  const wrapper = document.createElement("section");
  wrapper.className = "auth-modal-shell";
  wrapper.hidden = true;
  wrapper.dataset.authModal = "";
  wrapper.innerHTML = `
    <div class="auth-modal-backdrop" data-auth-close></div>
    <div class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" aria-describedby="auth-description">
      <button class="auth-close" type="button" data-auth-close aria-label="Fechar login">Fechar</button>

      <div class="auth-dialog-heading">
        <p class="auth-kicker">Conta Tech</p>
        <h2 id="auth-title">Acesse sua conta</h2>
        <p id="auth-description">Entre ou crie seu cadastro para acompanhar o Encontre Aqui Tech com mais praticidade.</p>
      </div>

      <div class="auth-connected" data-auth-connected hidden>
        <span class="auth-connected-badge">Conectado</span>
        <strong data-auth-user-name>Visitante</strong>
        <p>Seu acesso está ativo neste navegador.</p>
        <button class="button button-secondary" type="button" data-auth-logout>Sair da conta</button>
      </div>

      <div class="auth-access" data-auth-access>
        <div class="auth-tabs" role="tablist" aria-label="Acesso de usuário">
          <button class="auth-tab is-active" type="button" role="tab" aria-selected="true" data-auth-tab="login">Entrar</button>
          <button class="auth-tab" type="button" role="tab" aria-selected="false" data-auth-tab="register">Criar conta</button>
        </div>

        <form class="auth-form" data-auth-panel="login" data-auth-login novalidate>
          <label>
            <span>E-mail</span>
            <input type="email" name="email" autocomplete="email" placeholder="voce@email.com" required>
          </label>
          <label>
            <span>Senha</span>
            <input type="password" name="password" autocomplete="current-password" placeholder="Sua senha" required>
          </label>
          <button class="button button-primary auth-submit" type="submit">Entrar</button>
          <p class="auth-switch">Ainda não tem login? <button type="button" data-auth-switch="register">Crie sua conta</button></p>
        </form>

        <form class="auth-form" data-auth-panel="register" data-auth-register hidden novalidate>
          <label>
            <span>Nome completo</span>
            <input type="text" name="name" autocomplete="name" maxlength="120" placeholder="Seu nome completo" required>
            <small class="auth-field-error" data-error-for="name"></small>
          </label>
          <label>
            <span>E-mail</span>
            <input type="email" name="email" autocomplete="email" maxlength="190" placeholder="voce@email.com" required>
            <small class="auth-field-error" data-error-for="email"></small>
          </label>
          <label>
            <span>Senha</span>
            <input type="password" name="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required>
            <small class="auth-field-error" data-error-for="password"></small>
          </label>
          <label>
            <span>Confirmar senha</span>
            <input type="password" name="password_confirmation" autocomplete="new-password" placeholder="Repita sua senha" required>
            <small class="auth-field-error" data-error-for="password_confirmation"></small>
          </label>
          <label class="auth-check">
            <input type="checkbox" name="terms_accepted" required>
            <span>Li e concordo com os <a href="/termos-de-uso/" target="_blank" rel="noopener">Termos de Uso</a> e a <a href="/politica-de-privacidade/" target="_blank" rel="noopener">Política de Privacidade</a>.</span>
          </label>
          <small class="auth-field-error" data-error-for="terms_accepted"></small>
          <p class="auth-password-hint">Use maiúscula, minúscula e número.</p>
          <button class="button button-primary auth-submit" type="submit">Criar conta</button>
          <p class="auth-switch">Já tem login? <button type="button" data-auth-switch="login">Entre agora</button></p>
        </form>
      </div>

      <p class="auth-status" data-auth-status aria-live="polite"></p>
    </div>
  `;

  document.body.append(wrapper);
  return wrapper;
};

const authApiRequest = async (endpoint, options = {}) => {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {})
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
    headers["X-CSRF-Token"] = authState.csrfToken;
  }

  const response = await fetch(`${authApiBase}${endpoint}.php`, {
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

const initAuth = () => {
  const triggers = document.querySelectorAll("[data-auth-open]");
  if (!triggers.length) return;

  const modal = createAuthModal();
  const status = modal.querySelector("[data-auth-status]");
  const tabs = modal.querySelectorAll("[data-auth-tab]");
  const panels = modal.querySelectorAll("[data-auth-panel]");
  const accessArea = modal.querySelector("[data-auth-access]");
  const connectedArea = modal.querySelector("[data-auth-connected]");
  const connectedName = modal.querySelector("[data-auth-user-name]");
  const loginForm = modal.querySelector("[data-auth-login]");
  const registerForm = modal.querySelector("[data-auth-register]");
  const logoutButton = modal.querySelector("[data-auth-logout]");

  const setStatus = (message = "", type = "") => {
    status.textContent = message;
    status.dataset.statusType = type;
  };

  const setFieldErrors = (errors = {}) => {
    modal.querySelectorAll("[data-error-for]").forEach((element) => {
      element.textContent = errors[element.dataset.errorFor] || "";
    });
  };

  const updateTriggers = () => {
    triggers.forEach((trigger) => {
      if (authState.user) {
        trigger.textContent = `Olá, ${getFirstName(authState.user.name)}`;
        trigger.setAttribute("aria-label", "Abrir sua conta");
      } else {
        trigger.textContent = "Login";
        trigger.setAttribute("aria-label", "Abrir login e cadastro");
      }
    });
  };

  const selectPanel = (panelName) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.authTab === panelName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.authPanel !== panelName;
    });

    setFieldErrors();
    setStatus();
  };

  const renderAuthState = () => {
    updateTriggers();
    const isLoggedIn = Boolean(authState.user);
    accessArea.hidden = isLoggedIn;
    connectedArea.hidden = !isLoggedIn;

    if (authState.user) {
      connectedName.textContent = `${authState.user.name} · ${authState.user.email}`;
    }
  };

  const openModal = (panelName = "login") => {
    closeSiteMenuForAuth();
    renderAuthState();
    if (!authState.user) {
      selectPanel(panelName);
    }
    if (!authState.apiAvailable) {
      setStatus("A área de login precisa do site rodando com PHP na Hostinger ou em um servidor local.", "error");
    }
    modal.hidden = false;
    document.body.classList.add("auth-open");
    window.setTimeout(() => {
      const firstInput = modal.querySelector("[data-auth-panel]:not([hidden]) input, [data-auth-logout]");
      firstInput?.focus();
    }, 40);
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("auth-open");
    setStatus();
    setFieldErrors();
  };

  const ensureSession = async () => {
    if (authState.csrfToken) return;

    try {
      const data = await authApiRequest("session");
      authState.apiAvailable = true;
      authState.csrfToken = data.csrfToken || "";
      authState.user = data.user || null;
      renderAuthState();
    } catch {
      authState.apiAvailable = false;
      setStatus("A área de login estará disponível quando o site estiver rodando com PHP.", "error");
    }
  };

  const validateRegister = (formData) => {
    const errors = {};
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const passwordConfirmation = String(formData.get("password_confirmation") || "");
    const termsAccepted = Boolean(formData.get("terms_accepted"));

    if (!name) errors.name = "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail válido.";
    if (!authPasswordIsStrong(password)) errors.password = "Use 8 caracteres, maiúscula, minúscula e número.";
    if (password !== passwordConfirmation) errors.password_confirmation = "As senhas precisam ser iguais.";
    if (!termsAccepted) errors.terms_accepted = "Você precisa aceitar os Termos de Uso e a Política de Privacidade.";

    return errors;
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", async () => {
      await ensureSession();
      openModal("login");
    });
  });

  modal.querySelectorAll("[data-auth-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => selectPanel(tab.dataset.authTab));
  });

  modal.querySelectorAll("[data-auth-switch]").forEach((button) => {
    button.addEventListener("click", () => selectPanel(button.dataset.authSwitch));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await ensureSession();
    if (!authState.csrfToken) {
      setStatus("A conexão com o PHP ainda não está disponível.", "error");
      return;
    }
    setStatus("Entrando...", "loading");

    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const formData = new FormData(loginForm);
      const data = await authApiRequest("login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password")
        })
      });

      authState.csrfToken = data.csrfToken || authState.csrfToken;
      authState.user = data.user || null;
      loginForm.reset();
      renderAuthState();
      setStatus(data.message || "Login realizado com sucesso.", "success");
    } catch (error) {
      setStatus(error.payload?.message || error.message, "error");
    } finally {
      submitButton.disabled = false;
    }
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await ensureSession();
    if (!authState.csrfToken) {
      setStatus("A conexão com o PHP ainda não está disponível.", "error");
      return;
    }
    setFieldErrors();

    const formData = new FormData(registerForm);
    const errors = validateRegister(formData);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setStatus("Revise os campos destacados.", "error");
      return;
    }

    setStatus("Criando sua conta...", "loading");
    const submitButton = registerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const data = await authApiRequest("register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
          password_confirmation: formData.get("password_confirmation"),
          terms_accepted: Boolean(formData.get("terms_accepted"))
        })
      });

      authState.csrfToken = data.csrfToken || authState.csrfToken;
      authState.user = data.user || null;
      registerForm.reset();
      renderAuthState();
      setStatus(data.message || "Cadastro concluído.", "success");
    } catch (error) {
      setFieldErrors(error.payload?.errors || {});
      setStatus(error.payload?.message || error.message, "error");
    } finally {
      submitButton.disabled = false;
    }
  });

  logoutButton?.addEventListener("click", async () => {
    await ensureSession();
    if (!authState.csrfToken) {
      setStatus("A conexão com o PHP ainda não está disponível.", "error");
      return;
    }
    setStatus("Saindo...", "loading");

    try {
      const data = await authApiRequest("logout", {
        method: "POST",
        body: JSON.stringify({})
      });
      authState.csrfToken = data.csrfToken || authState.csrfToken;
      authState.user = null;
      renderAuthState();
      selectPanel("login");
      setStatus(data.message || "Você saiu da sua conta.", "success");
    } catch (error) {
      setStatus(error.payload?.message || error.message, "error");
    }
  });

  ensureSession();
};

initAuth();
