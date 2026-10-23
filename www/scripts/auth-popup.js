const authDialog = document.querySelector("#auth-dialog");
const authPanels = document.querySelectorAll("[data-auth-panel]");
const authNotice = document.querySelector(".auth-notice");

function showAuthView(view) {
  authPanels.forEach((panel) => {
    panel.hidden = panel.dataset.authPanel !== view;
  });
  authNotice.hidden = true;
  authNotice.textContent = "";

  if (!authDialog.open) {
    authDialog.showModal();
  }

  const heading = authDialog.querySelector(`[data-auth-panel="${view}"] h2`);
  authDialog.setAttribute("aria-labelledby", heading.id);
}

document.querySelectorAll("[data-auth-view]").forEach((button) => {
  button.addEventListener("click", () => showAuthView(button.dataset.authView));
});

authDialog.querySelector(".dialog-close").addEventListener("click", () => {
  authDialog.close();
});

authDialog.addEventListener("click", (event) => {
  if (event.target === authDialog) {
    authDialog.close();
  }
});

authDialog.querySelectorAll(".auth-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const panel = form.closest("[data-auth-panel]");
    const submitButton = form.querySelector('[type="submit"]');
    const isRegister = panel.dataset.authPanel === "register";

    submitButton.disabled = true;
    authNotice.textContent = "Espere";
    authNotice.hidden = false;

    fetch(`/users/${isRegister ? "register" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.message || "Nao foi possivel realizar o pedido",
          );
        }
        return result;
      })
      .then((result) => {
        if (isRegister) {
          form.reset();
          showAuthView("login");
        }
        authNotice.textContent = result.message;
        authNotice.hidden = false;
      })
      .catch((error) => {
        authNotice.textContent =
          error.message || "Nao foi possivel alcançar o servidor";
        authNotice.hidden = false;
      })
      .finally(() => {
        submitButton.disabled = false;
      });
  });
});
