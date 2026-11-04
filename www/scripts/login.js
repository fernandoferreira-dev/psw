const authViews = document.querySelectorAll("[data-auth-view]");
const authenticationMessage = document.querySelector("#authentication-message");
const authForms = document.querySelectorAll("[data-auth-form]");

function showAuthView(viewName) {
    authViews.forEach((view) => {
        view.hidden = view.dataset.authView !== viewName;
    });
    authenticationMessage.textContent = "";
}

document.querySelectorAll("[data-auth-switch]").forEach((button) => {
    button.addEventListener("click", () => showAuthView(button.dataset.authSwitch));
});

authForms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const authType = form.dataset.authForm;
        const submitButton = form.querySelector("[type=submit]");
        submitButton.disabled = true;
        authenticationMessage.textContent = authType === "register" ? "A criar conta..." : "A entrar...";

        try {
            const response = await fetch(`/auth/${authType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
            });
            const responseText = await response.text();
            let result = {};

            try {
                result = JSON.parse(responseText);
            } catch {
                throw new Error("O servidor devolveu uma resposta inválida.");
            }

            if (!response.ok) {
                throw new Error(result.message || result.error || "Não foi possível concluir o pedido.");
            }

            window.location.assign("/pages/dashboard.html");
        } catch (error) {
            authenticationMessage.textContent = error.message || "Não foi possível alcançar o servidor.";
            submitButton.disabled = false;
        }
    });
});