// Saida da tela de introdução
const intro = document.querySelector(".intro");

if (intro) {
    setTimeout(() => {
        intro.classList.add("sair");
    }, 100);
}

// Credenciais e URL da API TMDB
const url = 'https://api.themoviedb.org/3/movie/popular?language=pt-BR'
const url_series = 'https://api.themoviedb.org/3/tv/popular?language=pt-BR'
const url_genero = 'https://api.themoviedb.org/3/discover/'   // filme ou serie
const url_busca = 'https://api.themoviedb.org/3/search/'   // Busca
const url_detalhes = 'https://api.themoviedb.org/3/'   // + movie ou tv + /ID

// Gêneros
const generos = {
    "Ação":                         { movie: 28, tv: 10759 },
    "Aventura":                     { movie: 12 },
    "Ação e Aventura":              { tv: 10759 },
    "Animação":                     { movie: 16, tv: 16 },
    "Comédia":                      { movie: 35, tv: 35 },
    "Drama":                        { movie: 18, tv: 18 },
    "Ficção científica e fantasia": { tv: 10765 },
    "Fantasia":                     { movie: 14,    tv: 10765 },
    "Ficção científica":            { movie: 878,   tv: 10765 },
    "Romance":                      { movie: 10749 },
    "Suspense":                     { movie: 53 },
    "Terror":                       { movie: 27 }
};

const token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkODVkN2RiZjI3OTAwMjg5MjIwM2QxMGYxMGI5YzcyZiIsIm5iZiI6MTc5MTgzODQ5Ni4zMDksInN1YiI6IjZhY2Q0OTIwNzMwZjgxMTZlNzhlN2U2NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5Ff6jfnUv6yNbWNAaHnaKG_5U_NPJbvs_uJNKPZEisA";

const filmesDestaqueContainer = document.querySelector(".filmes-borda");
const seriesDestaqueContainer = document.querySelector(".series-borda");
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

    const alternar = () => {
        if (estaNaLista(item.id)) {
            removerDaLista(item.id);
            atualizarBotao(botao, false);
        } else {
            adicionarNaLista(item);
            atualizarBotao(botao, true);
        }
        if (aoMudar) aoMudar();
    };

    botao.addEventListener("click", alternar);
    card.querySelector(".poster").addEventListener("click", e => {
        if (!e.target.closest(".favoritar")) abrirDetalhes(item, alternar);   // o coração não abre a janela
    });

    return card;
}

// ===== VISUALIZADOR DE FOTOS (X e setas) =====
let visualizador, fotos = [], posicao = 0;

function abrirFoto(lista, indice) {
    fotos = lista;
    posicao = indice;
    if (!visualizador) {
        visualizador = document.createElement("dialog");
        visualizador.className = "visualizador";
        visualizador.innerHTML = `
            <button type="button" class="vis-fechar" aria-label="Fechar">✕</button>
            <button type="button" class="vis-seta vis-anterior" aria-label="Foto anterior">‹</button>
            <img alt="">
            <button type="button" class="vis-seta vis-proxima" aria-label="Próxima foto">›</button>
            <span class="vis-contador"></span>`;
        visualizador.addEventListener("click", e => {
            if (e.target.closest(".vis-anterior")) trocarFoto(-1);
            else if (e.target.closest(".vis-proxima")) trocarFoto(1);
            else if (e.target.tagName !== "IMG") visualizador.close();   // X ou clicar fora da foto fecha
        });
        visualizador.addEventListener("keydown", e => {   // ESC já fecha sozinho (dialog)
            if (e.key === "ArrowLeft") trocarFoto(-1);
            if (e.key === "ArrowRight") trocarFoto(1);
        });
        document.body.appendChild(visualizador);
    }
    mostrarFoto();
    visualizador.showModal();
}

function trocarFoto(passo) {
    posicao = (posicao + passo + fotos.length) % fotos.length;   // volta ao começo/fim
    mostrarFoto();
}

function mostrarFoto() {
    visualizador.querySelector("img").src = fotos[posicao];
    visualizador.querySelector(".vis-contador").textContent = `${posicao + 1} / ${fotos.length}`;
}

// ===== JANELA DE DETALHES (clicar no pôster) =====
let janela, versao = 0;

