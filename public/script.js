const API_URL = "/api/tasks";

async function loadTasks() {
  const res = await fetch(API_URL);
  const tasks = await res.json();

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${task.subject}</strong> - ${task.topic}
      ${task.completed ? "✅" : ""}
      ${task.doubt ? "❓" : ""}
      <button onclick="deleteTask('${task._id}')">Delete</button>
    `;

    list.appendChild(li);
  });
}

async function addTask() {
  const subject = document.getElementById("subject").value;
  const topic = document.getElementById("topic").value;

  if (!subject || !topic) return alert("Fill all fields");

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject,
      topic
    })
  });

  document.getElementById("subject").value = "";
  document.getElementById("topic").value = "";

  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  loadTasks();
}

loadTasks();
