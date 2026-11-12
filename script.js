// Saida da tela de introdução
const intro = document.querySelector(".intro");

if (intro) {
    setTimeout(() => {
        intro.classList.add("sair");
    }, 100);
}

// Credenciais e URL da API TMDB
const url = 'https://api.themoviedb.org/3/movie/popular?language=pt-BR';
const token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkODVkN2RiZjI3OTAwMjg5MjIwM2QxMGYxMGI5YzcyZiIsIm5iZiI6MTc5MTgzODQ5Ni4zMDksInN1YiI6IjZhY2Q0OTIwNzMwZjgxMTZlNzhlN2U2NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5Ff6jfnUv6yNbWNAaHnaKG_5U_NPJbvs_uJNKPZEisA";

const filmesDestaqueContainer = document.querySelector(".filmes-destaque");
const errorMessageDiv = document.getElementById("error-message");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const tituloPrincipal = document.getElementById("titulo-principal");


// posicao: número do ranking (só na index). aoMudar: função chamada após favoritar/remover
function criarCard(item, posicao, aoMudar) {
    const card = document.createElement("div");
    card.classList.add("card-conteudo");
    card.innerHTML = `
        <div class="poster">
            <button type="button" class="favoritar"></button>
            <img src="${item.poster}" alt="${item.titulo}">
            ${posicao ? `<span class="numero-top">${posicao}</span>` : ""}
        </div>
        <h3>${item.titulo}</h3>
        <p class="nota">
            <span aria-label="estrelas">★</span>
            <strong>${Number(item.nota).toFixed(1)}</strong>
        </p>
    `;

    const botao = card.querySelector(".favoritar");
    atualizarBotao(botao, estaNaLista(item.id));

    botao.addEventListener("click", () => {
        if (estaNaLista(item.id)) {
            removerDaLista(item.id);
            atualizarBotao(botao, false);
        } else {
            adicionarNaLista(item);
            atualizarBotao(botao, true);
        }
        if (aoMudar) aoMudar();
    });

    return card;
}

function renderizarFilmes(filmes) {
    if (!filmesDestaqueContainer) return;
    filmesDestaqueContainer.innerHTML = "";

    filmes.forEach((filme, index) => {
        const card = criarCard(normalizarFilme(filme), index + 1);
        filmesDestaqueContainer.appendChild(card);
    });
}

// renderizar lista de filmes html
if (filmesDestaqueContainer) {
    carregarFilmesPopulares();
}


// requisição de filmes populares
function carregarFilmesPopulares() {
    fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Falha na resposta da API");
        }
        return response.json();
    })
    .then(data => {
        
        const top10Filmes = data.results.slice(0, 10);
        renderizarFilmes(top10Filmes);
    })
    .catch(error => {
        console.error("Erro ao buscar filmes:", error);
        // Exibe mensagem amigável na tela se falhar
        if (errorMessageDiv) {
            errorMessageDiv.textContent = "Ops! Não foi possível carregar os filmes em destaque no momento. Verifique sua conexão e tente novamente mais tarde.";
            errorMessageDiv.classList.remove("d-none");
        }
    });
}

// Executa a requisição ao carregar a página
carregarFilmesPopulares();

// 3. Implementação de Pelo Menos Três Tipos de Evento (click, input, submit)

// 'submit'
if (searchForm) {
    searchForm.addEventListener("submit", (evento) => {
        evento.preventDefault();
        alert(`Pesquisando por: ${searchInput.value}`);
    });
}

// 'input'
if (searchInput) {
    searchInput.addEventListener("input", (evento) => {
        console.log("Usuário digitando:", evento.target.value);
    });
}

// 'click'
if (tituloPrincipal) {
    tituloPrincipal.addEventListener("click", () => {
        alert("Você clicou no título principal do FIBFlix!");
    });
}

// ===== MINHA LISTA (localStorage) =====
const CHAVE_LISTA = "fibflix-minha-lista";

function lerLista() {
    try {
        return JSON.parse(localStorage.getItem(CHAVE_LISTA)) || [];
    } catch {
        return [];
    }
}

function salvarLista(lista) {
    localStorage.setItem(CHAVE_LISTA, JSON.stringify(lista));
}

function estaNaLista(id) {
    return lerLista().some(item => item.id === id);
}

function adicionarNaLista(item) {
    const lista = lerLista();
    if (!lista.some(i => i.id === item.id)) {
        lista.push(item);
        salvarLista(lista);
    }
}

function removerDaLista(id) {
    salvarLista(lerLista().filter(i => i.id !== id));
}


// Padroniza os dados da API (filmes usam "title", séries usam "name")
function normalizarFilme(filme) {
    return {
        id: filme.id,
        titulo: filme.title || filme.name,
        poster: filme.poster_path
            ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
            : "Fotos/Poster Filme.png",
        nota: filme.vote_average || 0
    };
}

function atualizarBotao(botao, naLista) {
    botao.textContent = naLista ? "♥" : "♡";
    botao.classList.toggle("ativo", naLista);
    botao.setAttribute(
        "aria-label",
        naLista ? "Remover da Minha Lista" : "Adicionar à Minha Lista"
    );
}


// ===== PÁGINA MINHA LISTA =====
const listaContainer = document.getElementById("lista-filmes");
const filtroOrdem = document.getElementById("filtro-ordem");
const mensagemVazia = document.getElementById("lista-vazia");

function renderizarMinhaLista() {
    if (!listaContainer) return;

    const lista = lerLista();

    if (filtroOrdem && filtroOrdem.value === "a-z") {
        lista.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
    } else if (filtroOrdem && filtroOrdem.value === "z-a") {
        lista.sort((a, b) => b.titulo.localeCompare(a.titulo, "pt-BR"));
    }

    listaContainer.innerHTML = "";
    mensagemVazia.classList.toggle("d-none", lista.length > 0);

    lista.forEach(item => {
        // sem posição de ranking; ao remover, redesenha a lista
        listaContainer.appendChild(criarCard(item, null, renderizarMinhaLista));
    });
}

if (filtroOrdem) {
    filtroOrdem.addEventListener("change", renderizarMinhaLista);
}

renderizarMinhaLista();