# craft — páginas estáticas do Proddyt Labs

`craft.proddyt.site` é a **home das páginas estáticas**. A raiz (`/`) é o índice
que lista as páginas; cada página vive num **sub-path** (ex: `/hub-aula-1/`).

```
craft/
├── index.html      ← o índice (não precisa editar)
├── pages.js        ← A LISTA de páginas  ← edite AQUI
├── style.css       ← identidade visual (igual à home)
├── README.md
└── hub-aula-1/     ← uma página (repo clonado)
    └── index.html
```

## ➕ Adicionar uma página nova (ex: Hub de Aula 2)

```bash
# 1) clona o repo na pasta com o caminho que você quer (= o sub-path da URL)
git clone <repo> /opt/docker/proddyt-labs/craft/hub-aula-2

# 2) adiciona UM objeto no array PAGES em pages.js:
#    { name: "Hub de Aula 2", href: "hub-aula-2/", desc: "...", tag: "cti", mark: "{2}" }

# 3) rebuild
cd /opt/docker/proddyt-labs/craft && docker compose up -d --build
```

Pronto: aparece no índice e fica acessível em `craft.proddyt.site/hub-aula-2/`.

## Campos de um item (pages.js)

| campo    | obrigatório | o quê |
|----------|:-----------:|-------|
| `name`   | ✅ | título do card |
| `href`   | ✅ | `"pasta/"` (página estática) **ou** `"https://..."` (sistema) |
| `desc`   |    | descrição curta |
| `tag`    |    | rótulo (ex: `cti`, `dev`) |
| `mark`   |    | símbolo no ícone (ex: `{ }`) |
| `accent` |    | cor hex do ícone |
| `system` |    | **`true`** marca como SISTEMA → mostra status online/offline. |

### Flag `system`
Páginas estáticas estão **sempre no ar** (servidas pelo próprio nginx do craft),
então **não** levam status online/offline — é só um link.
Use `system: true` apenas para **sistemas/apps externos** (ex: `tools.proddyt.site`),
que aí sim ganham o indicador online/offline (checado via favicon).

## Requisitos da página clonada
- Ter um `index.html` na raiz da pasta.
- Usar caminhos **relativos** para assets (`src/...`, `image/...`), nunca `/src/...`,
  para funcionar sob o sub-path.