function abrirDetalhes(item, alternar) {
    if (!janela) {
        janela = document.createElement("dialog");
        janela.className = "janela-detalhes";
        janela.addEventListener("click", e => { if (e.target === janela) janela.close(); });   // clicar fora fecha
        janela.addEventListener("close", () => janela.innerHTML = "");   // esvazia ao fechar: senão o trailer continua tocando
        document.body.appendChild(janela);
    }
    janela.innerHTML = `
        <div class="detalhes-conteudo">
            <h3 class="detalhes-titulo">${item.titulo}</h3>
            <div class="detalhes-corpo">
                <img src="${item.poster}" alt="${item.titulo}">
                <div>
                    <div class="abas">
                        <button type="button" class="aba ativa" data-aba="info">Informações</button>
                        <button type="button" class="aba" data-aba="assistir">Onde assistir</button>
                    </div>
                    <dl data-painel="info"><dd>Carregando...</dd></dl>
                    <div data-painel="assistir" hidden>
                        <dl><dd>Carregando...</dd></dl>
                        <small class="fonte">Dados de streaming: JustWatch</small>
                    </div>
                </div>
            </div>
            <div class="detalhes-botoes">
                <button type="button" class="btn-voltar">Voltar</button>
                <button type="button" class="btn-ver-mais"></button>
            </div>
        </div>`;

    const info = janela.querySelector('[data-painel="info"]');
    const assistir = janela.querySelector('[data-painel="assistir"] dl');
    janela.querySelectorAll(".aba").forEach(botao => botao.addEventListener("click", () => {   // troca de aba
        janela.querySelectorAll(".aba").forEach(b => b.classList.toggle("ativa", b === botao));
        janela.querySelectorAll("[data-painel]").forEach(p => p.hidden = p.dataset.painel !== botao.dataset.aba);
    }));
    const incluir = janela.querySelector(".btn-ver-mais");
    const textoIncluir = () => incluir.textContent = estaNaLista(item.id) ? "Remover da lista" : "Incluir na lista";
    textoIncluir();
    incluir.addEventListener("click", () => { alternar(); textoIncluir(); });
    janela.querySelector(".btn-voltar").addEventListener("click", () => janela.close());
    janela.showModal();

    if (!item.tipo) {   // favoritos antigos não guardaram se é filme ou série
        info.textContent = assistir.textContent = "Remova da lista e favorite de novo para ver os detalhes.";
        return;
    }

    const minha = ++versao;
    const opcoes = { headers: { "Authorization": `Bearer ${token}` } };
    const img = "https://image.tmdb.org/t/p/";
    const preencher = (dl, linhas) => {   // monta os pares título/valor (pula os vazios)
        dl.innerHTML = "";
        linhas.forEach(([rotulo, valor]) => {
            if (!valor) return;
            dl.insertAdjacentHTML("beforeend", `<dt>${rotulo}</dt><dd></dd>`);
            dl.lastElementChild.append(valor);   // append = texto seguro (ou o elemento)
        });
    };

    // --- aba Informações ---
    fetch(`${url_detalhes}${item.tipo}/${item.id}?language=pt-BR&append_to_response=credits,videos,keywords,images&include_video_language=pt,en&include_image_language=pt,en,null`, opcoes)
    .then(response => response.json())
    .then(d => {
        if (minha !== versao) return;   // abriu outro título enquanto este carregava
        const filme = item.tipo === "movie";
        const trailer = d.videos.results.find(v => v.site === "YouTube" && v.type === "Trailer");
        const player = trailer && Object.assign(document.createElement("div"), { innerHTML: `
            <iframe src="https://www.youtube.com/embed/${trailer.key}" title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            <a class="link-youtube" href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" rel="noopener">Se não carregar, abrir no YouTube ↗</a>` });
        const faixa = (lista, mini, grande, classe) => {   // fileira de miniaturas; clicar abre o visualizador
            if (!lista.length) return null;
            const div = document.createElement("div");
            div.className = "faixa-fotos " + classe;
            const grandes = lista.map(f => `${img}${grande}${f.file_path}`);
            lista.forEach((f, i) => {
                const botao = document.createElement("button");
                botao.type = "button";
                botao.innerHTML = `<img src="${img}${mini}${f.file_path}" alt="Foto ${i + 1}" loading="lazy">`;
                botao.addEventListener("click", () => abrirFoto(grandes, i));
                div.appendChild(botao);
            });
            return div;
        };
        const posteres = d.images.posters.filter(p => p.file_path !== d.poster_path).slice(0, 8);
        preencher(info, [
            ["Título original", d.original_title || d.original_name],
            ["Ano", (d.release_date || d.first_air_date || "").slice(0, 4)],
            [filme ? "Orçamento" : "Temporadas", filme ? (d.budget ? "US$ " + d.budget.toLocaleString("pt-BR") : "Não informado") : d.number_of_seasons],
            ["Gêneros", d.genres.map(g => g.name).join(", ")],
            ["Atores", d.credits.cast.slice(0, 6).map(a => a.name).join(", ")],
            ["Sinopse", d.overview || "Sem sinopse em português."],
            ["Palavras-chave", (d.keywords.keywords || d.keywords.results).slice(0, 8).map(k => k.name).join(", ")],
            ["Avaliações", `★ ${d.vote_average.toFixed(1)} (${d.vote_count} votos)`],
            ["Trailer", player || "Não disponível"],
            ["Fotos", faixa(d.images.backdrops.slice(0, 10), "w300", "w1280", "fotos")],
            ["Pôsteres", faixa(posteres, "w185", "w780", "posteres")]
        ]);
    })
    .catch(() => { if (minha === versao) info.textContent = "Não foi possível carregar os detalhes."; });

    // --- aba Onde assistir (endpoint próprio; resultado do Brasil) ---
    fetch(`${url_detalhes}${item.tipo}/${item.id}/watch/providers`, opcoes)
    .then(response => response.json())
    .then(w => {
        if (minha !== versao) return;
        const br = w.results.BR || {};
        const provedores = (lista = []) => {   // logos + nomes dos serviços
            if (!lista.length) return null;
            const div = document.createElement("div");
            div.className = "provedores";
            lista.forEach(p => {
                const span = document.createElement("span");
                span.className = "provedor";
                span.innerHTML = `<img src="${img}w92${p.logo_path}" alt=""><span></span>`;
                span.lastElementChild.textContent = p.provider_name;
                div.appendChild(span);
            });
            return div;
        };
        preencher(assistir, [
            ["Streaming", provedores([...(br.flatrate || []), ...(br.free || []), ...(br.ads || [])]) || "Não encontramos nenhum streaming."],
            ["Alugar", provedores(br.rent)],
            ["Comprar", provedores(br.buy)]
        ]);
    })
    .catch(() => { if (minha === versao) assistir.textContent = "Não foi possível carregar onde assistir."; });
}

