# Craft - Handoff para Deploy AWS

## Objetivo do projeto

craft está virando o site principal do ecossistema Proddyt: home/portfólio pessoal na raiz + catálogo vivo de projetos (labs visuais, trabalhos do CTI, tools planejadas), tudo em HTML/CSS/JS estático, sem build step, pronto pra S3+CloudFront (e depois Azure Static Web Apps).

## Decisão de arquitetura

- **craft = main**: a raiz do repo (`index.html`) não é mais um hub simples de links — é o portfólio pessoal completo (hero, stacks, catálogo de projetos, footer). O antigo `pages.js` (lista de cards) foi descontinuado.
- **Portfolio não é uma seção separada, é a própria home**: não existe mais um objeto "Craft"/"Proddyt" dentro de um registry de páginas — o portfólio *é* o `index.html` raiz. Não há "item de portfólio" dentro do catálogo (ver seção **Item do portfolio** abaixo pra detalhe).
- **Pages = catálogo**: seção `#projetos` no próprio index, renderizada a partir de `data.js` (array `projects`), com filtro por categoria (botões `Todos/Labs/CTI/Tools`).
- **Categorias hoje implementadas**: `labs` (nexo, punch, vector, wire) e `cti` (hub-aula-1, hub-aula-2, + 2 projetos "arquivo vivo" sem página própria). `tools` existe como categoria (Proddyt Tools, ainda sem page — `path: "#"`).
- **Experiments / Archive**: **ainda não implementados**. O filtro atual só tem `all/labs/cti/tools` — pra adicionar Experiments/Archive como categorias reais, basta (a) usar essas strings no campo `category` de novos itens em `data.js` e (b) adicionar os botões correspondentes em `index.html` (`<button class="filter" data-filter="experiments">`). Não exige mudança de arquitetura, só dado + 1 botão por categoria nova.
- **Submodules**: `hub-aula-1` e `hub-aula-2` são git submodules de verdade (registrados em `.gitmodules`, apontando pros repos próprios do usuário). Eles entram no catálogo como itens normais de `data.js` (categoria `cti`), com `path` apontando pra pasta local (`hub-aula-1/`) e `repo` apontando pro GitHub de cada um.

## Estrutura atual de pastas

```
craft/
├── .gitmodules
├── README.md
├── favicon.svg
├── index.html          ← portfólio (home) — hero, stacks, catálogo, footer
├── data.js              ← REGISTRY (array `stacks` + array `projects`)
├── script.js            ← render (stats, cards, filtro, scroll progress, nav ativa, spotlight)
├── style.css            ← identidade visual única (mono, spotlight, animações)
├── nexo/index.html
├── punch/index.html
├── vector/index.html
├── wire/index.html
├── hub-aula-1/           ← submodule git (github.com/Proddy-0/cti-ap1-hub-aula)
│   ├── index.html, style.css, script.js, README.md
│   ├── image/*.png (4)
│   └── src/{apps,csharp,java,php}.html
└── hub-aula-2/           ← submodule git (github.com/Proddy-0/cti-ap1-hub-aula-2)
    ├── index.html, style.css
    ├── img/*.png (7)
    ├── db/, html-css-js/, java/, php/  (cada um com index.html + styly.css órfão)
    └── .vscode/settings.json
```

Removido nesta rodada (não existe mais): `pages.js`, `nginx.conf`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `text.md`, `image/*.png` (4 pngs órfãos na raiz do craft).

## Estrutura planejada

Sem mudança estrutural de pastas planejada pra curto prazo — a decisão tomada foi **não mover fisicamente** `hub-aula-1/hub-aula-2` pra dentro de `cti/` nem `nexo/punch/vector/wire` pra dentro de `labs/`, porque isso quebraria os links relativos internos de cada página e o path registrado no `.gitmodules`. Categorização é só lógica (campo `category` em `data.js`), não física.

Se quiser mesmo separar fisicamente no futuro:
```
craft/
├── index.html, data.js, script.js, style.css
├── labs/{nexo,punch,vector,wire}/
├── cti/{hub-aula-1,hub-aula-2}/
├── experiments/
└── archive/
```
Isso exige: reconfigurar `.gitmodules` (paths novos), atualizar `path` em `data.js`, e corrigir os links `../index.html` internos de cada página (hoje assumem 1 nível de profundidade). Não fiz isso — avaliar se vale o esforço antes do deploy.

## Registry de pages

Usa **`data.js`** (não `pages.json`, não `pages.js` antigo). É JS puro com dois arrays globais (`stacks` e `projects`), carregado via `<script src="./data.js"></script>` antes do `script.js` que faz o render.

Campos usados em cada item de `projects`:

| campo | obrigatório | equivalente ao que você citou |
|---|---|---|
| `title` | sim | name/title |
| `icon` | não | mark (símbolo custom no ícone; sem isso cai no ícone padrão da categoria) |
| `category` | sim | tag/category (usado pelo filtro: `labs`, `cti`, `tools`) |
| `type` | não | subtítulo curto |
| `status` | não | status |
| `path` | sim | href/path (pasta relativa, ou `"#"` se não publicada — card fica não-clicável) |
| `repo` | não | repo (link GitHub, ícone + texto "Repo") |
| `description` | não | desc |
| `tags` | não | chips exibidos no card (não confundir com `category`) |
| `featured` | não | featured (`true` só destaca a borda, sem badge/ribbon) |

**Não existem** campos `accent` (cor fixa por item — hoje a cor do ícone vem de um mapa fixo por categoria dentro do `script.js`, não por item) nem `year`/`stack` (não há campo de ano nem de stack tecnológica por projeto individual — `stacks` é uma seção separada e genérica do portfólio, não por projeto). Se precisar disso no futuro é fácil adicionar (mais uma prop no objeto + 1 linha no template do `script.js`).

## Item do portfolio

**Não existe um objeto "portfolio" dentro do registry.** Decisão tomada nesta sessão: o portfólio (antes um protótipo separado em `portifolio/index.html` com seu próprio `data.js`) foi **promovido pra ser a própria raiz do craft** — não é mais um card clicável dentro do catálogo, é a home. O array `projects` de `data.js` hoje lista só os *outros* projetos (labs, CTI, tools), não craft/portfolio a si mesmo (uma entrada auto-referencial existia numa versão intermediária e foi removida por não fazer sentido).

## Submodules

- **hub-aula-1** → `https://github.com/Proddy-0/cti-ap1-hub-aula.git`
- **hub-aula-2** → `https://github.com/Proddy-0/cti-ap1-hub-aula-2.git`
- `.gitmodules` **corrigido** nesta sessão (antes existia o gitlink no índice do git sem o arquivo `.gitmodules` — clone normal trazia as pastas vazias). Hoje está completo e commitado.
- Ambos os submodules estão hoje na branch local `feature/craft-back-link` (não empurrada pro GitHub ainda), com o botão flutuante `← craft` adicionado.

**Comando de clone correto:**
```bash
git clone --recurse-submodules git@github.com:Proddy-0/labs-craft.git
```
(nota: o repo remoto foi renomeado de `proddyt-labs/craft` pra `Proddy-0/labs-craft` — o remote antigo redireciona, mas prefira o path novo.)

Se já clonou sem `--recurse-submodules`:
```bash
git submodule update --init --recursive
```

## Branches Git

- **Repo remoto**: `git@github.com:Proddy-0/labs-craft.git` (antigo `proddyt-labs/craft`, GitHub redireciona)
- **Branch atual (local, notebook)**: `chore/remove-non-static-files`
- **Branches criadas nesta sessão**:
  - `fix/gitmodules-hubs` (craft) — **já empurrada** pro GitHub
  - `chore/remove-non-static-files` (craft) — **local, não empurrada**
  - `feature/craft-back-link` (hub-aula-1 e hub-aula-2) — **local em ambos, não empurrada**
- **Commits feitos** (craft, em cima de `fix/gitmodules-hubs`):
  1. `e3ee482` chore: remove Docker/nginx infra e arquivos órfãos
  2. `9c4df29` feat: promove portfolio pra raiz, catálogo dinâmico via data.js
  3. `9da2646` feat: redesign visual + botão voltar padronizado
- **Working tree**: limpo em craft, hub-aula-1 e hub-aula-2 (tudo commitado nesta sessão).
- **`main` está divergida de `origin/main`?** Sim — desde antes desta sessão: `origin/main` tem 5 commits (setup de CI/CD com tailscale) que não estão em `fix/gitmodules-hubs`/`chore/remove-non-static-files`; e esta branch tem 3 commits que `main` não tem. **Não foi reconciliado** — decisão pendente seria via PR (`chore/remove-non-static-files` → `main`), não merge automático.
- **Pendências antes de merge**: (1) decidir se reconcilia a divergência de `main` antes ou depois do merge desta branch; (2) revisar o diff completo (é grande — portfólio inteiro trocado) antes de abrir PR; (3) push das 3 branches locais pro GitHub (nenhuma foi empurrada nesta sessão, exceto `fix/gitmodules-hubs` que já tinha sido empurrada numa sessão anterior).

## Alterações feitas

**Criados**: `data.js`, `script.js` (na raiz — substituem o antigo `pages.js`)

**Alterados**: `index.html`, `style.css`, `README.md` (raiz); `nexo/index.html`, `punch/index.html`, `vector/index.html`, `wire/index.html`; `hub-aula-1/index.html`, `hub-aula-1/style.css`; `hub-aula-2/index.html`, `hub-aula-2/style.css`

