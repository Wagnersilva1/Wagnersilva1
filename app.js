const USERNAME = "Wagnersilva1";

const format = new Intl.NumberFormat("pt-BR");

const $ = (selector) => document.querySelector(selector);

async function fetchGitHub(path) {
  const response = await fetch(`https://api.github.com${path}`);
  if (!response.ok) {
    throw new Error(`GitHub API retornou ${response.status}`);
  }
  return response.json();
}

function languageSummary(repos) {
  const counts = repos.reduce((acc, repo) => {
    if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([language]) => language);
}

function renderRepos(repos) {
  const grid = $(".pinned-grid");
  const selected = repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.updated_at) - new Date(a.updated_at);
    })
    .slice(0, 6);

  grid.innerHTML = "";

  if (!selected.length) {
    grid.innerHTML = "<article><h3>Nenhum repositorio publico</h3><p>A API nao retornou repositorios publicos.</p></article>";
    return;
  }

  selected.forEach((repo) => {
    const article = document.createElement("article");
    const updated = new Date(repo.updated_at).toLocaleDateString("pt-BR");
    article.innerHTML = `
      <h3><a href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a> <span>Public</span></h3>
      <p>${repo.description || "Sem descricao publica."}</p>
      <small>${repo.language || "Sem linguagem"} · ★ ${format.format(repo.stargazers_count)} · atualizado em ${updated}</small>
    `;
    grid.appendChild(article);
  });
}

function renderStackFromRepos(repos) {
  const languages = languageSummary(repos);
  const stackMap = {
    TypeScript: "ts",
    JavaScript: "js",
    HTML: "html",
    CSS: "css",
    Python: "python",
    PHP: "php",
    Go: "go",
    Java: "java",
    "C#": "cs",
    C: "c",
    "C++": "cpp",
    Lua: "lua",
    Shell: "bash"
  };

  const iconIds = languages.map((language) => stackMap[language]).filter(Boolean);
  const base = ["git", "github", "vscode"];
  const ids = [...new Set([...iconIds, ...base])].join(",");

  $(".stack-row").innerHTML = `<img src="https://skillicons.dev/icons?i=${ids}" alt="Stack detectada pelos repositorios publicos" />`;
}

async function loadProfile() {
  try {
    const [user, repos] = await Promise.all([
      fetchGitHub(`/users/${USERNAME}`),
      fetchGitHub(`/users/${USERNAME}/repos?per_page=100&sort=updated`)
    ]);

    $(".avatar").src = user.avatar_url;
    $("#profile-name").textContent = user.name || user.login;
    $("#profile-login").textContent = user.login;
    $("#profile-bio").textContent = user.bio || "Sem bio publica no GitHub.";
    $("#profile-location").textContent = user.location || "Localizacao nao informada";
    $("#profile-url").textContent = user.blog || `github.com/${user.login}`;
    $("#profile-followers").textContent = `${format.format(user.followers)} seguidores · ${format.format(user.following)} seguindo`;
    $("#terminal-name").textContent = user.name || user.login;
    $("#terminal-bio").textContent = user.bio || "Developer em evolucao, criando projetos com visual limpo, codigo claro e entrega real.";
    $("#repo-count").textContent = format.format(user.public_repos);

    renderStackFromRepos(repos);
    renderRepos(repos);
  } catch (error) {
    $(".pinned-grid").innerHTML = `<article><h3>Erro ao carregar</h3><p>${error.message}</p></article>`;
  }
}

loadProfile();
