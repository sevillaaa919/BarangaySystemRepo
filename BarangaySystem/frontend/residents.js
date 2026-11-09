let residentList = [];
let editId = null;
let residentForm;

function residentsHtml() {
  return `
    <h1>Residents</h1>

    <section class="card">
      <h3 id="resident-heading">Register resident</h3>
      <form id="resident-form">
        <input name="firstName" placeholder="First name" required>
        <input name="lastName" placeholder="Last name" required>
        <input name="birthdate" type="date" required>
        <select name="sex"><option>Male</option><option>Female</option></select>
        <input name="purok" placeholder="Purok" required>
        <input name="address" placeholder="Address">
        <input name="contactNumber" placeholder="Contact number">
        <div class="form-actions">
          <button type="button" id="resident-cancel" class="secondary hidden">Cancel</button>
          <button type="submit" id="resident-submit">Add resident</button>
        </div>
      </form>
    </section>

    <section class="card">
      <div class="toolbar">
        <input id="search" placeholder="Search by name">
        <select id="purok-filter"><option value="">All puroks</option></select>
        <select id="sex-filter"><option value="">All sexes</option><option>Male</option><option>Female</option></select>
        <button type="button" id="export-csv" class="secondary">Export CSV</button>
        <span id="resident-count" class="muted"></span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Birthdate</th><th>Age</th><th>Sex</th><th>Purok</th><th>Contact</th><th>Actions</th></tr>
          </thead>
          <tbody id="resident-rows"></tbody>
        </table>
      </div>
    </section>`;
}
async function loadResidents() {
  try {
    residentList = await api("/residents");
    renderResidents();
  } catch (err) {
    toast(err.message, true);
  }
}
function renderResidents() {
  if (!$("resident-rows")) return;

  const text = $("search").value.trim().toLowerCase();
  const purokSelect = $("purok-filter");
  const chosenPurok = purokSelect.value;
  const puroks = [...new Set(residentList.map((r) => r.purok))].sort();
  let options = '<option value="">All puroks</option>';
  for (let p of puroks) {
    options += `<option>${esc(p)}</option>`;
  }
  purokSelect.innerHTML = options;
  purokSelect.value = chosenPurok;

  let rows = "";
  let shown = 0;
  for (let r of residentList) {
    const fullName = r.firstName + " " + r.lastName;
    const matchName = fullName.toLowerCase().includes(text);
    const matchPurok = !chosenPurok || r.purok === chosenPurok;
    const matchSex = !$("sex-filter").value || r.sex === $("sex-filter").value;

    if (matchName && matchPurok && matchSex) {
      shown++;
      rows += `
        <tr>
          <td>${esc(r.lastName)}, ${esc(r.firstName)}</td>
          <td>${r.birthdate.slice(0, 10)}</td>
          <td>${ageOf(r.birthdate)}</td>
          <td>${r.sex}</td>
          <td>${esc(r.purok)}</td>
          <td>${esc(r.contactNumber)}</td>
          <td>
            <div class="actions">
              <button data-action="edit" data-id="${r._id}">Edit</button>
              <button class="danger" data-action="delete" data-id="${r._id}">Delete</button>
            </div>
          </td>
        </tr>`;
    }
  }

  if (rows === "") {
    rows = '<tr><td colspan="7" class="no-rows">No residents found.</td></tr>';
  }
  $("resident-rows").innerHTML = rows;
  $("resident-count").textContent = shown + " of " + residentList.length + " residents";
}
function ageOf(birthdate) {
  const born = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age--;
  return age;
}
function exportResidents() {
  let csv = "First name,Last name,Birthdate,Sex,Purok,Address,Contact\n";
  for (let r of residentList) {
    const cells = [r.firstName, r.lastName, r.birthdate.slice(0, 10), r.sex, r.purok, r.address || "", r.contactNumber || ""];
    let line = "";
    for (let cell of cells) {
      line += '"' + String(cell).replace(/"/g, '""') + '",';
    }
    csv += line.slice(0, -1) + "\n";
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "residents.csv";
  link.click();
}
function resetResidentForm() {
  residentForm.reset();
  editId = null;
  $("resident-heading").textContent = "Register resident";
  $("resident-submit").textContent = "Add resident";
  $("resident-cancel").classList.add("hidden");
}
function residentsInit() {
  residentList = [];
  editId = null;
  residentForm = $("resident-form");

  residentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(residentForm));

    try {
      if (editId) {
        await api("/residents/" + editId, "PUT", data);
      } else {
        await api("/residents", "POST", data);
      }
      toast(editId ? "Resident updated" : "Resident added");
      resetResidentForm();
      loadResidents();
    } catch (err) {
      toast(err.message, true);
    }
  });

  $("resident-cancel").addEventListener("click", resetResidentForm);
  $("search").addEventListener("input", renderResidents);
  $("purok-filter").addEventListener("change", renderResidents);
  $("sex-filter").addEventListener("change", renderResidents);
  $("export-csv").addEventListener("click", exportResidents);
  $("resident-rows").addEventListener("click", async (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    const resident = residentList.find((r) => r._id === button.dataset.id);

    if (button.dataset.action === "edit") {
      const fields = ["firstName", "lastName", "birthdate", "sex", "purok", "address", "contactNumber"];
      for (let field of fields) {
        if (field === "birthdate") {
          residentForm.elements[field].value = resident.birthdate.slice(0, 10);
        } else {
          residentForm.elements[field].value = resident[field] || "";
        }
      }
      editId = resident._id;
      $("resident-heading").textContent = "Edit resident";
      $("resident-submit").textContent = "Save changes";
      $("resident-cancel").classList.remove("hidden");
      residentForm.scrollIntoView();
    }
    if (button.dataset.action === "delete") {
      if (confirm(`Delete ${resident.firstName} ${resident.lastName} and their requests?`)) {
        try {
          await api("/residents/" + resident._id, "DELETE");
          toast("Resident deleted");
          loadResidents();
        } catch (err) {
          toast(err.message, true);
        }
      }
    }
  });

  loadResidents();
}

routes.residents = { html: residentsHtml, init: residentsInit };
