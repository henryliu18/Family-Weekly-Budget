const landingEls = {
  authCopy: document.getElementById("landingAuthCopy"),
  authFootnote: document.getElementById("landingAuthFootnote"),
  enterWorkspaceLink: document.getElementById("enterWorkspaceLink"),
  loginError: document.getElementById("landingLoginError"),
  loginForm: document.getElementById("landingLoginForm"),
  loginBtn: document.getElementById("landingLoginBtn"),
  passwordInput: document.getElementById("landingPasswordInput"),
};

let landingAuthState = { authEnabled: false, authenticated: false };

function setLandingError(message = "") {
  if (!landingEls.loginError) return;
  landingEls.loginError.textContent = message;
  landingEls.loginError.classList.toggle("hidden", !message);
}

function renderLandingAuth() {
  const { authEnabled, authenticated } = landingAuthState;
  const showLogin = authEnabled && !authenticated;
  const showEnter = authenticated || !authEnabled;

  landingEls.loginForm?.classList.toggle("hidden", !showLogin);
  landingEls.enterWorkspaceLink?.classList.toggle("hidden", !showEnter);

  if (landingEls.enterWorkspaceLink) {
    landingEls.enterWorkspaceLink.textContent = authenticated ? "Open workspace" : "Enter workspace";
  }

  if (landingEls.authCopy) {
    if (authenticated) {
      landingEls.authCopy.textContent = "You are already signed in. Continue directly to the workspace.";
    } else if (!authEnabled) {
      landingEls.authCopy.textContent = "This preview is currently open. Continue directly to the workspace.";
    } else {
      landingEls.authCopy.textContent = "Use the temporary password to open the private trial workspace.";
    }
  }

  if (landingEls.authFootnote) {
    landingEls.authFootnote.textContent = authEnabled
      ? "Need a trial password? Ask the budget owner to share one with you."
      : "Trial access is open in this environment. You can enter the workspace directly.";
  }
}

async function refreshLandingAuth() {
  try {
    const [metaResponse, sessionResponse] = await Promise.all([
      fetch("/api/meta"),
      fetch("/api/session"),
    ]);
    const meta = metaResponse.ok ? await metaResponse.json() : { authEnabled: false };
    const session = sessionResponse.ok ? await sessionResponse.json() : { authenticated: false };
    landingAuthState = {
      authEnabled: !!meta.authEnabled,
      authenticated: !!session.authenticated,
    };
  } catch {
    landingAuthState = { authEnabled: false, authenticated: false };
  }

  renderLandingAuth();
}

async function handleLandingLogin(event) {
  event.preventDefault();
  setLandingError("");

  const password = landingEls.passwordInput?.value || "";
  landingEls.loginBtn?.setAttribute("disabled", "disabled");

  try {
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setLandingError("Incorrect password. Please try again.");
      return;
    }

    window.location.assign("/app");
  } catch {
    setLandingError("Unable to sign in right now. Please try again.");
  } finally {
    landingEls.loginBtn?.removeAttribute("disabled");
  }
}

landingEls.loginForm?.addEventListener("submit", handleLandingLogin);
refreshLandingAuth();
