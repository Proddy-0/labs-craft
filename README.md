# craft — portfólio e hub de páginas estáticas do Proddyt Labs

Site estático do Proddyt Labs: portfólio (home) e catálogo de páginas (labs, CTI, tools).
Publicado em https://craft.proddyt.com via GitHub Pages. Repo: `Proddy-0/labs-craft`.

## Estrutura

```
labs-craft/
├── index.html      home (portfólio) — não precisa editar pra adicionar projeto
├── data.js         registro: array `stacks` e array `projects`  ← edite AQUI
├── script.js       renderiza stacks, cards e filtros a partir do data.js
├── style.css       só layout do site; usa tokens da marca
├── privacidade.html
├── favicon.svg     marca Labs (cópia de brand/marks/labs-mark.svg)
├── CNAME           craft.proddyt.com — não remover
├── nexo/ punch/ vector/ wire/   landings estáticas
├── hub-aula-1/ hub-aula-2/      submodules git (ver .gitmodules) — não editar aqui
└── .github/workflows/pages.yml  deploy
```

## Adicionar um card de projeto

Adicione um objeto ao array `projects` em `data.js`. Nada de HTML/CSS:

```js
{
  title: "Hub de Aula 3",
  icon: "{3}",          // opcional: texto curto no ícone (sem emoji)
  category: "cti",      // filtro: labs | cti | tools
  type: "Projeto escolar",
  status: "Ativo",      // "Publicado" = chip verde, "Ativo" = chip da marca, outro = neutro
  path: "hub-aula-3/",  // pasta, URL externa, ou "#" se ainda sem página
  repo: "https://github.com/Proddy-0/...",  // opcional
  description: "...",
  tags: ["CTI", "HTML"],
  featured: false       // true = borda destacada
}
```

Campos obrigatórios: `title`, `category`, `path`. Para uma categoria nova, adicione também um
botão em `index.html` (`data-filter="<categoria>"`).

Páginas dentro de subpasta devem usar caminhos relativos e ter link de volta pro craft.
Pra seguir a marca, use o mesmo `<head>` das subpáginas (`nexo/index.html` é o modelo).

## Visualizar localmente

```
python -m http.server 8772 --bind 127.0.0.1
```

Abra http://127.0.0.1:8772.

## Deploy

Push na `main` dispara `.github/workflows/pages.yml`, que publica a raiz inteira (com submodules)
no GitHub Pages. O domínio vem do `CNAME` (`craft.proddyt.com`).

## Marca

Visual vem do repo `Proddyt-Labs/brand`, versão `@1`, carregado por jsDelivr
(`tokens.css`, `base.css`, `theme.js`, `marks/labs-mark.svg`) com `<html data-brand="labs">`.
Fontes: IBM Plex Sans e IBM Plex Mono (Google Fonts). O `style.css` local usa apenas tokens
(`--bg`, `--surface`, `--line`, `--text`, `--muted`, `--brand`, `--labs-text`...). Tema claro/escuro
pelo botão do cabeçalho.

## Submodules

`hub-aula-1` e `hub-aula-2` são submodules (repos próprios). Clone com
`git clone --recurse-submodules` ou rode `git submodule update --init`. Alterações nelas são
feitas nos repos de origem, não aqui.
