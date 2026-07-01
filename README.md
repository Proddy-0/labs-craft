# craft — portfolio + hub de pages estáticas do Proddyt Labs

`craft` é a home pessoal (portfólio) **e** o catálogo de pages estáticas: labs, CTI,
experimentos. A raiz (`/`) é o portfólio; cada projeto listado vive num **sub-path**
(ex: `/hub-aula-1/`) ou aponta pra um repo externo.

```
craft/
├── index.html      ← portfólio (home) — não precisa editar pra add projeto
├── data.js         ← REGISTRY — stacks + array `projects`  ← edite AQUI
├── script.js       ← render do portfólio (grid dinâmico, filtros) — não precisa mexer
├── style.css       ← identidade visual
├── README.md
├── nexo/ punch/ vector/ wire/   ← landings (pages estáticas simples)
└── hub-aula-1/ hub-aula-2/      ← submodules git (repo próprio, ver .gitmodules)
```

## ➕ Adicionar um projeto novo (ex: Hub de Aula 3)

1. Se for página estática nova, clone o repo na pasta:
   ```bash
   git clone <repo> hub-aula-3
   ```
   (se quiser manter como submodule, adicione a entrada em `.gitmodules` também)
2. Adicione UM objeto no array `projects` em `data.js`:
   ```js
   {
     title: "Hub de Aula 3",
     category: "cti",       // usado no filtro (all/labs/cti/tools)
     type: "Projeto escolar",
     status: "Ativo",
     path: "hub-aula-3/",   // "#" se ainda não tem página publicada
     repo: "https://github.com/...",
     description: "...",
     tags: ["CTI", "..."],
     featured: false
   }
   ```
3. Pronto — aparece automaticamente no catálogo (`#projetos`), sem mexer em HTML/CSS.

## Campos de um item (`data.js` → `projects`)

| campo         | obrigatório | o quê |
|---------------|:-----------:|-------|
| `title`       | ✅ | título do card |
| `category`    | ✅ | usado pelos botões de filtro (`labs`, `cti`, `tools`, ...) |
| `type`        |    | subtítulo curto (ex: "Landing / visual lab") |
| `status`      |    | rótulo de status (ex: "Ativo", "Planejado") |
| `path`        | ✅ | `"pasta/"` (página estática) ou `"#"` se ainda não publicada |
| `repo`        |    | link do repositório (vazio = sem link de repo) |
| `description` |    | descrição curta |
| `tags`        |    | array de chips exibidos no card |
| `featured`    |    | `true` destaca o card com borda mais forte |

O grid tem teto de 3 colunas — com menos itens (por categoria filtrada) os cards
esticam pra preencher a linha, sem deixar espaço vazio.

## Requisitos de uma página clonada
- Ter um `index.html` na raiz da pasta.
- Usar caminhos **relativos** para assets (`src/...`, `image/...`), nunca `/src/...`,
  para funcionar sob o sub-path.
- Ter um link de volta pro craft (`← craft` apontando pra `../index.html`), pro
  usuário conseguir navegar de volta pro portfólio.
