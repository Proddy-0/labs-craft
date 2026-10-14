const stackGrid = document.querySelector("#stackGrid");
const projectGrid = document.querySelector("#projectGrid");
const filterButtons = document.querySelectorAll(".filter");
const statLine = document.querySelector("#statLine");

const CATEGORY_ICON = { labs: "~", cti: "{ }", tools: "fn" };
const GITHUB_SVG = `<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderStats() {
  const categorias = new Set(projects.map((p) => p.category)).size;
  statLine.innerHTML = `
    <span><b>${projects.length}</b> projetos</span>
    <span aria-hidden="true">·</span>
    <span><b>${stacks.length}</b> stacks</span>
    <span aria-hidden="true">·</span>
    <span><b>${categorias}</b> categorias</span>
  `;
}

function renderStacks() {
  stackGrid.innerHTML = stacks.map((stack) => `
    <article class="p-card">
      <h3>${esc(stack.title)}</h3>
      <div class="chips">
        ${stack.items.map((item) => `<span class="p-chip">${esc(item)}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function statusClass(status) {
  if (status === "Publicado") return "p-chip p-chip-ok";
  if (status === "Ativo") return "p-chip p-chip-dev";
  return "p-chip";
}

function renderProjects(filter = "all") {
  const visible = filter === "all" ? projects : projects.filter((project) => project.category === filter);

  projectGrid.innerHTML = visible.map((project) => {
    const hasPage = project.path && project.path !== "#";
    const external = hasPage && /^https?:/.test(project.path);
    const title = hasPage
      ? `<a href="${esc(project.path)}"${external ? ' rel="noreferrer"' : ""}>${esc(project.title)}</a>`
      : esc(project.title);
    return `
    <article class="p-card project-card ${project.featured ? "featured" : ""}">
      <div class="project-top">
        <span class="ico" aria-hidden="true">${esc(project.icon || CATEGORY_ICON[project.category] || "•")}</span>
        <span class="cat">${esc(project.category.toUpperCase())}</span>
        <span class="${statusClass(project.status)}">${esc(project.status)}</span>
      </div>
      <h3>${title}</h3>
      <p>${esc(project.description)}</p>
      <div class="chips">
        ${project.tags.map((tag) => `<span class="p-chip">${esc(tag)}</span>`).join("")}
      </div>
      <div class="project-actions">
        ${hasPage ? "" : `<span class="off">página indisponível</span>`}
        ${project.repo ? `<a href="${esc(project.repo)}" target="_blank" rel="noreferrer" class="repo-link">${GITHUB_SVG} Repo</a>` : ""}
      </div>
    </article>
  `;
  }).join("");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    renderProjects(button.dataset.filter);
  });
});

renderStats();
renderStacks();
renderProjects();

// nav ativa por seção visível
const navLinks = document.querySelectorAll(".p-nav a[data-nav]");
const sections = [...navLinks].map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
if ("IntersectionObserver" in window && sections.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        if (a.dataset.nav === entry.target.id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => observer.observe(s));
}
