function loadpage(baseFile, content) {
  fetch(baseFile)
    .then((res) => res.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const baseContent = doc.querySelector("#content");
      if (!baseContent) return;
      baseContent.innerHTML = content;
      document.body.innerHTML = doc.body.innerHTML;
      initPageFunctionality();
      initMobileMenu();
    })
    .catch((err) => console.error("Error loading base:", err));
}
document.addEventListener("click", (e) => {
  if (e.target.closest("#btn")) {
    const menu = document.getElementById("menu");
    if (menu) {
      menu.classList.toggle("hidden");
    }
  }
});
function initMobileMenu() {
  const menuToggle = document.getElementById("mobileMenuToggle");
  const closeMenu = document.getElementById("closeMobileMenu");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
    });
  }

  if (closeMenu && mobileMenu) {
    closeMenu.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  }

  const mobileMenuLinks = document.querySelectorAll("#mobileMenu a");
  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initPageFunctionality();
});

function initPageFunctionality() {
  initMobileMenu();

  if (document.getElementById("addTeamForm")) initTeamsPage();
  if (document.getElementById("addTaskForm")) initTasksPage();
  if (document.getElementById("contactForm")) initContactPage();
  if (document.querySelector(".progress-bar")) initAnalyticsPage();
}

function initTeamsPage() {
  const form = document.getElementById("addTeamForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const teamName = document.getElementById("teamName").value;
    const department = document.getElementById("department").value;
    const members = document.getElementById("members").value;

    if (teamName && department && members) {
      const memberArray = members
        .split(",")
        .map((member) => member.trim())
        .filter((member) => member !== "");
      const memberCount = memberArray.length;

      const newTeamCard = document.createElement("div");
      newTeamCard.className =
        "card p-6 bg-gray-800 rounded-lg border border-gray-700";
      newTeamCard.innerHTML = `
        <h3 class="text-xl font-bold text-white mb-2">${teamName}</h3>
        <p class="text-gray-400 mb-2">${department}</p>
        <p class="text-gray-400 mb-4">${memberCount} members</p>
        <button class="btn-primary w-full" onclick="openTeamModal('${teamName}', ${JSON.stringify(
        memberArray
      ).replace(/'/g, "\\'")})">View Members</button>
      `;

      const teamsGrid = document.querySelector(
        ".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6.mb-8"
      );
      if (teamsGrid) {
        teamsGrid.appendChild(newTeamCard);
      }

      document.getElementById("teamSuccessMessage").classList.remove("hidden");
      form.reset();

      setTimeout(() => {
        document.getElementById("teamSuccessMessage").classList.add("hidden");
      }, 3000);
    }
  });
}

function initTasksPage() {
  const form = document.getElementById("addTaskForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value;
    const desc = document.getElementById("taskDescription").value;
    const team = document.getElementById("taskTeam").value;
    const deadline = document.getElementById("taskDeadline").value;
    const priority = document.getElementById("taskPriority").value;

    if (title && desc && team && deadline && priority) {
      const newTask = document.createElement("div");
      newTask.className =
        "task-item bg-gray-800 p-4 rounded-lg border border-gray-700 mb-3";
      newTask.setAttribute("data-team", team);
      newTask.setAttribute("data-priority", priority);

      const teamDisplayName = getTeamDisplayName(team);
      const priorityClass = getPriorityClass(priority);

      newTask.innerHTML = `
        <h4 class="font-bold text-white">${title}</h4>
        <p class="text-gray-400 text-sm my-2">${desc}</p>
        <div class="flex justify-between items-center mt-3">
          <span class="text-xs text-gray-500">${teamDisplayName}</span>
          <span class="text-xs ${priorityClass} text-white px-2 py-1 rounded">${
        priority.charAt(0).toUpperCase() + priority.slice(1)
      }</span>
        </div>
      `;

      const pendingTasks = document.getElementById("pendingTasks");
      if (pendingTasks) {
        pendingTasks.appendChild(newTask);
        updateTaskCount("pendingTasks", "pending");

        newTask.setAttribute("draggable", "true");
        newTask.addEventListener("dragstart", function () {
          this.classList.add("dragging");
        });
        newTask.addEventListener("dragend", function () {
          this.classList.remove("dragging");
        });
      }

      document.getElementById("taskSuccessMessage").classList.remove("hidden");
      form.reset();

      setTimeout(() => {
        document.getElementById("taskSuccessMessage").classList.add("hidden");
      }, 3000);
    }
  });

  const teamFilter = document.getElementById("teamFilter");
  const priorityFilter = document.getElementById("priorityFilter");
  const taskSearch = document.getElementById("taskSearch");

  if (teamFilter) teamFilter.addEventListener("change", filterTasks);
  if (priorityFilter) priorityFilter.addEventListener("change", filterTasks);
  if (taskSearch) taskSearch.addEventListener("input", filterTasks);

  const taskItems = document.querySelectorAll(".task-item");
  const taskLists = document.querySelectorAll(".task-list");

  taskItems.forEach((task) => {
    task.setAttribute("draggable", "true");
    task.addEventListener("dragstart", () => task.classList.add("dragging"));
    task.addEventListener("dragend", () => task.classList.remove("dragging"));
  });

  taskLists.forEach((list) => {
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      if (dragging) {
        list.appendChild(dragging);
        updateTaskCounts();
      }
    });
  });
}

