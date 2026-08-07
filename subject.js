// Renders the individual subject page (subject.html?code=IT2108) from data.js.
// You shouldn't need to edit this file.

(function () {
  const root = document.getElementById("subject-content");
  if (!root) return;

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : str;
    return d.innerHTML;
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const subject =
    typeof SUBJECTS !== "undefined" ? SUBJECTS.find((s) => s.code === code) : null;

  if (!subject) {
    document.title = "Subject not found | Silvestre Ivan";
    root.innerHTML = `
      <div class="materials-section" style="text-align:center;">
        <h2>Subject not found</h2>
        <p>That subject doesn't exist yet, or the link is out of date.</p>
        <a href="subjects.html" class="btn btn-outline">← Back to Subjects</a>
      </div>
    `;
    return;
  }

  document.title = subject.code + " – " + subject.title + " | Silvestre Ivan";

  const materialsHtml =
    subject.materials && subject.materials.length
      ? subject.materials
          .map(
            (m) => `
        <div class="file-item">
          <div class="file-info">
            <div class="file-icon">📄</div>
            <div>
              <div class="file-name">${escapeHtml(m.name)}</div>
              <div class="file-meta">${escapeHtml(m.type || "FILE")}${m.meta ? " · " + escapeHtml(m.meta) : ""}</div>
            </div>
          </div>
          <a href="${escapeHtml(m.url)}" class="btn-download" target="_blank" rel="noopener noreferrer">Download</a>
        </div>
      `
          )
          .join("")
      : `
        <div class="empty-state">
          <p><strong>No files uploaded yet</strong></p>
          <p class="hint">Materials added from the admin page will appear here.</p>
        </div>
      `;

  root.innerHTML = `
    <div class="subject-hero">
      <span class="code">${escapeHtml(subject.code)}</span>
      <h1>${escapeHtml(subject.title)}</h1>
      <p>${escapeHtml(subject.description || "")}</p>
    </div>
    <div class="materials-section">
      <h2>Course Materials</h2>
      <p>Lecture notes, handouts, and resources for this subject</p>
      <div class="file-list">${materialsHtml}</div>
      <div style="text-align:center;margin-top:2.5rem;">
        <a href="subjects.html" class="btn btn-outline">← Back to Subjects</a>
      </div>
    </div>
  `;
})();
