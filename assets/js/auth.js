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

const authLegalDocuments = {
  terms: {
    title: "Termos de Uso",
    kicker: "Documento legal",
    updated: "Versão vigente: 19 abr. 2026",
    html: `
      <section>
        <h4>1. Identificação do site e responsável</h4>
        <p>Estes Termos de Uso regulam o acesso e o uso do site Encontre Aqui Tech, disponível no domínio encontreaquitech.com, mantido por Paulo Gayo.</p>
      </section>
      <section>
        <h4>2. Finalidade da plataforma</h4>
        <p>O Encontre Aqui Tech é uma plataforma de conteúdo sobre tecnologia, notícias, novidades, curiosidades, alertas de segurança, tutoriais e indicações de produtos ou serviços relacionados ao universo digital.</p>
        <p>A área de cadastro pode ser usada para permitir acesso a recursos do site, preferências, interações, comunicações, funcionalidades futuras e uma experiência mais personalizada.</p>
      </section>
      <section>
        <h4>3. Cadastro e uso da conta</h4>
        <ul>
          <li>O usuário deve informar dados verdadeiros, atualizados e compatíveis com sua identidade.</li>
          <li>O cadastro exige nome, e-mail, senha e aceite destes Termos de Uso e da Política de Privacidade.</li>
          <li>O usuário é responsável por manter seus dados de acesso protegidos.</li>
          <li>O Encontre Aqui Tech poderá implementar verificação de e-mail, recuperação de senha e controles adicionais de segurança quando necessário.</li>
        </ul>
      </section>
      <section>
        <h4>4. Responsabilidades do usuário</h4>
        <p>Ao usar o site, o usuário concorda em não praticar atos que violem leis, direitos de terceiros, a segurança da plataforma ou a boa-fé nas interações.</p>
        <ul>
          <li>Não tentar acessar contas, dados ou áreas restritas sem autorização.</li>
          <li>Não enviar conteúdo ilícito, ofensivo, discriminatório, enganoso ou que infrinja propriedade intelectual.</li>
          <li>Não explorar falhas técnicas, automatizar acessos abusivos ou comprometer a disponibilidade do site.</li>
        </ul>
      </section>
      <section>
        <h4>5. Segurança da conta e senha</h4>
        <p>A senha deve ser forte, pessoal e mantida em sigilo. O Encontre Aqui Tech não solicita senha por e-mail, redes sociais ou mensagens diretas.</p>
        <p>Em caso de suspeita de acesso indevido, o usuário deve trocar sua senha e comunicar o canal de contato informado neste documento.</p>
      </section>
      <section>
        <h4>6. Suspensão ou exclusão de conta</h4>
        <p>Contas poderão ser suspensas ou excluídas quando houver indícios de fraude, abuso, violação destes Termos, uso indevido de recursos, determinação legal ou risco à segurança do site e de outros usuários.</p>
        <p>Sempre que razoável e tecnicamente possível, o usuário poderá ser informado sobre a medida adotada.</p>
      </section>
      <section>
        <h4>7. Propriedade intelectual</h4>
        <p>Textos, identidade visual, estrutura, imagens, marcas, elementos gráficos, códigos e demais conteúdos do site podem estar protegidos por direitos autorais, marcas e outras normas de propriedade intelectual.</p>
        <p>O acesso ao site não transfere ao usuário qualquer direito sobre esses elementos, salvo autorização expressa ou previsão legal aplicável.</p>
      </section>
      <section>
        <h4>8. Limitação de responsabilidade</h4>
        <p>O conteúdo do Encontre Aqui Tech tem finalidade informativa e editorial. O site busca manter as informações úteis e atualizadas, mas não garante ausência total de erros, indisponibilidades, alterações de terceiros ou mudanças posteriores em produtos, serviços, preços, regras ou tecnologias mencionadas.</p>
        <p>Indicações de produtos podem conter links de afiliado quando aplicável. O usuário deve avaliar informações, condições de compra, garantia e políticas de terceiros antes de tomar decisões.</p>
      </section>
      <section>
        <h4>9. Alterações dos Termos</h4>
        <p>Estes Termos podem ser atualizados para refletir mudanças legais, técnicas, operacionais ou novas funcionalidades. A versão vigente será indicada no cadastro.</p>
        <p>Quando uma alteração relevante impactar usuários cadastrados, o site poderá solicitar novo aceite ou informar a mudança por meios razoáveis.</p>
      </section>
      <section>
        <h4>10. Canal de contato</h4>
        <p>Dúvidas sobre estes Termos podem ser enviadas para contato@encontreaquitech.com.</p>
      </section>
    `
  },
  privacy: {
    title: "Política de Privacidade",
    kicker: "Privacidade e dados",
    updated: "Versão vigente: 19 abr. 2026",
    html: `
      <section>
        <h4>1. Identificação do controlador</h4>
        <p>Esta Política de Privacidade descreve práticas de tratamento de dados pessoais relacionadas ao site Encontre Aqui Tech, mantido por Paulo Gayo, no domínio encontreaquitech.com.</p>
      </section>
      <section>
        <h4>2. Dados que podem ser coletados</h4>
        <p>No cadastro e uso da área de conta, o site pode coletar e armazenar:</p>
        <ul>
          <li>Nome completo informado pelo usuário.</li>
          <li>E-mail usado para identificação e comunicação.</li>
          <li>Senha em formato de hash seguro, nunca em texto puro.</li>
          <li>Data e hora de criação da conta e de aceite dos documentos legais.</li>
          <li>Versão dos Termos de Uso e da Política de Privacidade aceita.</li>
          <li>Endereço IP e user agent associados ao aceite, quando tecnicamente disponíveis.</li>
          <li>Logs técnicos básicos de acesso, segurança e funcionamento do servidor, quando gerados pela hospedagem ou pelo sistema.</li>
        </ul>
      </section>
      <section>
        <h4>3. Finalidades do tratamento</h4>
        <ul>
          <li>Criar e administrar contas de usuários.</li>
          <li>Permitir login, autenticação, segurança e recuperação de acesso quando implementada.</li>
          <li>Registrar o aceite dos Termos de Uso e da Política de Privacidade.</li>
          <li>Melhorar a experiência do usuário e organizar funcionalidades futuras.</li>
          <li>Enviar comunicações relacionadas ao site, segurança, conta ou novidades, respeitando preferências e regras aplicáveis.</li>
          <li>Prevenir abuso, fraude, tentativas de acesso indevido e incidentes de segurança.</li>
          <li>Cumprir obrigações legais, regulatórias ou ordens de autoridades competentes.</li>
        </ul>
      </section>
      <section>
        <h4>4. Bases legais aplicáveis</h4>
        <p>O tratamento de dados poderá se apoiar, conforme o caso, em bases previstas na LGPD, como execução de contrato ou procedimentos preliminares relacionados à conta, cumprimento de obrigação legal ou regulatória, legítimo interesse para segurança e melhoria do serviço, consentimento quando exigido e exercício regular de direitos.</p>
        <p>A base legal adequada pode variar conforme a funcionalidade efetivamente ativada no site.</p>
      </section>
      <section>
        <h4>5. Compartilhamento de dados</h4>
        <p>Dados pessoais podem ser processados por provedores necessários à operação do site, como hospedagem, banco de dados, infraestrutura, ferramentas de segurança, serviços de e-mail e recursos operacionais. Atualmente, a hospedagem informada para publicação é a Hostinger.</p>
        <p>Também poderá haver compartilhamento quando necessário para cumprir obrigação legal, ordem judicial, requisição de autoridade competente, proteção de direitos ou apuração de incidentes.</p>
      </section>
      <section>
        <h4>6. Armazenamento e proteção</h4>
        <p>O site adota medidas técnicas e organizacionais compatíveis com seu porte e finalidade, incluindo conexão com banco por PDO, uso de prepared statements, hash de senha e controles de sessão.</p>
        <p>Nenhum sistema é absolutamente imune a riscos. Em caso de incidente relevante, serão avaliadas as medidas técnicas, administrativas e legais cabíveis.</p>
      </section>
      <section>
        <h4>7. Cookies e tecnologias similares</h4>
        <p>O site pode usar cookies essenciais para sessão de login, segurança e funcionamento da conta. Esses cookies são necessários para manter o usuário autenticado e não dependem de escolha promocional.</p>
        <p>Se no futuro forem adicionados analytics, publicidade, remarketing, pixels ou ferramentas equivalentes, esta Política deverá ser atualizada para explicar finalidades, provedores e opções de controle.</p>
      </section>
      <section>
        <h4>8. Direitos do titular</h4>
        <p>Nos termos da LGPD, o usuário pode solicitar, quando aplicável, confirmação de tratamento, acesso, correção, atualização, anonimização, bloqueio, eliminação, portabilidade, informação sobre compartilhamento, revogação de consentimento e revisão de decisões automatizadas, se houver.</p>
        <p>Algumas solicitações podem depender de validação de identidade, preservação de registros necessários, cumprimento de obrigações legais ou exercício regular de direitos.</p>
      </section>
      <section>
        <h4>9. Retenção e exclusão de dados</h4>
        <p>Dados de conta tendem a ser mantidos enquanto o usuário mantiver cadastro ativo ou enquanto forem necessários para cumprir finalidades legítimas, obrigações legais, segurança, prevenção de fraude ou exercício regular de direitos.</p>
        <p>Solicitações de exclusão podem ser enviadas ao canal de privacidade. A exclusão poderá preservar registros mínimos quando houver obrigação legal, necessidade de segurança ou outra base legal aplicável.</p>
      </section>
      <section>
        <h4>10. Contato para privacidade</h4>
        <p>Solicitações sobre dados pessoais podem ser enviadas para privacidade@encontreaquitech.com.</p>
      </section>
    `
  }
};

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
            <small class="auth-field-error" data-error-for="login_email"></small>
          </label>
          <label>
            <span>Senha</span>
            <span class="auth-password-field">
              <input type="password" name="password" autocomplete="current-password" placeholder="Sua senha" required data-auth-password-input>
              <button class="auth-password-toggle" type="button" data-auth-password-toggle aria-label="Mostrar senha" aria-pressed="false">Mostrar</button>
            </span>
            <small class="auth-field-error" data-error-for="login_password"></small>
          </label>
          <div class="auth-form-row">
            <button class="auth-link-button" type="button" data-auth-switch="forgot">Esqueci minha senha</button>
          </div>
          <button class="button button-primary auth-submit" type="submit">Entrar</button>
          <div class="auth-recovery-card" data-auth-login-help hidden>
            <strong>Não conseguiu entrar?</strong>
            <p>Confira o e-mail e a senha. Se preferir, envie um link seguro para criar uma nova senha.</p>
            <button type="button" data-auth-switch="forgot">Enviar link de redefinição</button>
          </div>
          <p class="auth-switch">Ainda não tem login? <button type="button" data-auth-switch="register">Crie sua conta</button></p>
        </form>

        <form class="auth-form" data-auth-panel="forgot" data-auth-forgot hidden novalidate>
          <div class="auth-reset-intro">
            <strong>Recuperação segura</strong>
            <p>Informe o e-mail cadastrado. Se a conta existir, enviaremos um link de uso único para redefinir sua senha.</p>
          </div>
          <label>
            <span>E-mail</span>
            <input type="email" name="email" autocomplete="email" maxlength="190" placeholder="voce@email.com" required>
            <small class="auth-field-error" data-error-for="reset_email"></small>
          </label>
          <button class="button button-primary auth-submit" type="submit">Enviar link seguro</button>
          <p class="auth-switch">Lembrou a senha? <button type="button" data-auth-switch="login">Voltar para entrar</button></p>
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
            <span class="auth-password-field">
              <input type="password" name="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required data-auth-password-input>
              <button class="auth-password-toggle" type="button" data-auth-password-toggle aria-label="Mostrar senha" aria-pressed="false">Mostrar</button>
            </span>
            <small class="auth-field-error" data-error-for="password"></small>
          </label>
          <label>
            <span>Confirmar senha</span>
            <span class="auth-password-field">
              <input type="password" name="password_confirmation" autocomplete="new-password" placeholder="Repita sua senha" required data-auth-password-input>
              <button class="auth-password-toggle" type="button" data-auth-password-toggle aria-label="Mostrar confirmação de senha" aria-pressed="false">Mostrar</button>
            </span>
            <small class="auth-field-error" data-error-for="password_confirmation"></small>
          </label>
          <label class="auth-check">
            <input type="checkbox" name="terms_accepted" required>
            <span>Li e concordo com os <button class="auth-inline-legal" type="button" data-auth-legal-open="terms">Termos de Uso</button> e a <button class="auth-inline-legal" type="button" data-auth-legal-open="privacy">Política de Privacidade</button>.</span>
          </label>
          <small class="auth-field-error" data-error-for="terms_accepted"></small>
          <p class="auth-password-hint">Use maiúscula, minúscula e número.</p>
          <button class="button button-primary auth-submit" type="submit">Criar conta</button>
          <p class="auth-switch">Já tem login? <button type="button" data-auth-switch="login">Entre agora</button></p>
        </form>
      </div>

      <p class="auth-status" data-auth-status aria-live="polite"></p>

      <div class="auth-legal-panel" data-auth-legal-panel role="dialog" aria-modal="true" aria-labelledby="auth-legal-title" hidden>
        <div class="auth-legal-card">
          <div class="auth-legal-toolbar">
            <div>
              <span data-auth-legal-kicker>Documento legal</span>
              <h3 id="auth-legal-title" data-auth-legal-title>Termos de Uso</h3>
              <p data-auth-legal-updated></p>
            </div>
            <button class="auth-legal-close" type="button" data-auth-legal-close aria-label="Fechar leitura">Fechar</button>
          </div>
          <div class="auth-legal-scroll" data-auth-legal-content tabindex="0"></div>
        </div>
      </div>
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
  const dialog = modal.querySelector(".auth-dialog");
  const status = modal.querySelector("[data-auth-status]");
  const tabs = modal.querySelectorAll("[data-auth-tab]");
  const panels = modal.querySelectorAll("[data-auth-panel]");
  const accessArea = modal.querySelector("[data-auth-access]");
  const connectedArea = modal.querySelector("[data-auth-connected]");
  const connectedName = modal.querySelector("[data-auth-user-name]");
  const loginForm = modal.querySelector("[data-auth-login]");
  const forgotForm = modal.querySelector("[data-auth-forgot]");
  const loginHelp = modal.querySelector("[data-auth-login-help]");
  const registerForm = modal.querySelector("[data-auth-register]");
  const logoutButton = modal.querySelector("[data-auth-logout]");
  const legalPanel = modal.querySelector("[data-auth-legal-panel]");
  const legalTitle = modal.querySelector("[data-auth-legal-title]");
  const legalKicker = modal.querySelector("[data-auth-legal-kicker]");
  const legalUpdated = modal.querySelector("[data-auth-legal-updated]");
  const legalContent = modal.querySelector("[data-auth-legal-content]");

  const closeLegalDocument = () => {
    if (!legalPanel) return;

    legalPanel.hidden = true;
    dialog?.classList.remove("has-legal-panel");
    if (legalContent) {
      legalContent.innerHTML = "";
    }
  };

  const openLegalDocument = (documentKey) => {
    const documentData = authLegalDocuments[documentKey];
    if (!documentData || !legalPanel || !legalTitle || !legalKicker || !legalUpdated || !legalContent) return;

    legalTitle.textContent = documentData.title;
    legalKicker.textContent = documentData.kicker;
    legalUpdated.textContent = documentData.updated;
    legalContent.innerHTML = documentData.html;
    legalContent.scrollTop = 0;
    legalPanel.hidden = false;
    dialog?.classList.add("has-legal-panel");
    window.setTimeout(() => legalContent.focus(), 40);
  };

  modal.querySelectorAll("[data-auth-password-toggle]").forEach((button) => {
    const field = button.closest(".auth-password-field");
    const input = field?.querySelector("[data-auth-password-input]");

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
    const activeTabName = panelName === "forgot" ? "login" : panelName;
    tabs.forEach((tab) => {
      const isActive = tab.dataset.authTab === activeTabName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.authPanel !== panelName;
    });

    setFieldErrors();
    setStatus();
    if (loginHelp) loginHelp.hidden = true;
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
    closeLegalDocument();
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

  const validateForgot = (formData) => {
    const email = String(formData.get("email") || "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        reset_email: "Informe um e-mail válido."
      };
    }

    return {};
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

  modal.querySelectorAll("[data-auth-legal-open]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openLegalDocument(button.dataset.authLegalOpen);
    });
  });

  modal.querySelectorAll("[data-auth-legal-close]").forEach((button) => {
    button.addEventListener("click", closeLegalDocument);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      if (legalPanel && !legalPanel.hidden) {
        closeLegalDocument();
        return;
      }

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
    setFieldErrors();
    if (loginHelp) loginHelp.hidden = true;

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const errors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.login_email = "Informe um e-mail válido.";
    if (!password) errors.login_password = "Informe sua senha.";

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setStatus("Revise os dados para entrar.", "error");
      return;
    }

    setStatus("Entrando...", "loading");

    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const data = await authApiRequest("login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      });

      authState.csrfToken = data.csrfToken || authState.csrfToken;
      authState.user = data.user || null;
      loginForm.reset();
      renderAuthState();
      setStatus(data.message || "Login realizado com sucesso.", "success");
    } catch (error) {
      if (error.status === 401 && loginHelp) {
        loginHelp.hidden = false;
      }
      setStatus(error.payload?.message || error.message, "error");
    } finally {
      submitButton.disabled = false;
    }
  });

  forgotForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await ensureSession();
    if (!authState.csrfToken) {
      setStatus("A conexão com o PHP ainda não está disponível.", "error");
      return;
    }
    setFieldErrors();

    const formData = new FormData(forgotForm);
    const errors = validateForgot(formData);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setStatus("Revise o e-mail informado.", "error");
      return;
    }

    setStatus("Preparando envio seguro...", "loading");
    const submitButton = forgotForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const data = await authApiRequest("request-password-reset", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email")
        })
      });

      forgotForm.reset();
      setStatus(data.message || "Se o e-mail estiver cadastrado, enviaremos as instruções.", "success");
    } catch (error) {
      setFieldErrors(error.payload?.errors || {});
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
