const stackGrid = document.querySelector("#stackGrid");
const projectGrid = document.querySelector("#projectGrid");
const filterButtons = document.querySelectorAll(".filter");
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

// teto de 3 colunas; com menos itens que 3, os cards esticam pra ocupar a linha inteira
function setDynamicCols(grid, count) {
  const cols = Math.min(count, 3) || 1;
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
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

  projectGrid.innerHTML = visible.map((project, i) => `
    <article class="project-card ${project.featured ? "featured" : ""}" style="--i:${i}">
      <div class="project-topline">
        <span>${project.category.toUpperCase()}</span>
        <small>${project.status}</small>
      </div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="chips">
        ${project.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
      <div class="project-actions">
        ${project.path && project.path !== "#" ? `<a href="${project.path}">Abrir page</a>` : `<span>Page pendente</span>`}
        ${project.repo ? `<a href="${project.repo}" target="_blank" rel="noreferrer">Repo</a>` : ``}
      </div>
    </article>
  `).join("");
  setDynamicCols(projectGrid, visible.length);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProjects(button.dataset.filter);
  });
});

renderStacks();
renderProjects();
