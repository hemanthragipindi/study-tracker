async function createWeek() {
  const weekStart = document.getElementById("weekStart").value;
  const weekEnd = document.getElementById("weekEnd").value;

  const response = await fetch("/api/week", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      weekStart,
      weekEnd,
      subjects: []
    })
  });

  const data = await response.json();
  loadWeeks();
}

async function loadWeeks() {
  const res = await fetch("/api/week");
  const weeks = await res.json();

  const container = document.getElementById("weeksContainer");
  container.innerHTML = "";

  weeks.forEach(week => {
    const div = document.createElement("div");
    div.className = "week-card";
    div.innerHTML = `
      <h3>${week.weekStart} → ${week.weekEnd}</h3>
      <button onclick="addSubject('${week._id}')">+ Add Subject</button>
    `;
    container.appendChild(div);
  });
}

async function addSubject(weekId) {
  const subjectName = prompt("Enter Subject Name:");
  if (!subjectName) return;

  const weeks = await fetch("/api/week").then(r => r.json());
  const week = weeks.find(w => w._id === weekId);

  week.subjects.push({
    name: subjectName,
    units: []
  });

  await fetch("/api/week", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(week)
  });

  loadWeeks();
}

loadWeeks();