function renderizarFilmes(filmes) {
    if (!filmesDestaqueContainer) return;
    filmesDestaqueContainer.innerHTML = "";

    filmes.forEach((filme, index) => {
        const card = criarCard(normalizarFilme(filme), index + 1);
        filmesDestaqueContainer.appendChild(card);
    });
    ativarVerMais(filmesDestaqueContainer);
}

function renderizarSeries(series) {
    if (!seriesDestaqueContainer) return;
    seriesDestaqueContainer.innerHTML = "";

    series.forEach((serie, index) => {
        const card = criarCard(normalizarFilme(serie), index + 1);
        seriesDestaqueContainer.appendChild(card);
    });
    ativarVerMais(seriesDestaqueContainer);
}

// Preenche cada container de generos tanto filme , quanto serie
function carregarGeneros(tipo) {
    document.querySelectorAll("h2").forEach(titulo => {
        const id = generos[titulo.textContent.trim()]?.[tipo];
        const container = titulo.nextElementSibling;
        if (!id || !container) return;

        fetch(`${url_genero}${tipo}?language=pt-BR&with_genres=${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            container.innerHTML = "";
            data.results.slice(0, 10).forEach(item => {
                container.appendChild(criarCard(normalizarFilme(item)));
            });
            ativarVerMais(container);
        })
        .catch(error => console.error("Erro ao buscar gênero:", error));
    });
}

// renderizar lista de filmes e series html
if (filmesDestaqueContainer) {
    carregarFilmesPopulares();
    carregarGeneros("movie");
}
if (seriesDestaqueContainer) {
    carregarSeriesPopulares();
    carregarGeneros("tv");
}

// requisição de series populares
function carregarSeriesPopulares() {
    fetch(url_series, {
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
        
        const top10Series = data.results.slice(0, 10);
        renderizarSeries(top10Series);
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
    atualizarContador();
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

// ===== CONTADOR "Favoritados: N" (aparece no menu de todas as páginas) =====
const menuSite = document.querySelector(".site-nav ul");
if (menuSite) menuSite.insertAdjacentHTML("beforeend", `<li class="favoritados">Favoritados: <strong id="contador-favoritos"></strong></li>`);

function atualizarContador() {
    const contador = document.getElementById("contador-favoritos");
    if (contador) contador.textContent = lerLista().length;
}

atualizarContador();
window.addEventListener("storage", atualizarContador);   // favoritou em outra aba? atualiza aqui também


// Padroniza os dados da API (filmes usam "title", séries usam "name")
function normalizarFilme(filme) {
    return {
        id: filme.id,
        titulo: filme.title || filme.name,
        poster: filme.poster_path
            ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
            : "Fotos/Poster Filme.png",
        nota: filme.vote_average || 0 ,
                nota: filme.vote_average || 0,
        tipo: filme.title ? "movie" : "tv"   // filmes têm "title", séries têm "name"
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

// Botão "Ver mais" / "Ver menos" 
function ativarVerMais(container) {
    container.classList.add("destaque-grade");

    // evita criar o botão duas vezes
    const proximo = container.nextElementSibling;
    if (proximo && proximo.classList.contains("ver-mais-area")) return;

    const area = document.createElement("div");
    area.className = "ver-mais-area";

    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn-ver-mais";
    botao.textContent = "Ver mais";
    botao.setAttribute("aria-expanded", "false");

    botao.addEventListener("click", () => {
        const aberto = container.classList.toggle("expandido");
        botao.textContent = aberto ? "Ver menos" : "Ver mais";
        botao.setAttribute("aria-expanded", String(aberto));
    });

    area.appendChild(botao);
    container.after(area);
}

// ===== PÁGINA MINHA LISTA =====
const listaContainer = document.getElementById("lista-filmes");
const filtroOrdem = document.getElementById("filtro-ordem");
const mensagemVazia = document.getElementById("lista-vazia");
const campoLista = document.getElementById("busca-lista");
const textoVazio = mensagemVazia ? mensagemVazia.textContent : "";
const semAcento = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();  


function renderizarMinhaLista() {
    if (!listaContainer) return;

    const busca = campoLista ? semAcento(campoLista.value.trim()) : "";
    const lista = lerLista().filter(item => semAcento(item.titulo).includes(busca));

    if (filtroOrdem && filtroOrdem.value === "a-z") {
        lista.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
    } else if (filtroOrdem && filtroOrdem.value === "z-a") {
        lista.sort((a, b) => b.titulo.localeCompare(a.titulo, "pt-BR"));
    } else if (filtroOrdem && filtroOrdem.value === "recentes") {
        lista.reverse(); 
    } 

    if (campoLista) {
    campoLista.addEventListener("input", renderizarMinhaLista);   // filtra enquanto digita
    }

    listaContainer.innerHTML = "";
    mensagemVazia.classList.toggle("d-none", lista.length > 0);
    mensagemVazia.textContent = busca ? "Nada encontrado." : textoVazio;

    lista.forEach(item => {
        listaContainer.appendChild(criarCard(item, null, renderizarMinhaLista));
    });
}

if (filtroOrdem) {
    filtroOrdem.addEventListener("change", renderizarMinhaLista);
}

renderizarMinhaLista();

// ===== FILTRO DE GÊNERO E BUSCA (filmes.html e series.html) =====
const filtroGenero = document.getElementById("filtro-genero");
const formBusca = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");
const secoes = document.getElementById("secoes");
const resultados = document.getElementById("resultados");
const areaMais = document.getElementById("area-mais");
const tipoPagina = filmesDestaqueContainer ? "movie" : "tv";   // filmes.html ou series.html

let consulta = "";   // URL da consulta atual, sem o número da página
let pagina = 1;

// Busca a página atual da consulta e acrescenta os cards na lista
function carregarResultados() {
    const url = `${consulta}&page=${pagina}`;

    fetch(url, { headers: { "Authorization": `Bearer ${token}` } })
    .then(response => response.json())
    .then(data => {
        // se o usuário já trocou de consulta, ignora esta resposta
        if (consulta === "" || !url.startsWith(consulta)) return;

        const lista = data.results || [];
        if (pagina === 1) {
            resultados.innerHTML = lista.length ? "" : '<p class="sem-resultado">Nada encontrado.</p>';
        }
        lista.forEach(item => resultados.appendChild(criarCard(normalizarFilme(item))));
        areaMais.classList.toggle("d-none", pagina >= (data.total_pages || 0));
    })
    .catch(error => console.error("Erro ao buscar resultados:", error));
}

// url vazia = volta para os destaques e gêneros; senão mostra só a lista dessa consulta
function mostrarConsulta(url) {
    consulta = url;
    pagina = 1;
    secoes.classList.toggle("d-none", url !== "");
    resultados.classList.toggle("d-none", url === "");
    areaMais.classList.add("d-none");
    if (url !== "") carregarResultados();
}

// 'change': escolher um gênero no select
if (filtroGenero) {
    filtroGenero.addEventListener("change", () => {
        const id = generos[filtroGenero.selectedOptions[0].text.trim()]?.[tipoPagina];
        campoBusca.value = "";
        mostrarConsulta(id ? `${url_genero}${tipoPagina}?language=pt-BR&with_genres=${id}` : "");
    });
}

// 'submit': pesquisar pelo nome
if (formBusca) {
    formBusca.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const texto = campoBusca.value.trim();
        filtroGenero.value = "";
        mostrarConsulta(texto ? `${url_busca}${tipoPagina}?language=pt-BR&query=${encodeURIComponent(texto)}` : "");
    });
}

// 'input': apagou o texto da busca -> volta para os destaques
if (campoBusca) {
    campoBusca.addEventListener("input", () => {
        if (campoBusca.value === "" && consulta.startsWith(url_busca)) mostrarConsulta("");
    });
}

// 'click': botão Mostrar mais pede a próxima página
if (areaMais) {
    areaMais.querySelector("button").addEventListener("click", () => {
        pagina++;
        carregarResultados();
    });
}