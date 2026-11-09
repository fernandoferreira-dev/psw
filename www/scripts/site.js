const headerContainer = document.querySelector("#site-header");
const pageName = document.body.dataset.page;
const COVER_PLACEHOLDER = "/images/album-cover-placeholder.svg";

// Devolve a capa do disco ou uma imagem padrão quando não existe capa.
function getCoverUrl(disc) {
    return disc.musica_capa || COVER_PLACEHOLDER;
}

// Constrói as opções de uma requisição com os dados de um formulário em JSON.
function formRequest(method, form) {
    return {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
    };
}

// Gera o HTML do disco favorito do utilizador autenticado.
function renderFavoriteSong(user) {
    if (!user.favorite_song_name) {
        return "<p class=\"loading\">Ainda não escolheste um disco favorito.</p>";
    }

    return `
        <a class="favorite-song-link" href="/pages/disc.html?id=${user.user_fav_musica}">
            <span class="record-art">
                <img class="album-cover" src="${user.favorite_song_cover || COVER_PLACEHOLDER}" alt="Capa de ${user.favorite_song_name}">
            </span>
            <span>
                <strong>${user.favorite_song_name}</strong>
                <small>${user.favorite_song_artist}</small>
            </span>
        </a>`;
}

// Gera o texto com o disco favorito visível no perfil público.
function renderPublicFavorite(user) {
    if (!user.favorite_song_name) {
        return "<p class=\"public-favorite\">Ainda não escolheu um favorito.</p>";
    }

    return `<p class="public-favorite">Favorito: <a href="/pages/disc.html?id=${user.user_fav_musica}"><strong>${user.favorite_song_name}</strong> · ${user.favorite_song_artist}</a></p>`;
}

// Centraliza o parsing das respostas e transforma erros da API em mensagens visíveis.
async function requestJson(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Não foi possível concluir o pedido.");
    return result;
}

// O header é criado depois de validar a sessão para manter as três páginas sincronizadas.
async function loadHeader() {
    try {
        // A API devolve os dados do utilizador autenticado.
        const user = await requestJson("/users/me");
        const initials = `${user.user_nome[0]}${user.user_sobrenome[0]}`.toUpperCase();
        headerContainer.innerHTML = `<header class="site-header"><a class="brand" href="/index.html"><span class="brand-mark">D</span><span>Discos</span></a><nav aria-label="Navegação principal"><a class="nav-link ${pageName === "dashboard" ? "active" : ""}" href="/index.html">Descobrir</a><a class="nav-link ${pageName === "collection" ? "active" : ""}" href="/pages/collection.html">A minha coleção</a><a class="nav-link ${pageName === "ranking" ? "active" : ""}" href="/pages/ranking.html">Ranking</a></nav><div class="header-actions"><a class="profile-link ${pageName === "profile" ? "active" : ""}" href="/pages/profile.html"><span class="avatar">${initials}</span><span>${user.user_nome}</span></a><button class="logout-button" id="logout" type="button">Sair</button></div></header>`;
        document.querySelector("#logout").addEventListener("click", async () => {
            await requestJson("/auth/logout", { method: "POST" });
            window.location.assign("/pages/login.html");
        });
        return user;
    } catch (error) {
        // Sem sessão válida, nenhuma página privada fica acessível.
        window.location.assign("/pages/login.html");
        return null;
    }
}

// Renderiza uma lista de discos no elemento indicado.
function renderMusic(discs, selector = "#music-list") {
    const list = document.querySelector(selector);
    list.innerHTML = discs.length ? discs.map((disc, index) => `<a class="music-card" href="/pages/disc.html?id=${disc.musica_id}" style="--delay: ${index * 70}ms"><span class="music-number">0${index + 1}</span><span class="record-art"><img class="album-cover" src="${getCoverUrl(disc)}" alt="Capa de ${disc.musica_nome}"></span><span class="music-info"><strong>${disc.musica_nome}</strong><span>${disc.musica_artista}</span><small>${disc.musica_album || "Single"}</small></span></a>`).join("") : "<p class=\"loading\">Ainda não existem músicas para mostrar.</p>";
}

// Obtém discos de um endpoint e mostra-os na lista de músicas.
async function loadMusic(endpoint = "/discs/random?limit=6") {
    renderMusic(await requestJson(endpoint));
}

// Solicita uma nova seleção aleatória de discos e atualiza o estado do botão.
async function shuffleMusic() {
    const button = document.querySelector("#refresh-music");
    const list = document.querySelector("#music-list");
    button.disabled = true;
    button.textContent = "A baralhar...";

    try {
        // O parâmetro impede que uma resposta anterior seja reutilizada pelo browser.
        await loadMusic(`/discs/random?limit=6&refresh=${Date.now()}`);
    } catch (error) {
        list.innerHTML = `<p class="loading">${error.message}</p>`;
    } finally {
        button.disabled = false;
        button.textContent = "Baralhar seleção";
    }
}

