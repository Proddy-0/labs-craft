/* ══════════════════════════════════════════════════════════════════════════
   CRAFT — índice das páginas estáticas do Proddyt Labs
   (craft.proddyt.site é a "home" das páginas; cada página vive num sub-path)

   ➕ ADICIONAR UMA PÁGINA (ex: Hub de Aula 2):
      1) git clone <repo> /opt/docker/proddyt-labs/craft/hub-aula-2
      2) adicione UM objeto no array PAGES abaixo (href: "hub-aula-2/")
      3) cd /opt/docker/proddyt-labs/craft && docker compose up -d --build
      Detalhes no README.md.

   Campos do objeto:
      name   (obrigatório)  título do card
      href   (obrigatório)  "pasta/"  (página estática)  ou  "https://..." (sistema)
      desc                  descrição curta
      tag                   rótulo (ex: "cti", "dev")
      mark                  símbolo no ícone (ex: "{ }")
      accent                cor hex do ícone
      system: true          ⚠️ marca como SISTEMA → mostra status online/offline.
                            páginas estáticas NÃO levam isso (estão sempre no ar).
   ══════════════════════════════════════════════════════════════════════════ */

const PAGES = [
  {
    name:   "Hub de Aula 1",
    href:   "hub-aula-1/",
    desc:   "AP1 — atividades e projetos do CTI (PHP, Java, C#, Apps).",
    tag:    "cti",
    mark:   "{1}",
    accent: "#ff7a18",
  },
  {
    name:   "Hub de Aula 2",
    href:   "hub-aula-2/",
    desc:   "AP2 — atividades e projetos do CTI (PHP, Java, DB, Apps).",
    tag:    "cti",
    mark:   "{2}",
    accent: "#5b9bd5",
  },

  // ── Exemplo de SISTEMA (mostra status online/offline) ──
  {
    name:   "Tools",
    href:   "https://tools.proddyt.site",
    desc:   "Utilitários de dev self-hosted — encode, crypto, regex e mais.",
    tag:    "dev",
    mark:   "[/]",
    accent: "#45d483",
    system: true,
  },
];

/* ── render (não precisa mexer daqui pra baixo) ───────────────────────────── */
function statusHTML(p) {
  // só sistemas têm online/offline; páginas estáticas estão sempre no ar
  return p.system
    ? `<span class="status checking"><span class="sdot"></span><span class="label">verificando</span></span>`
    : `<span class="card-arrow">→</span>`;
}

function cardHTML(p) {
  const ext = /^https?:/.test(p.href);
  return `
    <a href="${p.href}" class="card" ${ext ? 'target="_blank" rel="noopener"' : ""}>
      <div class="card-top">
        <div class="ico" style="--accent:${p.accent || "#ff7a18"}">${p.mark || "·"}</div>
        <div class="card-name">${p.name}</div>
      </div>
      <div class="card-desc">${p.desc || ""}</div>
      <div class="card-foot">
        <div class="card-tags">${p.tag ? `<span class="tag">${p.tag}</span>` : ""}</div>
        ${statusHTML(p)}
      </div>
    </a>`;
}

function checkStatus(url, el) {
  const label = el.querySelector(".label");
  const img = new Image();
  let done = false;
  const finish = (up) => {
    if (done) return; done = true;
    el.className = "status " + (up ? "up" : "down");
    label.textContent = up ? "online" : "offline";
  };
  const t = setTimeout(() => finish(false), 5000);
  img.onload  = () => { clearTimeout(t); finish(true); };
  img.onerror = () => { clearTimeout(t); finish(false); };
  img.src = url.replace(/\/$/, "") + "/favicon.ico?_=" + Date.now();
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("pages-grid");
  if (grid) {
    grid.innerHTML = PAGES.map(cardHTML).join("");
    // ativa o check de status só nos sistemas
    document.querySelectorAll(".card").forEach((card, i) => {
      if (PAGES[i] && PAGES[i].system) checkStatus(PAGES[i].href, card.querySelector(".status"));
    });
  }
  const total = document.getElementById("stat-total");
  if (total) total.textContent = PAGES.length;

  const clk = document.getElementById("clock");
  if (clk) {
    const tick = () => clk.textContent = new Date().toLocaleTimeString("pt-BR");
    tick(); setInterval(tick, 1000);
  }
});
