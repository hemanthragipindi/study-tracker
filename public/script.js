const API = ""; // Keep empty for Render deployment

let isLogin = true;

// Toggle between Login & Register
function toggleForm() {
  isLogin = !isLogin;

  document.getElementById("formTitle").innerText = isLogin ? "Login" : "Register";
  document.getElementById("name").style.display = isLogin ? "none" : "block";
  document.getElementById("toggleText").innerText =
    isLogin ? "Don't have an account? Register" : "Already have an account? Login";
}

// Submit Login / Register
async function submitAuth() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  const endpoint = isLogin ? "/api/login" : "/api/register";

  const body = isLogin
    ? { email, password }
    : { name, email, password };

  try {
    const res = await fetch(API + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Response:", data);

    if (!res.ok) {
      alert(data.error || "Something went wrong");
      return;
    }

    if (isLogin) {
      if (!data.token) {
        alert("Login failed. No token received.");
        return;
      }

      localStorage.setItem("token", data.token);
      loadDashboard();
    } else {
      alert("Registered successfully! Now login.");
      toggleForm();
    }

  } catch (err) {
    console.error(err);
    alert("Server error. Try again.");
  }
}

// Logout
function logout() {
  localStorage.removeItem("token");
  location.reload();
}

// Show dashboard
function loadDashboard() {
  document.getElementById("authCard").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadTasks();
}

// Add task
async function addTask() {
  const title = document.getElementById("title").value;
  const subject = document.getElementById("subject").value;
  const hours = document.getElementById("hours").value;

  if (!title || !subject || !hours) {
    alert("Fill all task fields");
    return;
  }

  await fetch(API + "/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({ title, subject, hours })
  });

  document.getElementById("title").value = "";
  document.getElementById("subject").value = "";
  document.getElementById("hours").value = "";

  loadTasks();
}

// Load tasks
async function loadTasks() {
  try {
    const res = await fetch(API + "/api/tasks", {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    });

    if (!res.ok) {
      logout();
      return;
    }

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

  } catch (err) {
    console.error(err);
  }
}

// Delete task
async function deleteTask(id) {
  await fetch(API + "/api/tasks/" + id, {
    method: "DELETE",
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  });

  loadTasks();
}

// Auto login if token exists
if (localStorage.getItem("token")) {
  loadDashboard();
}
