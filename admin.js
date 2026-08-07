// Admin page logic.
// Keeps a working copy ("draft") of SUBJECTS in localStorage so your
// edits survive a page refresh. Nothing is saved to the live site
// until you click "Download data.js" and upload that file yourself.

(function () {
  const STORAGE_KEY = "ivan_subjects_draft_v1";
  const list = document.getElementById("admin-list");
  const downloadBtn = document.getElementById("downloadBtn");
  const addSubjectBtn = document.getElementById("addSubjectBtn");

  let draft = loadDraft();

  function loadDraft() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      /* fall through to defaults */
    }
    return typeof SUBJECTS !== "undefined" ? JSON.parse(JSON.stringify(SUBJECTS)) : [];
  }

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error("Could not save draft:", e);
    }
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str == null ? "" : str;
    return d.innerHTML;
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, "&quot;");
  }

  function render() {
    if (!draft.length) {
      list.innerHTML =
        '<p style="text-align:center;color:var(--text-light);padding:2rem 0;">No subjects yet. Click "+ Add Subject" to create your first one.</p>';
      return;
    }

    list.innerHTML = draft
      .map((s, si) => {
        const materialsHtml = (s.materials || [])
          .map(
            (m, mi) => `
          <div class="material-edit-row">
            <div class="field-group">
              <label>File name</label>
              <input type="text" value="${escapeAttr(m.name)}" data-si="${si}" data-mi="${mi}" data-field="name" class="mat-input" />
            </div>
            <div class="field-group field-group-narrow">
              <label>Type</label>
              <select data-si="${si}" data-mi="${mi}" data-field="type" class="mat-input">
                ${["PDF", "SLIDES", "DOC", "SHEET", "VIDEO", "LINK"]
                  .map((t) => `<option value="${t}" ${m.type === t ? "selected" : ""}>${t}</option>`)
                  .join("")}
              </select>
            </div>
            <div class="field-group">
              <label>Link (Drive, Dropbox, etc.)</label>
              <input type="url" placeholder="https://..." value="${escapeAttr(m.url)}" data-si="${si}" data-mi="${mi}" data-field="url" class="mat-input" />
            </div>
            <div class="field-group field-group-narrow">
              <label>Size / note (optional)</label>
              <input type="text" placeholder="1.2 MB" value="${escapeAttr(m.meta || "")}" data-si="${si}" data-mi="${mi}" data-field="meta" class="mat-input" />
            </div>
            <button class="btn-icon-danger remove-material" data-si="${si}" data-mi="${mi}" title="Remove file">✕</button>
          </div>
        `
          )
          .join("");

        return `
        <div class="admin-subject-card">
          <div class="admin-subject-head">
            <div class="field-group field-group-narrow">
              <label>Code</label>
              <input type="text" value="${escapeAttr(s.code)}" data-si="${si}" data-field="code" class="subj-input" placeholder="IT2108" />
            </div>
            <div class="field-group">
              <label>Title</label>
              <input type="text" value="${escapeAttr(s.title)}" data-si="${si}" data-field="title" class="subj-input" placeholder="Course title" />
            </div>
            <button class="btn-icon-danger remove-subject" data-si="${si}" title="Remove subject">✕ Remove</button>
          </div>
          <div class="field-group">
            <label>Description</label>
            <textarea rows="2" data-si="${si}" data-field="description" class="subj-input" placeholder="One or two sentences about the course">${escapeHtml(s.description)}</textarea>
          </div>

          <div class="admin-materials-block">
            <h4>Instructional Materials</h4>
            ${materialsHtml || '<p class="admin-hint" style="margin:0 0 0.8rem;">No files added yet.</p>'}
            <button class="btn btn-outline btn-small add-material" data-si="${si}">+ Add Material</button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // ---- Event delegation ----

  list.addEventListener("input", (e) => {
    const t = e.target;
    const si = t.dataset.si !== undefined ? Number(t.dataset.si) : null;
    if (si === null) return;

    if (t.classList.contains("subj-input")) {
      draft[si][t.dataset.field] = t.value;
      saveDraft();
    } else if (t.classList.contains("mat-input")) {
      const mi = Number(t.dataset.mi);
      draft[si].materials[mi][t.dataset.field] = t.value;
      saveDraft();
    }
  });

  list.addEventListener("click", (e) => {
    const addMat = e.target.closest(".add-material");
    if (addMat) {
      const si = Number(addMat.dataset.si);
      draft[si].materials = draft[si].materials || [];
      draft[si].materials.push({ name: "", type: "PDF", url: "", meta: "" });
      saveDraft();
      render();
      return;
    }

    const remMat = e.target.closest(".remove-material");
    if (remMat) {
      const si = Number(remMat.dataset.si);
      const mi = Number(remMat.dataset.mi);
      draft[si].materials.splice(mi, 1);
      saveDraft();
      render();
      return;
    }

    const remSubj = e.target.closest(".remove-subject");
    if (remSubj) {
      const si = Number(remSubj.dataset.si);
      const label = draft[si].title || draft[si].code || "this subject";
      if (confirm(`Remove "${label}" and all its materials?`)) {
        draft.splice(si, 1);
        saveDraft();
        render();
      }
    }
  });

  addSubjectBtn.addEventListener("click", () => {
    draft.push({ code: "", title: "", description: "", materials: [] });
    saveDraft();
    render();
    const inputs = list.querySelectorAll(".subj-input");
    if (inputs.length) inputs[inputs.length - 3] && inputs[inputs.length - 3].focus();
    list.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  downloadBtn.addEventListener("click", () => {
    const clean = draft.map((s) => ({
      code: (s.code || "").trim(),
      title: (s.title || "").trim(),
      description: (s.description || "").trim(),
      materials: (s.materials || [])
        .filter((m) => m.name || m.url)
        .map((m) => ({
          name: (m.name || "").trim(),
          type: (m.type || "LINK").trim(),
          url: (m.url || "").trim(),
          meta: (m.meta || "").trim(),
        })),
    }));

    const fileContent = `/* ============================================================
   This file holds your subjects and their materials.
   Generated from admin.html on ${new Date().toISOString().slice(0, 10)}.
   You normally won't edit this by hand — use admin.html instead.
   ============================================================ */

const SUBJECTS = ${JSON.stringify(clean, null, 2)};

if (typeof window !== "undefined") window.SUBJECTS_DATA = SUBJECTS;
`;

    const blob = new Blob([fileContent], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  render();
})();
