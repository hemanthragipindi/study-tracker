const API = "";

let isLogin = true;

function toggleForm() {
  isLogin = !isLogin;
  document.getElementById("formTitle").innerText = isLogin ? "Login" : "Register";
  document.getElementById("name").style.display = isLogin ? "none" : "block";
  document.getElementById("toggleText").innerText =
    isLogin ? "Don't have an account? Register" : "Already have an account? Login";
}

async function submitAuth() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const endpoint = isLogin ? "/api/login" : "/api/register";

  const body = isLogin
    ? { email, password }
    : { name, email, password };

  const res = await fetch(API + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (isLogin) {
    localStorage.setItem("token", data.token);
    loadDashboard();
  } else {
    alert("Registered successfully! Now login.");
    toggleForm();
  }
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

function loadDashboard() {
  document.getElementById("authCard").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadTasks();
}

async function addTask() {
  const title = document.getElementById("title").value;
  const subject = document.getElementById("subject").value;
  const hours = document.getElementById("hours").value;

  await fetch(API + "/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({ title, subject, hours })
  });

  loadTasks();
}

async function loadTasks() {
  const res = await fetch(API + "/api/tasks", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  });

  const tasks = await res.json();
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `
      <strong>${task.title}</strong><br>
      ${task.subject} - ${task.hours} hours
      <button onclick="deleteTask('${task._id}')">Delete</button>
    `;
    taskList.appendChild(div);
  });
}

async function deleteTask(id) {
  await fetch(API + "/api/tasks/" + id, {
    method: "DELETE",
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  });

  loadTasks();
}

if (localStorage.getItem("token")) {
  loadDashboard();
}
