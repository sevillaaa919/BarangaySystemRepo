const STATUSES = ["Pending", "Approved", "Released", "Cancelled"];

let requestResidents = [];
let requestList = [];

function requestsHtml() {
  return `
    <h1>Requests</h1>

    <section class="card">
      <h3>New document request</h3>
      <form id="request-form">
        <select name="resident" id="request-resident" required></select>
        <select name="type">
          <option>Barangay Clearance</option>
          <option>Certificate of Residency</option>
          <option>Certificate of Indigency</option>
        </select>
        <input name="purpose" placeholder="Purpose">
        <div class="form-actions">
          <button type="submit">Create request</button>
        </div>
      </form>
    </section>

    <section class="card">
      <form class="filters">
        <input id="req-search" placeholder="Search by resident">
        <select id="type-filter">
          <option value="">All types</option>
          <option>Barangay Clearance</option>
          <option>Certificate of Residency</option>
          <option>Certificate of Indigency</option>
        </select>
        <select id="status-filter">
          <option value="">All statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Released</option>
          <option>Cancelled</option>
        </select>
      </form>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Resident</th><th>Type</th><th>Purpose</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody id="request-rows"></tbody>
        </table>
      </div>
    </section>`;
}

async function loadRequests() {
  try {
    requestResidents = await api("/residents");
    requestList = await api("/requests");
    renderRequests();
  } catch (err) {
    toast(err.message, true);
  }
}

function renderRequests() {
  if (!$("request-rows")) return;
  const select = $("request-resident");
  const current = select.value;
  let options = '<option value="">Select resident</option>';
  for (let r of requestResidents) {
    options += `<option value="${r._id}">${esc(r.lastName)}, ${esc(r.firstName)}</option>`;
  }
  select.innerHTML = options;
  select.value = current;

  const text = $("req-search").value.trim().toLowerCase();
  const typeFilter = $("type-filter").value;
  const statusFilter = $("status-filter").value;
  let rows = "";
  for (let q of requestList) {
    const name = q.resident ? q.resident.firstName + " " + q.resident.lastName : "";
    const matchName = !text || name.toLowerCase().includes(text);
    const matchType = !typeFilter || q.type === typeFilter;
    const matchStatus = !statusFilter || q.status === statusFilter;

    if (matchName && matchType && matchStatus) {
      let statusOptions = "";
      for (let s of STATUSES) {
        statusOptions += `<option ${s === q.status ? "selected" : ""}>${s}</option>`;
      }
      const canPrint = q.status === "Approved" || q.status === "Released";
      const certButton = canPrint ? `<a class="btn" href="#/certificate/${q._id}">Certificate</a>` : "";

      rows += `
        <tr>
          <td>${q.resident ? esc(q.resident.lastName) + ", " + esc(q.resident.firstName) : "(deleted)"}</td>
          <td>${q.type}</td>
          <td>${esc(q.purpose)}</td>
          <td><span class="badge ${q.status}">${q.status}</span></td>
          <td>
            <div class="actions">
              <select data-id="${q._id}">${statusOptions}</select>
              ${certButton}
            </div>
          </td>
        </tr>`;
    }
  }

  if (rows === "") {
    rows = '<tr><td colspan="5" class="no-rows">No requests found.</td></tr>';
  }
  $("request-rows").innerHTML = rows;
}
function requestsInit() {
  requestResidents = [];
  requestList = [];

  $("request-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      await api("/requests", "POST", Object.fromEntries(new FormData(e.target)));
      e.target.reset();
      toast("Request created");
      loadRequests();
    } catch (err) {
      toast(err.message, true);
    }
  });

  $("request-rows").addEventListener("change", async (e) => {
    if (e.target.tagName !== "SELECT") return;

    try {
      await api("/requests/" + e.target.dataset.id, "PUT", { status: e.target.value });
      toast("Status updated");
      loadRequests();
    } catch (err) {
      toast(err.message, true);
    }
  });

  const filterIds = ["req-search", "type-filter", "status-filter"];
  for (let id of filterIds) {
    $(id).addEventListener("input", renderRequests);
  }

  loadRequests();
}

routes.requests = { html: requestsHtml, init: requestsInit };