function initContactPage() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const subject = document.getElementById("contactSubject").value;
    const message = document.getElementById("contactMessage").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name && email && subject && message && emailRegex.test(email)) {
      document
        .getElementById("contactSuccessMessage")
        .classList.remove("hidden");
      form.reset();

      setTimeout(() => {
        document
          .getElementById("contactSuccessMessage")
          .classList.add("hidden");
      }, 3000);
    } else {
      alert("Please enter a valid email address");
    }
  });
}

function initAnalyticsPage() {
  document.querySelectorAll(".progress-fill").forEach((bar) => {
    const width = bar.style.width;
    bar.style.width = "0";
    setTimeout(() => (bar.style.width = width), 500);
  });
}

function filterTasks() {
  const team = document.getElementById("teamFilter")?.value || "all";
  const priority = document.getElementById("priorityFilter")?.value || "all";
  const search =
    document.getElementById("taskSearch")?.value.toLowerCase() || "";

  document.querySelectorAll(".task-item").forEach((task) => {
    const t = task.getAttribute("data-team");
    const p = task.getAttribute("data-priority");
    const title = task.querySelector("h4").textContent.toLowerCase();
    const desc = task.querySelector("p").textContent.toLowerCase();

    const visible =
      (team === "all" || t === team) &&
      (priority === "all" || p === priority) &&
      (search === "" || title.includes(search) || desc.includes(search));

    task.style.display = visible ? "block" : "none";
  });
}

function openTeamModal(teamName, members) {
  const modal = document.getElementById("teamModal");
  const modalTeamName = document.getElementById("modalTeamName");
  const modalTeamMembers = document.getElementById("modalTeamMembers");

  if (!modal || !modalTeamName || !modalTeamMembers) return;

  modalTeamName.textContent = `${teamName} Members`;
  modalTeamMembers.innerHTML = "";

  members.forEach((member) => {
    const el = document.createElement("div");
    el.className = "flex items-center p-3 bg-gray-800 rounded-lg mb-2";
    el.innerHTML = `
      <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
        <span class="text-white text-sm font-bold">${member.charAt(0)}</span>
      </div>
      <span class="text-white">${member}</span>`;
    modalTeamMembers.appendChild(el);
  });

  modal.classList.remove("hidden");
}

window.addEventListener("click", (e) => {
  const modal = document.getElementById("teamModal");
  if (e.target === modal) modal.classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", function () {
  const closeModal = document.getElementById("closeModal");
  const modal = document.getElementById("teamModal");

  if (closeModal && modal) {
    closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  }
});

function getTeamDisplayName(teamValue) {
  const teams = {
    design: "Design Team",
    development: "Development Team",
    marketing: "Marketing Team",
  };
  return teams[teamValue] || teamValue;
}

function getPriorityClass(priority) {
  const classes = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };
  return classes[priority] || "bg-gray-500";
}

function updateTaskCount(columnId, status) {
  const taskList = document.getElementById(columnId);
  if (taskList) {
    const taskCount = taskList.children.length;
    const countElement = taskList
      .closest(".task-column")
      .querySelector(".text-gray-400.text-sm");

    if (countElement) {
      countElement.textContent = `(${taskCount} tasks)`;
    }
  }
}

function updateTaskCounts() {
  updateTaskCount("pendingTasks", "pending");
  updateTaskCount("inProgressTasks", "in-progress");
  updateTaskCount("completedTasks", "completed");
}
