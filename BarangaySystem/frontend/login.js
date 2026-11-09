function loginHtml() {
  return `
    <form id="login-form" class="card login">
      ${logoHtml("big")}
      <h1>Linkod Bayan</h1>
      <p class="muted">Resident and request management. Admin login.</p>

      <input name="username" placeholder="Username" required>
      <input name="password" type="password" placeholder="Password" required>
      <button type="submit">Log in</button>
      <p id="login-error" class="error"></p>
    </form>`;
}
function loginInit() {
  const loginForm = $("login-form");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(loginForm)))
    });
    const data = await response.json();

    if (response.ok) {
      location.hash = "#/dashboard";
    } else {
      $("login-error").textContent = data.error;
    }
  });
}

routes.login = { html: loginHtml, init: loginInit };
