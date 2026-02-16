const taskList = document.getElementById("taskList");

async function loadTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();

  taskList.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${task.subject} - ${task.unit}</h3>
      <p>${task.content}</p>
      <button class="btn-complete" onclick="updateStatus('${task._id}','Complete')">Complete</button>
      <button class="btn-doubt" onclick="updateStatus('${task._id}','Doubt')">Doubt</button>
      <button class="btn-revise" onclick="updateStatus('${task._id}','Revise')">Revise</button>
      <button class="btn-delete" onclick="deleteTask('${task._id}')">Delete</button>
      <div class="status">Status: ${task.status || "Pending"}</div>
    `;

    taskList.appendChild(div);
  });
}

async function addTask() {
  const subject = document.getElementById("subject").value;
  const unit = document.getElementById("unit").value;
  const content = document.getElementById("content").value;

  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, unit, content, status: "Pending" })
  });

  loadTasks();
}

async function updateStatus(id, status) {
  await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  loadTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

loadTasks();
