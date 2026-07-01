const stackGrid = document.querySelector("#stackGrid");
const projectGrid = document.querySelector("#projectGrid");
const filterButtons = document.querySelectorAll(".filter");
const year = document.querySelector("#year");
const statLine = document.querySelector("#statLine");

year.textContent = new Date().getFullYear();

const CATEGORY_ICON = { labs: "~", cti: "{ }", tools: "⚙" };
const GITHUB_SVG = `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;

// teto de 3 colunas; com menos itens que 3, os cards esticam pra ocupar a linha inteira
function setDynamicCols(grid, count) {
  const cols = Math.min(count, 3) || 1;
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

function renderStats() {
  const categorias = new Set(projects.map((p) => p.category)).size;
  statLine.innerHTML = `
    <span><b>${projects.length}</b> projetos</span>
    <span class="dot">·</span>
    <span><b>${stacks.length}</b> stacks</span>
    <span class="dot">·</span>
    <span><b>${categorias}</b> categorias</span>
  `;
}

function renderStacks() {
  stackGrid.innerHTML = stacks.map((stack, i) => `
    <article class="stack-card" style="--i:${i}">
      <h3>${stack.title}</h3>
      <div class="chips">
        ${stack.items.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </article>
  `).join("");
  setDynamicCols(stackGrid, stacks.length);
}

function renderProjects(filter = "all") {
  const visible = filter === "all" ? projects : projects.filter((project) => project.category === filter);

  projectGrid.innerHTML = visible.map((project, i) => {
    const hasPage = project.path && project.path !== "#";
    return `
    <article class="project-card ${project.featured ? "featured" : ""} ${hasPage ? "clickable" : "disabled"}" style="--i:${i}" ${hasPage ? `data-path="${project.path}"` : ""}>
      <div class="project-topline">
        <span class="cat-ico" style="--accent:${project.category === "cti" ? "#ff7a18" : project.category === "tools" ? "#7ce5d0" : "#9d7ce5"}">${project.icon || CATEGORY_ICON[project.category] || "•"}</span>
        <span>${project.category.toUpperCase()}</span>
        <small>${project.status}</small>
      </div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="chips">
        ${project.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
      <div class="project-actions">
        ${hasPage ? "" : `<span>página indisponível</span>`}
        ${project.repo ? `<a href="${project.repo}" target="_blank" rel="noreferrer" class="repo-link" data-repo-link>${GITHUB_SVG} Repo</a>` : ``}
      </div>
    </article>
  `;
  }).join("");
  setDynamicCols(projectGrid, visible.length);
}

// card inteiro navega pra page (se tiver); clique no link do repo não dispara a navegação do card
projectGrid.addEventListener("click", (e) => {
  if (e.target.closest("[data-repo-link]")) return;
  const card = e.target.closest(".project-card.clickable");
  if (card) window.location.href = card.dataset.path;
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProjects(button.dataset.filter);
  });
});

renderStats();
renderStacks();
renderProjects();

// ── barra de progresso de scroll ──
const scrollProgress = document.querySelector("#scrollProgress");
function updateScrollProgress() {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
  scrollProgress.style.transform = `scaleX(${scrolled})`;
}
document.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

// ── nav ativa por seção visível ──
const navLinks = document.querySelectorAll(".nav a[data-nav]");
const sections = [...navLinks].map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
if ("IntersectionObserver" in window && sections.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.dataset.nav === entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => observer.observe(s));
}

// ── spotlight que segue o mouse na página inteira (desliga se prefers-reduced-motion) ──
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) {
  document.addEventListener("pointermove", (e) => {
    document.documentElement.style.setProperty("--mx", `${(e.clientX / window.innerWidth) * 100}%`);
    document.documentElement.style.setProperty("--my", `${(e.clientY / window.innerHeight) * 100}%`);
  });
}
