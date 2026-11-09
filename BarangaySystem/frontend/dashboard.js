let noteList = [];

function dashboardHtml() {
  const today = new Date().toLocaleDateString("en-PH", { dateStyle: "full" });
  return `
    <section class="hero">
      ${logoHtml("big")}
      <div class="hero-text">
        <h1>Barangay Resident and Request System</h1>
        <p>${today}</p>
      </div>
      <div class="quick">
        <a class="btn" href="#/residents">+ Add resident</a>
        <a class="btn" href="#/requests">+ New request</a>
      </div>
    </section>

    <section class="stats">
      <div class="card stat"><strong id="stat-residents">0</strong>Residents</div>
      <div class="card stat pending"><strong id="stat-pending">0</strong>Pending requests</div>
      <div class="card stat"><strong id="stat-approved">0</strong>Approved requests</div>
      <div class="card stat"><strong id="stat-released">0</strong>Released requests</div>
    </section>

    <section class="two-col">
      <div class="card"><h3>Residents by sex</h3><div id="sex-bars"></div></div>
      <div class="card"><h3>Top puroks</h3><div id="purok-bars"></div></div>
    </section>

    <section class="two-col">
      <div class="card">
        <h3>Recent requests</h3>
        <div class="table-wrap"><table><tbody id="recent-rows"></tbody></table></div>
      </div>
      <div class="card">
        <h3>Announcements</h3>
        <form id="note-form">
          <input name="title" placeholder="Title" required>
          <textarea name="message" placeholder="Message" rows="2" required></textarea>
          <div class="form-actions">
            <button type="submit">Post</button>
          </div>
        </form>
        <div id="note-list"></div>
      </div>
    </section>`;
}

function bar(label, value, total) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return `<div class="bar-row"><span>${esc(label)}</span><div class="bar"><i style="width:${pct}%"></i></div><b>${value}</b></div>`;
}

async function loadStats() {
  try {
    const stats = await api("/stats");
    if (!$("stat-residents")) return;
    $("stat-residents").textContent = stats.residents;
    $("stat-pending").textContent = stats.pending;
    $("stat-approved").textContent = stats.approved;
    $("stat-released").textContent = stats.released;
    $("sex-bars").innerHTML = bar("Male", stats.male, stats.residents) + bar("Female", stats.female, stats.residents);

    let purokBars = "";
    for (let p of stats.puroks) {
      purokBars += bar(p._id, p.total, stats.residents);
    }
    $("purok-bars").innerHTML = purokBars || '<p class="muted">No residents yet.</p>';

    let rows = "";
    for (let q of stats.recent) {
      rows += `
        <tr>
          <td>${q.resident ? esc(q.resident.lastName) + ", " + esc(q.resident.firstName) : "(deleted)"}</td>
          <td>${esc(q.type)}</td>
          <td><span class="badge ${q.status}">${q.status}</span></td>
        </tr>`;
    }
    $("recent-rows").innerHTML = rows || '<tr><td class="no-rows">No requests yet.</td></tr>';
  } catch (err) {
    toast(err.message, true);
  }
}

function renderNotes() {
  if (!$("note-list")) return;
  let items = "";
  for (let n of noteList) {
    const date = new Date(n.createdAt).toLocaleDateString("en-PH", { dateStyle: "long" });
    items += `
      <div class="note-mini">
        <div class="note-head">
          <b>${esc(n.title)}</b>
          <button class="danger" data-id="${n._id}">Delete</button>
        </div>
        <p>${esc(n.message)}</p>
        <small class="muted">${date} by ${esc(n.author || "Admin")}</small>
      </div>`;
  }
  if (items === "") {
    items = '<p class="muted">No announcements yet.</p>';
  }
  $("note-list").innerHTML = items;
}

async function loadNotes() {
  try {
    noteList = await api("/announcements");
    renderNotes();
  } catch (err) {
    toast(err.message, true);
  }
}

function dashboardInit() {
  noteList = [];

  $("note-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await api("/announcements", "POST", Object.fromEntries(new FormData(e.target)));
      e.target.reset();
      toast("Announcement posted");
      loadNotes();
    } catch (err) {
      toast(err.message, true);
    }
  });

  $("note-list").addEventListener("click", async (e) => {
    const button = e.target.closest("button");
    if (!button || !confirm("Delete this announcement?")) return;

    try {
      await api("/announcements/" + button.dataset.id, "DELETE");
      toast("Announcement deleted");
      loadNotes();
    } catch (err) {
      toast(err.message, true);
    }
  });

  loadStats();
  loadNotes();
}

routes.dashboard = { html: dashboardHtml, init: dashboardInit };
