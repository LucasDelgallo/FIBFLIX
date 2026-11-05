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

// renderizar lista de filmes html
function renderizarFilmes(filmes) {
    if (!filmesDestaqueContainer) return;
    
    filmesDestaqueContainer.innerHTML = "";

    filmes.forEach((filme, index) => {
        const posterPath = filme.poster_path 
            ? `https://image.tmdb.org/t/p/w500${filme.poster_path}` 
            : 'Fotos/Poster Filme.png';

        const card = document.createElement("div");
        card.classList.add("card-conteudo");
        card.innerHTML = `
            <div class="poster">
                <img src="${posterPath}" alt="${filme.title}">
                <span class="numero-top">${index + 1}</span>
            </div>
            <h3>${filme.title}</h3>
            <p class="nota">
                <span aria-label="estrelas">★</span>
                <strong>${filme.vote_average ? filme.vote_average.toFixed(1) : '5.0'}</strong>
            </p>
        `;
        filmesDestaqueContainer.appendChild(card);
    });
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