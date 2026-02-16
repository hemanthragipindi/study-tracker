const revisionList = document.getElementById("revisionList");

async function loadRevision() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();

  revisionList.innerHTML = "";

  tasks
    .filter(task => task.status === "Revise" || task.status === "Doubt")
    .forEach(task => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${task.subject} - ${task.unit}</h3>
        <p>${task.content}</p>
        <div class="status">Status: ${task.status}</div>
      `;

      revisionList.appendChild(div);
    });
}

loadRevision();
