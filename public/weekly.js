const API = "/api/weekly";

async function addTask() {
  const data = {
    weekStart: document.getElementById("weekStart").value,
    weekEnd: document.getElementById("weekEnd").value,
    subject: document.getElementById("subject").value,
    unit: document.getElementById("unit").value,
    topic: document.getElementById("topic").value,
    status: "pending"
  };

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  loadTasks();
}

async function loadTasks() {
  const res = await fetch(API);
  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(task => {
    list.innerHTML += `
      <div class="card">
        <b>${task.subject}</b> (${task.unit})<br>
        ${task.topic}<br>
        Week: ${task.weekStart} → ${task.weekEnd}<br>
        Status: ${task.status}<br>

        <button onclick="updateStatus('${task._id}','completed')">✅ Complete</button>
        <button onclick="updateStatus('${task._id}','doubt')">❓ Doubt</button>
        <button onclick="updateStatus('${task._id}','revision')">🔁 Revise</button>
        <button onclick="deleteTask('${task._id}')">❌ Delete</button>
      </div>
    `;
  });
}

async function updateStatus(id, status) {
  await fetch(API + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  loadTasks();
}

async function deleteTask(id) {
  await fetch(API + "/" + id, {
    method: "DELETE"
  });

  loadTasks();
}

loadTasks();
