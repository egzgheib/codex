const STORAGE_KEY = "fitness-goals-v1";

const goalForm = document.getElementById("goal-form");
const goalNameInput = document.getElementById("goal-name");
const goalDeadlineInput = document.getElementById("goal-deadline");
const goalStepInput = document.getElementById("goal-step");
const addStepBtn = document.getElementById("add-step-btn");
const draftStepList = document.getElementById("step-draft-list");
const goalsContainer = document.getElementById("goals-container");
const clearAllBtn = document.getElementById("clear-all-btn");
const goalTemplate = document.getElementById("goal-template");

let draftSteps = [];
let goals = loadGoals();

function loadGoals() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveGoals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

function renderDraftSteps() {
  draftStepList.innerHTML = "";

  draftSteps.forEach((step, index) => {
    const item = document.createElement("li");
    item.textContent = step;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      draftSteps.splice(index, 1);
      renderDraftSteps();
    });

    item.appendChild(removeBtn);
    draftStepList.appendChild(item);
  });
}

function addDraftStep() {
  const step = goalStepInput.value.trim();
  if (!step) return;

  draftSteps.push(step);
  goalStepInput.value = "";
  renderDraftSteps();
  goalStepInput.focus();
}

function resetForm() {
  goalForm.reset();
  draftSteps = [];
  renderDraftSteps();
}

function percentComplete(steps) {
  if (!steps.length) return 0;
  const completed = steps.filter((step) => step.completed).length;
  return Math.round((completed / steps.length) * 100);
}

function formatDate(date) {
  if (!date) return "No deadline";

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "No deadline";

  return `Target: ${parsed.toLocaleDateString()}`;
}

function renderGoals() {
  goalsContainer.innerHTML = "";

  if (!goals.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No goals yet. Add your first one above.";
    goalsContainer.appendChild(empty);
    return;
  }

  goals.forEach((goal) => {
    const fragment = goalTemplate.content.cloneNode(true);
    const article = fragment.querySelector(".goal-item");
    const title = fragment.querySelector(".goal-title");
    const meta = fragment.querySelector(".goal-meta");
    const bar = fragment.querySelector(".progress-bar span");
    const label = fragment.querySelector(".progress-label");
    const list = fragment.querySelector(".completed-list");

    title.textContent = goal.name;
    meta.textContent = formatDate(goal.deadline);

    const pct = percentComplete(goal.steps);
    bar.style.width = `${pct}%`;
    label.textContent = `${pct}% complete`;

    goal.steps.forEach((step) => {
      const item = document.createElement("li");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = step.completed;
      checkbox.addEventListener("change", () => {
        step.completed = checkbox.checked;
        saveGoals();
        renderGoals();
      });

      const text = document.createElement("span");
      text.textContent = step.text;
      if (step.completed) text.classList.add("completed");

      item.append(checkbox, text);
      list.appendChild(item);
    });

    goalsContainer.appendChild(article);
  });
}

addStepBtn.addEventListener("click", addDraftStep);
goalStepInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addDraftStep();
  }
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = goalNameInput.value.trim();
  if (!name) return;

  const goal = {
    id: crypto.randomUUID(),
    name,
    deadline: goalDeadlineInput.value,
    steps: draftSteps.map((step) => ({ text: step, completed: false })),
  };

  goals.unshift(goal);
  saveGoals();
  renderGoals();
  resetForm();
});

clearAllBtn.addEventListener("click", () => {
  goals = [];
  saveGoals();
  renderGoals();
  resetForm();
});

renderDraftSteps();
renderGoals();
