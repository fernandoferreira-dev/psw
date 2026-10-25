//dashboard
const albumCount = document.querySelector("#album-count");
const artistCount = document.querySelector("#artist-count");
const trackCount = document.querySelector("#track-count");
const albumList = document.querySelector("#album-list");
const artistList = document.querySelector("#artist-list");
const rankingList = document.querySelector("#ranking-list");
const dashboardMessage = document.querySelector("#dashboard-message");
const favoriteMessage = document.querySelector("#favorite-message");

//conta
const deleteAccountButton = document.querySelector("#delete-account-button");
const deleteAccountDialog = document.querySelector("#delete-account-dialog");
const cancelAccountDeletion = document.querySelector("#cancel-account-deletion");
const confirmAccountDeletion = document.querySelector("#confirm-account-deletion");
const deleteAccountMessage = document.querySelector("#delete-account-message");
let dashboardData;
const pendingFavorites = new Set();

const renderCollection = (list, items, emptyMessage, type, favoriteId) => {
  list.replaceChildren();
  if (items.length === 0) {
    const item = document.createElement("li");
    item.textContent = emptyMessage;
    list.append(item);
    return;
  }

  items.forEach(({ id, name }) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const button = document.createElement("button");
    const isFavorite = favoriteId != null && Number(favoriteId) === Number(id);

    label.textContent = name;
    button.className = "button button-favorite";
    button.type = "button";
    button.textContent = isFavorite ? "Favorito" : "Favoritar";
    button.disabled = pendingFavorites.has(type) || favoriteId != null;
    button.setAttribute("aria-pressed", String(isFavorite));
    button.setAttribute("aria-label", `${button.textContent}: ${name}`);
    button.addEventListener("click", () => saveFavorite(type, id));

    item.append(label, button);
    list.append(item);
  });
};

const renderCollections = () => {
  const { albums, artists, favorites } = dashboardData;
  renderCollection(
    albumList,
    albums,
    "Ainda não existem albuns.",
    "album",
    favorites.album,
  );
  renderCollection(
    artistList,
    artists,
    "Ainda não existem artistas.",
    "artist",
    favorites.artist,
  );
};

const saveFavorite = async (type, id) => {
  pendingFavorites.add(type);
  renderCollections();
  favoriteMessage.textContent = "A guardar favorito...";

  try {
    const response = await fetch("/users/favorites", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id: Number(id) }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Não foi possível guardar o favorito.");
    }

    dashboardData.favorites[type] = result.id;
    favoriteMessage.textContent = result.message;
  } catch (error) {
    favoriteMessage.textContent =
      error.message || "Não foi possível guardar o favorito.";
  } finally {
    pendingFavorites.delete(type);
    renderCollections();
  }
};

const loadDashboard = async () => {
  try {
    const response = await fetch("/users/dashboard", {
      credentials: "same-origin",
    }); //função para chamar o dashboard
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Não foi possivel carregar o dashboard.");
    }

    const { stats, ranking } = data;
    dashboardData = {
      ...data,
      albums: Array.isArray(data.albums) ? data.albums : [],
      artists: Array.isArray(data.artists) ? data.artists : [],
      favorites: {
        album: data.favorites?.album ?? null,
        artist: data.favorites?.artist ?? null,
      },
    };
    favoriteMessage.textContent = "";
    albumCount.textContent = stats.albums.toLocaleString();
    artistCount.textContent = stats.artists.toLocaleString();
    trackCount.textContent = stats.tracks.toLocaleString();
    renderCollections();

    rankingList.replaceChildren();
    ranking.forEach((user, index) => {
      //tabela de utilizadores
      const row = document.createElement("tr");
      const rankCell = document.createElement("td");
      const nameCell = document.createElement("td");
      const loginCell = document.createElement("td");

      rankCell.textContent = String(index + 1);
      nameCell.textContent = `${user.name} ${user.surname}`;
      loginCell.textContent = user.loginCount.toLocaleString();
      row.append(rankCell, nameCell, loginCell);
      rankingList.append(row);
    });

    dashboardMessage.textContent = ranking.length
      ? ""
      : "Ainda não há logins nenhuns.";
  } catch (error) {
    dashboardMessage.textContent =
      error.message || "Não foi possivel realizar o pedido.";
  }
};

deleteAccountButton.addEventListener("click", () => {
  deleteAccountMessage.textContent = "";
  deleteAccountDialog.showModal();
});

cancelAccountDeletion.addEventListener("click", () => {
  deleteAccountDialog.close();
});

//popup de apagar a conta
deleteAccountDialog.addEventListener("click", (event) => {
  if (event.target === deleteAccountDialog) {
    deleteAccountDialog.close();
  }
});

confirmAccountDeletion.addEventListener("click", async () => {
  confirmAccountDeletion.disabled = true;
  cancelAccountDeletion.disabled = true;
  deleteAccountMessage.textContent = "A eliminar conta...";

  try {
    const response = await fetch("/users/delete", { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Não foi possível eliminar a conta.");
    }

    window.location.assign("/");
  } catch (error) {
    deleteAccountMessage.textContent =
      error.message || "Não foi possível realizar o pedido.";
    confirmAccountDeletion.disabled = false;
    cancelAccountDeletion.disabled = false;
  }
});

loadDashboard();