**Removidos**: `pages.js`, `nginx.conf`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `text.md`, `image/PHP-logo.png`, `image/csharp.png`, `image/html.png`, `image/java.png` (raiz do craft)

**Assets órfãos**:
- Removidos: os 4 PNGs da raiz do craft (`image/*.png`) — confirmado zero referência, duplicata do que já existe dentro de `hub-aula-1/image/`.
- **Mantidos (ainda órfãos)**: `hub-aula-2/{db,html-css-js,java,php}/styly.css` (4 arquivos) — estão **dentro do submodule**, fora do escopo do que foi mexido nesta sessão. Confirmados sem nenhuma referência (typo/sobra de refactor antigo). Decisão de limpar ou não fica pra quando for mexer no hub-aula-2 especificamente.

**CSS órfão removido**: o `<nav>`/`.nav-back`/`.nav-brand` original de nexo/punch/vector/wire virou código morto depois que o botão voltar foi extraído pra elemento flutuante fixo — removido (markup + CSS) nas 4 páginas.

## Como testar localmente

- **Caminho**: `C:\DEV\Proddyt-Labs\labs-craft`
- **Comando**: `python -m http.server 8080` (rodando nesta sessão, PID pode já ter encerrado — reiniciar se precisar)
- **URL**: http://localhost:8080/
- **Validar visualmente**:
  - Home: hero, stats dinâmicos, seção stacks, catálogo com filtro, footer com ícone GitHub + seta topo
  - Cada card de projeto: clicar deve navegar (se tiver `path`) ou não fazer nada + mostrar "página indisponível" (se `path: "#"`)
  - Navegar pra `/nexo/`, `/punch/`, `/vector/`, `/wire/`, `/hub-aula-1/`, `/hub-aula-2/` — conferir botão `← craft` fixo no canto superior esquerdo em todas, mesmo visual
  - Subpáginas de hub-aula-1 (`src/*.html`) e hub-aula-2 (`db/`, `java/`, `php/`, `html-css-js/`) — usam botão diferente (`back-btn`/`back-link`) pra voltar pro índice do próprio hub, isso é intencional, não confundir com o `craft-back`

## Estado visual/funcional

**Pronto**:
- Static puro, zero build step, zero dependência de Docker/nginx pra rodar
- Todos os paths internos são relativos (confirmado, nenhum `href="/..."` absoluto)
- Nenhuma referência a `localhost`/`127.0.0.1` em nenhum HTML
- Tipografia unificada (JetBrainsMono Nerd Font, fallback JetBrains Mono via Google Fonts)
- Catálogo dinâmico, grid com teto de 3 colunas (estica se tiver menos itens, sem espaço vazio)
- Botão de voltar padronizado (visual único) em todas as 6 páginas externas ao index

**Ainda não implementado**: categorias Experiments e Archive (fácil de adicionar, ver seção Decisão de arquitetura)

**Não identificado nenhum link quebrado** nas checagens feitas (smoke test via curl em todas as rotas, todas 200)

**Não roda 100% sem internet**: depende de Google Fonts (`fonts.googleapis.com`) pro fallback de fonte — se a Nerd Font não estiver instalada no dispositivo do visitante, cai pro JetBrains Mono do Google; sem internet nenhum dos dois carrega e cai pro monospace genérico do sistema (degradação aceitável, não quebra o layout).

## Deploy AWS planejado

- **S3 + CloudFront**: sim, é o plano.
- **Bucket**: sugestão `craft-proddyt-site` (ou nome que preferir) — **privado**, sem website hosting público direto.
- **CloudFront + OAC** (Origin Access Control): sim, é o padrão recomendado hoje (não usar bucket público nem S3 static website endpoint legado).
- **CloudFront Function necessária**: sim — sem ela, `/nexo/`, `/hub-aula-1/`, etc. dão 403/404 (S3 REST origin não resolve `pasta/` → `pasta/index.html` sozinho). Function de viewer-request pra reescrever URIs terminando em `/` apendando `index.html`.
- **Cache headers sugeridos**: `.html/.css/.js` → `no-cache, must-revalidate` (ou TTL curto); imagens/svg → cache longo (`max-age=31536000, immutable`), já que nomes de arquivo não mudam.
- **Default Root Object**: `index.html`.
- **Entra no bucket**: tudo dentro da árvore atual (ver "Estrutura atual de pastas"), exceto os itens já listados como não-entram.
- **Não entra**: `.gitmodules`, `README.md` (raiz e do hub-aula-1), `.vscode/` (hub-aula-2), `.git/` de todos os repos, `hub-aula-1/README.md`.
- **Domínio temporário**: usar o `*.cloudfront.net` gerado automaticamente pra validar antes de trocar DNS.
- **Domínio customizado futuro**: `craft.proddyt.site` (já referenciado no próprio código antigo/README) via CNAME + certificado ACM (us-east-1) + Alternate Domain Name na distribution.