// Obtém o ranking e apresenta os utilizadores na ordem enviada pelo servidor.
async function loadRanking() {
    // O servidor já devolve os utilizadores ordenados.
    const ranking = await requestJson("/users/ranking");
    document.querySelector("#ranking-list").innerHTML = ranking.length ? ranking.map((user, index) => `<div class="ranking-row"><span class="rank-number">${String(index + 1).padStart(2, "0")}</span><div class="avatar ranking-avatar">${user.user_nome[0]}${user.user_sobrenome[0]}</div><div class="ranking-name"><strong>${user.user_nome} ${user.user_sobrenome}</strong><span>colecionador</span></div><strong class="music-count">${user.music_count} <small>${Number(user.music_count) === 1 ? "música" : "músicas"}</small></strong></div>`).join("") : "<p class=\"loading\">Ainda não existem utilizadores no ranking.</p>";
}

// Carrega os detalhes de um disco e configura a ação de favorito.
async function loadDiscDetail(user) {
    const discId = new URLSearchParams(window.location.search).get("id");
    const detail = document.querySelector("#disc-detail");
    const disc = await requestJson(`/discs/${discId}`);
    const isFavorite = Number(user.user_fav_musica) === Number(disc.musica_id);

    detail.innerHTML = `<div class="detail-cover"><img class="album-cover" src="${getCoverUrl(disc)}" alt="Capa de ${disc.musica_nome}"></div><div class="detail-copy"><p class="label">Detalhes do disco</p><h1>${disc.musica_nome}</h1><p class="detail-artist">${disc.musica_artista}</p><p class="detail-album">${disc.musica_album || "Single"} · ${disc.musica_data_lancamento ? String(disc.musica_data_lancamento).slice(0, 10) : "Data desconhecida"}</p>${disc.user_id ? `<p class="detail-contributor">Adicionado por <a href="/pages/user.html?id=${disc.user_id}">${disc.user_nome} ${disc.user_sobrenome}</a></p>` : "<p class=\"detail-contributor\">Adicionado pela comunidade</p>"}<button class="btn favorite-button ${isFavorite ? "is-favorite" : ""}" id="favorite-button" type="button" aria-pressed="${isFavorite}">${isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</button><p class="form-message" id="favorite-message" role="status" aria-live="polite"></p></div>`;

    document.querySelector("#favorite-button").addEventListener("click", async (event) => {
        const button = event.currentTarget;
        const message = document.querySelector("#favorite-message");
        button.disabled = true;
        try {
            if (button.classList.contains("is-favorite")) {
                await requestJson("/users/me/favorite", { method: "DELETE" });
                button.classList.remove("is-favorite");
                button.setAttribute("aria-pressed", "false");
                button.textContent = "Adicionar aos favoritos";
                user.user_fav_musica = null;
                message.textContent = "Favorito removido.";
            } else {
                await requestJson("/users/me/favorite", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ discId: disc.musica_id }) });
                button.classList.add("is-favorite");
                button.setAttribute("aria-pressed", "true");
                button.textContent = "Remover dos favoritos";
                user.user_fav_musica = disc.musica_id;
                message.textContent = "Adicionado aos favoritos.";
            }
        } catch (error) {
            message.textContent = error.message;
        } finally {
            button.disabled = false;
        }
    });
}

// Carrega um perfil público e os discos associados ao utilizador.
async function loadUserProfile() {
    const userId = new URLSearchParams(window.location.search).get("id");
    const user = await requestJson(`/users/${userId}`);
    const discs = await requestJson(`/discs/by-user/${userId}`);

    document.querySelector("#public-profile").innerHTML = `<div class="public-avatar avatar">${user.user_nome[0]}${user.user_sobrenome[0]}</div><div><p class="label">Perfil</p><h1>${user.user_nome} ${user.user_sobrenome}</h1><p class="lead">${user.music_count} ${Number(user.music_count) === 1 ? "disco adicionado" : "discos adicionados"} à comunidade.</p>${renderPublicFavorite(user)}</div>`;
    renderMusic(discs, "#user-discs");
}

