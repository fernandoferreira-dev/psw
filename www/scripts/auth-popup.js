const authDialog = document.querySelector('#auth-dialog');
const authPanels = document.querySelectorAll('[data-auth-panel]');
const authNotice = document.querySelector('.auth-notice');

function showAuthView(view) {
  authPanels.forEach((panel) => {
    panel.hidden = panel.dataset.authPanel !== view;
  });
  authNotice.hidden = true;

  if (!authDialog.open) {
    authDialog.showModal();
  }

  const heading = authDialog.querySelector(`[data-auth-panel="${view}"] h2`);
  authDialog.setAttribute('aria-labelledby', heading.id);
}

document.querySelectorAll('[data-auth-view]').forEach((button) => {
  button.addEventListener('click', () => showAuthView(button.dataset.authView));
});

authDialog.querySelector('.dialog-close').addEventListener('click', () => {
  authDialog.close();
});

authDialog.addEventListener('click', (event) => {
  if (event.target === authDialog) {
    authDialog.close();
  }
});

authDialog.querySelectorAll('.auth-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    authNotice.hidden = false;
  });
});
