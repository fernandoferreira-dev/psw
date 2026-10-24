const albumCount = document.querySelector("#album-count");
const artistCount = document.querySelector("#artist-count");
const trackCount = document.querySelector("#track-count");
const rankingList = document.querySelector("#ranking-list");
const dashboardMessage = document.querySelector("#dashboard-message");

fetch("/users/dashboard")
  .then(async (response) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Não foi possivel carregar o dashboard.");
    }
    return data;
  })
  .then(({ stats, ranking }) => {
    albumCount.textContent = stats.albums.toLocaleString();
    artistCount.textContent = stats.artists.toLocaleString();
    trackCount.textContent = stats.tracks.toLocaleString();

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
  })
  .catch((error) => {
    dashboardMessage.textContent =
      error.message || "Não foi possivel realizar o pedido.";
  });