// Carrega a coleção pessoal e configura adicionar, editar e remover discos.
async function loadCollection() {
    const discs = await requestJson("/discs/mine");
    const list = document.querySelector("#collection-list");
    const addForm = document.querySelector("#add-disc-form");

    if (!addForm.dataset.bound) {
        addForm.dataset.bound = "true";
        addForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const button = addForm.querySelector("[type=submit]");
            const message = document.querySelector("#add-disc-message");
            button.disabled = true;
            message.textContent = "A adicionar...";

            try {
                await requestJson("/discs/mine", formRequest("POST", addForm));
                addForm.reset();
                message.textContent = "Disco adicionado à tua coleção.";
                await loadCollection();
            } catch (error) {
                message.textContent = error.message;
            } finally {
                button.disabled = false;
            }
        });
    }

    if (discs.length === 0) {
        list.innerHTML = "<p class=\"loading\">Ainda não tens discos associados à tua conta.</p>";
        return;
    }

    list.innerHTML = discs.map((disc) => `<article class="collection-item"><button class="collection-summary" data-edit-disc type="button" aria-expanded="false"><span class="collection-cover"><img class="album-cover" src="${getCoverUrl(disc)}" alt="Capa de ${disc.musica_nome}"></span><span class="collection-summary-copy"><strong>${disc.musica_nome}</strong><span>${disc.musica_artista}</span></span><span class="collection-edit-label">Editar <span aria-hidden="true">+</span></span></button><form class="collection-form" data-disc-id="${disc.musica_id}" hidden><div class="collection-fields"><label>Título<input name="title" type="text" value="${disc.musica_nome}" required></label><label>Artista<input name="artist" type="text" value="${disc.musica_artista}" required></label><label>Álbum<input name="album" type="text" value="${disc.musica_album || "Single"}"></label><label>Data de lançamento<input name="releaseDate" type="date" value="${disc.musica_data_lancamento ? String(disc.musica_data_lancamento).slice(0, 10) : ""}"></label><label class="cover-field">Capa do álbum<input name="cover" type="text" value="${disc.musica_capa || ""}" placeholder="/images/covers/nome-da-capa.jpg"><small>Caminho local ou URL de imagem.</small></label></div><div class="collection-actions"><button class="btn btn-main" type="submit">Guardar</button><button class="btn btn-danger" data-delete-disc type="button">Remover</button><span class="form-message" data-collection-message role="status" aria-live="polite"></span></div></form></article>`).join("");

    list.querySelectorAll(".collection-form").forEach((form) => {
        const summary = form.parentElement.querySelector("[data-edit-disc]");

        summary.addEventListener("click", () => {
            const isOpen = !form.hidden;
            form.hidden = isOpen;
            summary.setAttribute("aria-expanded", String(!isOpen));
            form.parentElement.classList.toggle("is-open", !isOpen);
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const discId = form.dataset.discId;
            const message = form.querySelector("[data-collection-message]");
            const button = form.querySelector("[type=submit]");
            button.disabled = true;
            message.textContent = "A guardar...";

            try {
                await requestJson(`/discs/mine/${discId}`, formRequest("PUT", form));
                message.textContent = "Guardado.";
            } catch (error) {
                message.textContent = error.message;
            } finally {
                button.disabled = false;
            }
        });

        form.querySelector("[data-delete-disc]").addEventListener("click", async () => {
            if (!window.confirm("Queres remover este disco da tua coleção?")) return;

            try {
                await requestJson(`/discs/mine/${form.dataset.discId}`, { method: "DELETE" });
                await loadCollection();
            } catch (error) {
                form.querySelector("[data-collection-message]").textContent = error.message;
            }
        });
    });

}

// Carrega os dados do perfil autenticado e configura a edição do perfil.
async function loadProfile() {
    // Carrega os valores atuais para o utilizador os poder editar.
    const user = await requestJson("/users/me");
    document.querySelector("#first-name").value = user.user_nome;
    document.querySelector("#last-name").value = user.user_sobrenome;
    document.querySelector("#email").value = user.user_email;
    document.querySelector("#favorite-song").innerHTML = renderFavoriteSong(user); 2
    document.querySelector("#profile-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        // Bloqueia o botão durante o pedido para evitar envios duplicados.
        const message = document.querySelector("#profile-message");
        const button = event.currentTarget.querySelector("button");
        button.disabled = true;
        message.textContent = "A guardar...";
        try {
            await requestJson("/users/me", formRequest("PUT", event.currentTarget));
            message.textContent = "Perfil atualizado com sucesso.";
            document.querySelector("#password").value = "";
        } catch (error) { message.textContent = error.message; } finally { button.disabled = false; }
    });
}

// Inicializa o header e executa apenas o carregamento correspondente à página atual.
async function initializePage() {
    const user = await loadHeader();
    if (!user) return;
    try {
        if (pageName === "dashboard") {
            document.querySelector("#refresh-music").addEventListener("click", shuffleMusic);
            await loadMusic();
            document.querySelector("#disc-search").addEventListener("submit", async (event) => {
                event.preventDefault();
                const search = new FormData(event.currentTarget).get("discName").trim();
                await loadMusic(search ? `/discs/search?discName=${encodeURIComponent(search)}` : "/discs/random?limit=6");
            });
        }
        if (pageName === "collection") await loadCollection();
        if (pageName === "disc") await loadDiscDetail(user);
        if (pageName === "user") await loadUserProfile();
        if (pageName === "ranking") await loadRanking();
        if (pageName === "profile") await loadProfile();
    } catch (error) { const target = document.querySelector(".loading, .form-message"); if (target) target.textContent = error.message; }
}

initializePage();