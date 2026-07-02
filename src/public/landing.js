const landingEls = {
  authCopy: document.getElementById("landingAuthCopy"),
  authFootnote: document.getElementById("landingAuthFootnote"),
  enterWorkspaceLink: document.getElementById("enterWorkspaceLink"),
  googleHeroLink: document.getElementById("landingGoogleHeroLink"),
  googleLoginLink: document.getElementById("landingGoogleLoginLink"),
  trialAccessLink: document.getElementById("landingTrialAccessLink"),
};

let landingAuthState = { authEnabled: false, authenticated: false };
let googleAuthState = { enabled: false, configured: false, loginUrl: "/auth/google/start?returnTo=%2Fapp" };

function renderLandingAuth() {
  const { authEnabled, authenticated } = landingAuthState;
  const googleReady = !!(googleAuthState.enabled && googleAuthState.configured);
  const loginUrl = googleAuthState.loginUrl || "/auth/google/start?returnTo=%2Fapp";

  [landingEls.googleHeroLink, landingEls.googleLoginLink].forEach((link) => {
    if (!link) return;
    link.classList.toggle("hidden", !googleReady);
    link.href = loginUrl;
  });
  landingEls.trialAccessLink?.classList.toggle("hidden", googleReady);

  if (landingEls.enterWorkspaceLink) {
    landingEls.enterWorkspaceLink.classList.toggle("ghost-btn", googleReady);
    landingEls.enterWorkspaceLink.classList.toggle("primary-btn", !googleReady);
    landingEls.enterWorkspaceLink.textContent = authenticated ? "Open workspace" : "Log in";
  }

  if (landingEls.authCopy) {
    if (authenticated) {
      landingEls.authCopy.textContent = "You are already signed in. Continue directly to the workspace.";
    } else if (googleReady) {
      landingEls.authCopy.textContent = "Continue with Google to create or open your trial workspace.";
    } else if (!authEnabled) {
      landingEls.authCopy.textContent = "This preview is currently open. Continue directly to the workspace.";
    } else {
      landingEls.authCopy.textContent = "Continue to the private workspace. You will enter your password on the secure app login screen.";
    }
  }

  if (landingEls.authFootnote) {
    landingEls.authFootnote.textContent = googleReady
      ? "Google trial users get a clean workspace automatically. Password login remains available for existing accounts."
      : authEnabled
      ? "Password login is reserved for existing owner or internal accounts."
      : "Trial access is open in this environment. You can enter the workspace directly.";
  }
}

async function refreshLandingAuth() {
  try {
    const [metaResponse, sessionResponse, googleResponse] = await Promise.all([
      fetch("/api/meta"),
      fetch("/api/session"),
      fetch("/api/auth/google/status"),
    ]);
    const meta = metaResponse.ok ? await metaResponse.json() : { authEnabled: false };
    const session = sessionResponse.ok ? await sessionResponse.json() : { authenticated: false };
    googleAuthState = googleResponse.ok
      ? await googleResponse.json()
      : { enabled: false, configured: false, loginUrl: "/auth/google/start?returnTo=%2Fapp" };
    landingAuthState = {
      authEnabled: !!meta.authEnabled,
      authenticated: !!session.authenticated,
    };
  } catch {
    landingAuthState = { authEnabled: false, authenticated: false };
  }

  renderLandingAuth();
}

refreshLandingAuth();
