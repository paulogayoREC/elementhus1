const resetState = {
  csrfToken: "",
  token: new URLSearchParams(window.location.search).get("token") || ""
};

const resetScriptElement = document.currentScript;
const resetApiBase = resetScriptElement?.src
  ? new URL("../../api/", resetScriptElement.src).toString()
  : new URL("/api/", window.location.origin).toString();
const resetPasswordIsStrong = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
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

const resetApiRequest = async (endpoint, options = {}) => {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {})
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
    headers["X-CSRF-Token"] = resetState.csrfToken;
  }

  const response = await fetch(`${resetApiBase}${endpoint}.php`, {
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

const initPasswordReset = () => {
  const form = document.querySelector("[data-reset-password-form]");
  const status = document.querySelector("[data-reset-status]");
  const invalidPanel = document.querySelector("[data-reset-invalid]");
  const successPanel = document.querySelector("[data-reset-success]");
  if (!form || !status) return;

  ensureHoneypotField(form);

  const setStatus = (message = "", type = "") => {
    status.textContent = message;
    status.dataset.statusType = type;
  };

  const setFieldErrors = (errors = {}) => {
    document.querySelectorAll("[data-reset-error-for]").forEach((element) => {
      element.textContent = errors[element.dataset.resetErrorFor] || "";
    });
  };

  const ensureSession = async () => {
    if (resetState.csrfToken) return;

    const data = await resetApiRequest("session");
    resetState.csrfToken = data.csrfToken || "";
  };

  document.querySelectorAll("[data-reset-password-toggle]").forEach((button) => {
    const field = button.closest(".auth-password-field");
    const input = field?.querySelector("input");
    if (!input) return;

    button.addEventListener("click", () => {
      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      button.textContent = shouldShow ? "Ocultar" : "Mostrar";
      button.setAttribute("aria-pressed", String(shouldShow));
      button.setAttribute("aria-label", shouldShow ? "Ocultar senha" : "Mostrar senha");
      input.focus();
    });
  });

  if (!/^[a-f0-9]{64}$/.test(resetState.token)) {
    form.hidden = true;
    if (invalidPanel) invalidPanel.hidden = false;
    setStatus("Link inválido ou incompleto. Solicite um novo link de redefinição.", "error");
    return;
  }

  ensureSession().catch(() => {
    setStatus("A conexão com o PHP ainda não está disponível.", "error");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFieldErrors();

    const formData = new FormData(form);
    const password = String(formData.get("password") || "");
    const passwordConfirmation = String(formData.get("password_confirmation") || "");
    const errors = {};

    if (!resetPasswordIsStrong(password)) {
      errors.password = "Use 8 caracteres, maiúscula, minúscula e número.";
    }

    if (password !== passwordConfirmation) {
      errors.password_confirmation = "As senhas precisam ser iguais.";
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setStatus("Revise a nova senha.", "error");
      return;
    }

    try {
      await ensureSession();
    } catch {
      setStatus("A conexão com o PHP ainda não está disponível.", "error");
      return;
    }

    if (!resetState.csrfToken) {
      setStatus("Sessão expirada. Atualize a página e tente novamente.", "error");
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setStatus("Atualizando sua senha com segurança...", "loading");

    try {
      const data = await resetApiRequest("reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: resetState.token,
          password,
          password_confirmation: passwordConfirmation,
          website: String(formData.get("website") || "").trim()
        })
      });

      resetState.csrfToken = data.csrfToken || resetState.csrfToken;
      form.reset();
      form.hidden = true;
      if (window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (successPanel) successPanel.hidden = false;
      setStatus(data.message || "Senha alterada com segurança.", "success");
    } catch (error) {
      setFieldErrors(error.payload?.errors || {});
      setStatus(error.payload?.message || error.message, "error");
      if (error.status === 410 && invalidPanel) {
        form.hidden = true;
        invalidPanel.hidden = false;
      }
    } finally {
      submitButton.disabled = false;
    }
  });
};

initPasswordReset();
