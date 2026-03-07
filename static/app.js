const API = "/diary";
let editingId = null;

document.addEventListener("DOMContentLoaded", function () {

  const entriesDiv = document.getElementById("entries");
  const dateInput = document.getElementById("date");
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const lockScreen = document.getElementById("lockScreen");
  const diaryApp = document.getElementById("diaryApp");
  const addBtn = document.getElementById("addBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const musicBtn = document.getElementById("musicBtn");
  const music = document.getElementById("hpMusic");

  // Ensure diary is hidden on load
  diaryApp.classList.add("hidden");
  lockScreen.classList.remove("hidden");

  // ---------------- SAVE DIARY ----------------
  function saveDiary() {

  const date = dateInput.value.trim();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!date || !title || !content) {
    showMagicError("The parchment is incomplete.");
    return;
  }

  const method = editingId ? "PUT" : "POST";
  const url = editingId ? `${API}/${editingId}` : API;

  fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ date, title, content })
  })
  .then(res => res.json().then(data => ({ status: res.status, body: data })))
  .then(response => {

    if (response.status !== 200) {
      showMagicError(response.body.error || "A dark spell corrupted the entry.");
      return;
    }

    clearForm();
    loadEntries();
  })
  .catch(() => showMagicError("The castle rejected the spell."));
}

  // ---------------- LOAD ENTRIES ----------------
  function loadEntries() {
    fetch(API, { credentials: "include" })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(response => {

        if (response.status !== 200) {
          showMagicError(response.body.error || "The diary refuses to open.");
          return;
        }

        entriesDiv.innerHTML = "";

        response.body.forEach(e => {
          entriesDiv.innerHTML += `
            <div class="entry">
              <small>${e.date}</small>
              <h3>${e.title}</h3>
              <p>${e.content}</p>
              <button class="entry-btn edit-btn" data-id="${e.id}">Revise ✒️</button>
              <button class="entry-btn delete-btn" data-id="${e.id}">Vanish 🔥</button>
            </div>
          `;
        });
      })
      .catch(() => showMagicError("The castle connection was interrupted."));
  }

  // ---------------- DELETE ----------------
  entriesDiv.addEventListener("click", function (e) {

    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.getAttribute("data-id");

      fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      .then(res => {
        if (!res.ok) {
          showMagicError("The vanish spell failed.");
          return;
        }
        loadEntries();
      })
      .catch(() => showMagicError("The castle refused the vanish spell."));
    }

    if (e.target.classList.contains("edit-btn")) {
      const id = parseInt(e.target.getAttribute("data-id"));

      fetch(API, { credentials: "include" })
        .then(res => res.json())
        .then(entries => {
          const entry = entries.find(e => e.id === id);
          if (!entry) return;

          dateInput.value = entry.date;
          titleInput.value = entry.title;
          contentInput.value = entry.content;

          editingId = id;
        });
    }

  });

  // ---------------- CLEAR FORM ----------------
  function clearForm() {
    dateInput.value = "";
    titleInput.value = "";
    contentInput.value = "";
    editingId = null;
  }

  // ---------------- UNLOCK ----------------
  window.unlockDiary = function () {

    const pass = document.getElementById("password").value.trim().toLowerCase();

    if (pass === "hogwarts") {

      lockScreen.classList.add("hidden");
      diaryApp.classList.remove("hidden");

      loadAccount();
      loadEntries();

    } else {
      showMagicError("The spell failed. The diary remains sealed.");
    }
  };

  // ---------------- LOAD ACCOUNT ----------------
  function loadAccount() {
    fetch("/account", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showMagicError(data.error);
          return;
        }

        document.getElementById("accountInfo").innerHTML =
          `🪶 Keeper of Secrets: <span class="wizard-name">${data.username}</span>`;
      })
      .catch(() => showMagicError("The castle cannot verify your identity."));
  }

  // ---------------- LOGOUT ----------------
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      fetch("/logout", { credentials: "include" })
        .then(() => window.location.href = "/signin")
        .catch(() => showMagicError("The gates refused to close."));
    });
  }

  // ---------------- ADD BUTTON ----------------
  if (addBtn) {
    addBtn.addEventListener("click", saveDiary);
  }

  // ---------------- MUSIC ----------------
  if (musicBtn && music) {
    musicBtn.addEventListener("click", function () {
      if (music.paused) {
        music.play().catch(() => showMagicError("The music spell failed."));
      } else {
        music.pause();
      }
    });
  }

});


// ---------------- GLOBAL MAGIC ERROR ----------------
function showMagicError(message) {

  const existing = document.querySelector(".magic-error");
  if (existing) existing.remove();

  const errorDiv = document.createElement("div");
  errorDiv.className = "magic-error";
  errorDiv.innerText = message;

  document.body.appendChild(errorDiv);

  const errorSound = new Audio("/static/audio/error_spell.mp3");
  errorSound.play().catch(() => {});

  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}