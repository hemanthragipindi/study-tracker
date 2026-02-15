const API = "http://localhost:3000";

// Load all topics
function loadTopics() {
    fetch(API + "/topics")
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById("tableBody");
            table.innerHTML = "";

            let completed = 0;
            const today = new Date().toISOString().split("T")[0];

            data.forEach(t => {
                if (t.status === "Completed") completed++;

                const overdueClass =
                    t.deadline && t.deadline < today && t.status !== "Completed"
                        ? "overdue"
                        : "";

                table.innerHTML += `
                    <tr>
                        <td>${t.subject}</td>
                        <td>${t.topic}</td>
                        <td>${t.status}</td>
                        <td class="${overdueClass}">${t.deadline || ""}</td>
                        <td>
                            <button onclick="updateStatus(${t.id}, 'Completed')">✅</button>
                            <button onclick="updateStatus(${t.id}, 'Doubt')">❓</button>
                            <button onclick="deleteTopic(${t.id})">🗑️</button>
                        </td>
                    </tr>
                `;
            });

            const percent =
                data.length === 0
                    ? 0
                    : Math.round((completed / data.length) * 100);

            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = percent + "%";
            progressBar.innerText = percent + "%";
        });
}

// Add topic
function addTopic() {
    const subject = document.getElementById("subject").value;
    const topic = document.getElementById("topic").value;
    const deadline = document.getElementById("deadline").value;

    if (!subject || !topic) {
        alert("Please enter subject and topic");
        return;
    }

    fetch(API + "/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, deadline })
    }).then(() => {
        document.getElementById("subject").value = "";
        document.getElementById("topic").value = "";
        document.getElementById("deadline").value = "";
        loadTopics();
    });
}

// Update status
function updateStatus(id, status) {
    fetch(API + "/update/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    }).then(() => loadTopics());
}

// Delete topic
function deleteTopic(id) {
    fetch(API + "/delete/" + id, {
        method: "DELETE"
    }).then(() => loadTopics());
}

// Filter by subject
function filterSubjects() {
    const input = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#tableBody tr");

    rows.forEach(row => {
        const subject = row.children[0].innerText.toLowerCase();
        row.style.display = subject.includes(input) ? "" : "none";
    });
}

// Load data on page start
loadTopics();
