const albumCount = document.querySelector("#album-count");
const artistCount = document.querySelector("#artist-count");
const trackCount = document.querySelector("#track-count");
const albumList = document.querySelector("#album-list");
const artistList = document.querySelector("#artist-list");
const rankingList = document.querySelector("#ranking-list");
const dashboardMessage = document.querySelector("#dashboard-message");

const renderCollection = (list, items, emptyMessage) => {
  list.replaceChildren();
  if (items.length === 0) {
    const item = document.createElement("li");
    item.textContent = emptyMessage;
    list.append(item);
    return;
  }

  items.forEach(({ name }) => {
    const item = document.createElement("li");
    item.textContent = name;
    list.append(item);
  });
};

const loadDashboard = async () => {
  try {
    const response = await fetch("/users/dashboard");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Não foi possivel carregar o dashboard.");
    }

    const { stats, albums, artists, ranking } = data;
    albumCount.textContent = stats.albums.toLocaleString();
    artistCount.textContent = stats.artists.toLocaleString();
    trackCount.textContent = stats.tracks.toLocaleString();
    renderCollection(albumList, albums, "Ainda não existem albuns.");
    renderCollection(artistList, artists, "Ainda não existem artistas.");

    rankingList.replaceChildren();
    ranking.forEach((user, index) => {
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

loadDashboard();
