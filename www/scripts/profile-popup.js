const profileContainer = document.querySelector("#profile-dialog-container");

/**
 * Carrega a interface de autenticação, injeta o HTML e configura todos os eventos.
 */
async function loadProfileDialog() {
    // Procura e injeta o ficheiro HTML do diálogo de autenticação
    const response = await fetch("/pages/profile-dialog.html");
    if (!response.ok) throw new Error(`Unable to load auth form (${response.status}).`);

    profileContainer.innerHTML = await response.text();

    // Mapeamento dos elementos principais do DOM
    const authDialog = document.querySelector("#auth-dialog");
    const authPanels = document.querySelectorAll("[data-auth-panel]");
    const authNotice = document.querySelector(".auth-notice");

    /**
     * Utilitário para atualizar ou limpar as mensagens de aviso na UI.
     */
    const setNotice = (message = "") => {
        authNotice.textContent = message;
        authNotice.hidden = !message;
    };

    /**
     * Alterna a visibilidade entre o painel de "login" e "register".
     */
    function showAuthView(view) {
        // Exibe apenas o painel correspondente à vista pretendida
        authPanels.forEach((panel) => {
            panel.hidden = panel.dataset.authPanel !== view;
        });
        setNotice(); // Limpa avisos anteriores

        if (!authDialog.open) authDialog.showModal();

        // Associa o título ativo ao diálogo para acessibilidade (A11y)
        const heading = authDialog.querySelector(`[data-auth-panel="${view}"] h2`);
        if (heading) authDialog.setAttribute("aria-labelledby", heading.id);
    }

    // Fecha o modal ao clicar no fundo (backdrop) ou no botão de fecho
    authDialog.addEventListener("click", (event) => {
        if (event.target === authDialog || event.target.closest(".dialog-close")) {
            authDialog.close();
        }
    });

    // Alterna a vista ao clicar nos botões com a propriedade data-auth-view
    document.querySelectorAll("[data-auth-view]").forEach((button) => {
        button.addEventListener("click", () => showAuthView(button.dataset.authView));
    });

    // Gestão da submissão de formulários (Login e Registo)
    authDialog.querySelectorAll(".auth-form").forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault(); // Evita a recarga da página

            const panel = form.closest("[data-auth-panel]");
            const submitButton = form.querySelector('[type="submit"]');
            const isRegister = panel.dataset.authPanel === "register";

            // Prepara a UI para o estado de envio
            submitButton.disabled = true;
            setNotice("Espere");

            try {
                // Converte os dados do formulário num objeto JSON
                const payload = Object.fromEntries(new FormData(form));

                // Envia os dados para a rota correspondente (/users/register ou /users/login)
                const res = await fetch(`/users/${isRegister ? "register" : "login"}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.message || "Não foi possível realizar o pedido");

                if (isRegister) {
                    // No registo: limpa os campos, muda para a vista de login e mostra mensagem de sucesso
                    form.reset();
                    showAuthView("login");
                    setNotice(result.message);
                } else {
                    // No login: redireciona o utilizador para a área reservada
                    window.location.assign("/pages/dashboard.html");
                }
            } catch (error) {
                // Exibe qualquer erro de rede ou retornado pela API
                setNotice(error.message || "Não foi possível alcançar o servidor");
            } finally {
                // Reativa o botão de submissão no final
                submitButton.disabled = false;
            }
        });
    });
}

// Inicializa o diálogo e trata falhas no carregamento inicial
loadAuthDialog().catch((error) => {
    console.error(error);
    profileContainer.textContent = "Profile form could not be loaded.";
});