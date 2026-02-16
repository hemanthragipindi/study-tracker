async function loadRevision() {
  const res = await fetch("/api/weekly");
  const data = await res.json();

  const revisionList = document.getElementById("revisionList");
  revisionList.innerHTML = "";

  data
    .filter(task => task.status === "revision")
    .forEach(task => {
      revisionList.innerHTML += `
        <div class="card">
          <b>${task.subject}</b> (${task.unit})<br>
          ${task.topic}
        </div>
      `;
    });
}

loadRevision();
