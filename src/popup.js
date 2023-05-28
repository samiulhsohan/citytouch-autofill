const homePage = document.getElementById("homePage");
const addNewPage = document.getElementById("addNewPage");
const passwordList = document.getElementById("passwordList");

lucide.createIcons();

let passwords = [];

document
  .getElementById("addNewButton")
  .addEventListener("click", toggleAddNewPage);

document
  .getElementById("goBackToHomeButton")
  .addEventListener("click", toggleHomePage);

document
  .getElementById("addNewForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const result = await chrome.storage.sync.get(["passwords"]);
    const newPasswords = result.passwords
      ? [...result.passwords, data]
      : [data];
    await chrome.storage.sync.set({ passwords: newPasswords });
    e.target.reset();
    populatePasswordList();
    toggleHomePage();
  });

function toggleHomePage() {
  homePage.classList.remove("hidden");
  addNewPage.classList.add("hidden");
}

function toggleAddNewPage() {
  homePage.classList.add("hidden");
  addNewPage.classList.remove("hidden");
}

async function populatePasswordList() {
  passwordList.innerHTML = "";
  passwords = await getPasswords();
  passwords.forEach((password) => {
    const passwordElem = document.createElement("li");
    const userIdElem = document.createElement("p");
    const deleteButton = document.createElement("button");
    const deleteIcon = document.createElement("i");

    userIdElem.textContent = password.userId;
    deleteIcon.setAttribute("icon-name", "trash-2");
    deleteIcon.classList.add("h-5", "w-5");

    deleteButton.appendChild(deleteIcon);
    passwordElem.appendChild(userIdElem);
    passwordElem.appendChild(deleteButton);

    passwordList.appendChild(passwordElem);
    lucide.createIcons();

    passwordElem.addEventListener("click", () => handlePasswordClick(password));
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      handleDeletePassword(password);
    });
  });
}

async function getPasswords() {
  const result = await chrome.storage.sync.get(["passwords"]);
  return result?.passwords ?? [];
}

function handlePasswordClick(password) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, password);
  });
}

function handleDeletePassword(password) {
  const newPasswords = passwords.filter((p) => p.userId !== password.userId);
  chrome.storage.sync.set({ passwords: newPasswords });
  populatePasswordList();
}

populatePasswordList();
