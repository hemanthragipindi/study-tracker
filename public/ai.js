async function loadRevision() {
  const res = await fetch("/api/week");
  const weeks = await res.json();

  const container = document.getElementById("revisionContainer");
  container.innerHTML = "";

  weeks.forEach(week => {
    week.subjects.forEach(subject => {
      subject.units.forEach(unit => {
        unit.topics.forEach(topic => {
          if (topic.status === "revise") {
            const div = document.createElement("div");
            div.innerText = subject.name + " - " + topic.title;
            container.appendChild(div);
          }
        });
      });
    });
  });
}

loadRevision();
