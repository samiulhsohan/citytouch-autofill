let dropdown;
let passwords = [];

function createDropdown() {
  dropdown = document.createElement("div");
  dropdown.id = "passwordDropdown";
}

createDropdown();

function populateDropdown(dropdown, passwords) {
  dropdown.innerHTML = "";
  passwords.forEach((password) => {
    let passwordElem = document.createElement("p");
    passwordElem.textContent = password.userId;
    passwordElem.addEventListener("click", () =>
      handleAutofill(password.userId, password.password)
    );
    dropdown.appendChild(passwordElem);
  });
}

document.addEventListener("focusin", handleFocus);

document.addEventListener("focusout", handleFocusOut);

chrome.runtime.onMessage.addListener((message) => {
  if (message.userId && message.password) {
    handleAutofill(message.userId, message.password);
  }
});

function handleAutofill(userId, password) {
  const userIdInput = document.querySelector("input[name=identity_username]");
  const passwordInput = document.querySelector('input[name="identity_pswdl"]');

  if (userIdInput && passwordInput) {
    userIdInput.value = userId;
    passwordInput.value = password;
  }
}

async function handleFocus(e) {
  if (
    e.target.name === "identity_username" ||
    e.target.name === "identity_pswdl"
  ) {
    document.body.appendChild(dropdown);
    let rect = e.target.getBoundingClientRect();
    dropdown.style.top = `${window.scrollY + rect.bottom}px`;
    dropdown.style.left = `${window.scrollX + rect.left}px`;
    passwords = await getPasswords();
    populateDropdown(dropdown, passwords);
    dropdown.style.display = "block";
  }
}

function handleFocusOut(e) {
  if (
    e.target.name === "identity_username" ||
    e.target.name === "identity_pswdl"
  ) {
    setTimeout(function () {
      dropdown.style.display = "none";
    }, 200);
  }
}

async function getPasswords() {
  try {
    const result = await chrome.storage.sync.get(["passwords"]);
    return result?.passwords ?? [];
  } catch {
    return [];
  }
}
