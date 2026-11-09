function $(id) {
  return document.getElementById(id);
}

function esc(text = "") {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(text).replace(/[&<>"']/g, (c) => map[c]);
}

async function api(url, method = "GET", body) {
  const response = await fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 401) {
    location.hash = "#/login";
    throw new Error("Please log in");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function toast(message, isError = false) {
  const box = $("toast");
  box.textContent = message;
  box.className = "toast show" + (isError ? " error" : "");

  setTimeout(() => {
    box.className = "toast";
  }, 3000);
}

const routes = {};
const PAGES = [
  ["dashboard", "Dashboard"],
  ["residents", "Residents"],
  ["requests", "Requests"]
];

function applyImages(key) {
  const link = IMAGES[key] || IMAGES.hero;
  document.documentElement.style.setProperty("--hero", link ? `url("${link}")` : "none");
}

function confirmBox(message, onYes) {
  const overlay = document.createElement("div");
  overlay.className = "modal";
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>Confirm</h3>
      <p>${esc(message)}</p>
      <div class="modal-actions">
        <button type="button" id="modal-yes">Yes</button>
        <button type="button" id="modal-no" class="secondary">No</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.id === "modal-no") overlay.remove();
  });
  $("modal-yes").addEventListener("click", () => {
    overlay.remove();
    onYes();
  });
}

function logoHtml(size = "") {
  if (IMAGES.logo) {
    return `<img class="logo-img ${size}" src="${esc(IMAGES.logo)}" alt="Barangay logo">`;
  }
  return `<span class="logo-img empty ${size}"></span>`;
}

async function showUser() {
  try {
    const data = await api("/me");
    if ($("whoami")) $("whoami").textContent = data.username;
  } catch (err) {
    return;
  }
}

function showPage() {
  const parts = location.hash.replace("#/", "").split("/");
  const name = parts[0];
  const extra = parts[1];
  const key = routes[name] ? name : "dashboard";
  const isLogin = key === "login";

  document.body.className = isLogin ? "login-body" : "";
  applyImages(key);
  $("nav").classList.toggle("hidden", isLogin);

  let links = "";
  for (let page of PAGES) {
    const active = page[0] === key ? "active" : "";
    links += `<a href="#/${page[0]}" class="${active}">${page[1]}</a>`;
  }
  $("nav").innerHTML = `<div class="brand">${logoHtml()}Linkod Bayan</div><div class="menu">${links}</div><div class="user"><span id="whoami">Admin</span><a href="#" id="logout">Logout</a></div>`;

  $("logout").addEventListener("click", (e) => {
    e.preventDefault();
    confirmBox("Are you sure you want to logout?", async () => {
      await fetch("/logout", { method: "POST" });
      location.hash = "#/login";
    });
  });
  showUser();
  $("view").innerHTML = routes[key].html();
  routes[key].init(extra);
}
document.body.insertAdjacentHTML("beforeend", '<div id="toast" class="toast"></div>');

window.addEventListener("hashchange", showPage);
window.addEventListener("load", showPage);