## Deploy Azure planejado

- **Azure Static Web Apps**: sim, é o plano pra depois do AWS.
- **Auto deploy via GitHub**: sim, nativo — Azure gera um workflow do GitHub Actions ao conectar o repo.
- **Branch de deploy**: sugestão `main` (depois de reconciliada a divergência atual).
- **Precisa de submodules no workflow?** Sim — **crítico**: o workflow padrão gerado pelo Azure usa `actions/checkout` sem submodules por padrão. Precisa adicionar `submodules: true` (ou `recursive`) manualmente no step de checkout, senão publica hub-aula-1/hub-aula-2 vazios (mesmo bug do clone manual sem `--recurse-submodules`).
- **Pasta app**: `/` (raiz do craft, onde está `index.html`).
- **Output folder**: `/` também (sem build, output = app location).
- **Build?** Não — static puro, `skip_app_build: true` ou build command vazio.

## Checklist antes de subir para AWS

- [ ] Git limpo em craft + hub-aula-1 + hub-aula-2 — **sim, confirmado nesta sessão**
- [ ] Submodules ok (`.gitmodules` correto, commits batendo) — **sim, confirmado**
- [ ] Teste local ok (smoke test todas as rotas) — **sim, feito nesta sessão**
- [ ] Links ok (relativos, sem localhost/absoluto) — **sim, confirmado**
- [ ] Registry ok (`data.js` consistente, ícones/paths corretos) — **sim**
- [ ] Arquivos órfãos decididos — **parcial**: raiz do craft limpa; `hub-aula-2/*/styly.css` ainda pendente de decisão
- [ ] Domínio decidido — **pendente** (`craft.proddyt.site` é a intenção implícita, não confirmado formalmente)
- [ ] Conta AWS/budget ok — **pendente**, não verificado nesta sessão
- [ ] Reconciliar divergência `main`/`origin/main` antes do merge final — **pendente**
- [ ] Push das 3 branches locais pro GitHub — **pendente**, nada foi empurrado nesta sessão (exceto `fix/gitmodules-hubs`, de sessão anterior)

## Próximas ações recomendadas

1. Revisar o diff completo das 3 branches locais (craft + 2 submodules) antes de decidir push.
2. Reconciliar `main` ↔ `origin/main` (5 commits de CI/CD tailscale vs 3 commits desta sessão) — decidir via PR, não merge automático.
3. Push das branches (`chore/remove-non-static-files`, `feature/craft-back-link` × 2) pro GitHub.
4. Abrir PR de `chore/remove-non-static-files` → `main` (craft) e das branches dos submodules pros próprios repos deles.
5. Decidir sobre os `styly.css` órfãos do hub-aula-2 (limpar ou ignorar).
6. Criar conta/bucket AWS, configurar OAC + CloudFront Function, subir versão de teste no domínio `*.cloudfront.net`.
7. Validar tudo no domínio temporário antes de apontar `craft.proddyt.site`.
8. Só depois, configurar Azure Static Web Apps com o workflow ajustado pra submodules.

---

## Resumo curto para ChatGPT

- Projeto: **craft**, site estático (HTML/CSS/JS puro, sem build), repo `github.com/Proddy-0/labs-craft`.
- Virou portfólio pessoal + catálogo de projetos (labs, CTI, tools) na mesma home — sem seção separada de "portfolio", a raiz JÁ é o portfólio.
- Registry de projetos: `data.js` (array `projects`), sem `pages.json`.
- 2 submodules git: `hub-aula-1` e `hub-aula-2` (repos próprios do Proddy-0), `.gitmodules` corrigido nesta sessão.
- Clone certo: `git clone --recurse-submodules git@github.com:Proddy-0/labs-craft.git`
- 3 branches locais não empurradas ainda: `chore/remove-non-static-files` (craft), `feature/craft-back-link` (hub-aula-1 e hub-aula-2 cada um no seu repo).
- `main` do craft está divergida de `origin/main` (CI/CD antigo com tailscale vs mudanças desta sessão) — precisa reconciliar via PR antes de virar fonte de verdade.
- Sem Docker/nginx/pages.js mais — tudo static puro pronto pra S3.
- Falta: criar bucket S3 privado + OAC + CloudFront Function (resolver `/pasta/` → `/pasta/index.html`) + cache headers + testar no domínio `*.cloudfront.net` antes de apontar `craft.proddyt.site`. Depois replicar em Azure Static Web Apps (atenção: workflow do Azure precisa `submodules: true` no checkout, senão publica os hubs vazios).
