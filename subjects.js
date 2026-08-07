// Renders the subject card grid on subjects.html from data.js.
// You shouldn't need to edit this file.

(function () {
  const grid = document.getElementById("subjects-grid");
  if (!grid || typeof SUBJECTS === "undefined") return;

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : str;
    return d.innerHTML;
  }

  if (!SUBJECTS.length) {
    grid.innerHTML =
      '<p style="grid-column:1/-1;text-align:center;color:var(--text-light);">No subjects yet. Add one from the admin page.</p>';
    return;
  }

  SUBJECTS.forEach((s) => {
    const card = document.createElement("div");
    card.className = "subject-card";
    card.innerHTML = `
      <span class="subject-code">${escapeHtml(s.code)}</span>
      <h3>${escapeHtml(s.title)}</h3>
      <p>${escapeHtml(s.description || "")}</p>
      <a href="subject.html?code=${encodeURIComponent(s.code)}" class="btn btn-primary">View Subject →</a>
    `;
    grid.appendChild(card);
  });
})();
