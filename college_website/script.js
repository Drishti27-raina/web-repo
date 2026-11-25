/* =====================================================
   SCRIPT.JS  -  College website (login system)
   Order of this file:
     1. Common patterns + helper functions
     2. Local storage helpers (data save/read)
     3. Login page        (email + password validation, remember me)
     4. Forget password   (new password validation)
     5. Register page     (new account banana)
     6. Eye icon          (password show / hide)
   Har page par sirf wahi code chalta hai jiske elements us page par hote hain.
   ===================================================== */


/* =====================================================
   1. COMMON PATTERNS + HELPER FUNCTIONS
   ===================================================== */

// Email ka format: something@something.com
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password: kam se kam 8 characters, letters aur numbers dono hone chahiye
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const PASSWORD_RULE_MSG = "Password must be at least 8 characters long and contain both letters and numbers";

// Input ke neeche error message dikhata hai aur border red karta hai
function showError(inputElement, message) {
  inputElement.style.border = "1px solid red";
  const errorText = document.createElement("small");
  errorText.className = "error-message";
  errorText.style.color = "yellow";
  errorText.style.display = "block";
  errorText.style.fontSize = "12px";
  errorText.style.marginTop = "6px";
  errorText.textContent = message;
  inputElement.closest(".input-box").appendChild(errorText);
}

// Sahi value par border green kar deta hai
function showSuccess(inputElement) {
  inputElement.style.border = "1px solid green";
}

// Purane saare error messages aur borders hata deta hai (har submit se pehle)
function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => el.remove());
  document.querySelectorAll("input").forEach((el) => (el.style.border = ""));
}

// Email check karke error/success dikhata hai. true = email sahi hai
function validateEmailField(input, value) {
  if (value === "") {
    showError(input, "Email cannot be empty");
    return false;
  }
  if (!EMAIL_PATTERN.test(value)) {
    showError(input, "Please enter a valid email address");
    return false;
  }
  showSuccess(input);
  return true;
}

// Password check karke error/success dikhata hai. true = password sahi hai
function validatePasswordField(input, value, emptyMsg = "Password cannot be empty") {
  if (value === "") {
    showError(input, emptyMsg);
    return false;
  }
  if (!PASSWORD_PATTERN.test(value)) {
    showError(input, PASSWORD_RULE_MSG);
    return false;
  }
  showSuccess(input);
  return true;
}


/* =====================================================
   2. LOCAL STORAGE HELPERS
   (browser mein data save/read karne ke liye)
   ===================================================== */

// "Remember me" wali emails ki list: ["a@b.com", "c@d.com"]
function getSavedEmails() {
  return JSON.parse(localStorage.getItem("rememberedEmails")) || [];
}

function saveEmails(list) {
  localStorage.setItem("rememberedEmails", JSON.stringify(list));
}

// Har email ka remembered password: { "a@b.com": "pass1234" }
function getSavedPasswords() {
  return JSON.parse(localStorage.getItem("rememberedPasswords")) || {};
}

function savePassword(emailValue, passwordValue) {
  const all = getSavedPasswords();
  all[emailValue] = passwordValue;
  localStorage.setItem("rememberedPasswords", JSON.stringify(all));
}

function removePassword(emailValue) {
  const all = getSavedPasswords();
  delete all[emailValue];
  localStorage.setItem("rememberedPasswords", JSON.stringify(all));
}

// Registered accounts: { "a@b.com": { name: "...", password: "..." } }
function getAccounts() {
  return JSON.parse(localStorage.getItem("studentAccounts")) || {};
}

function saveAccounts(accounts) {
  localStorage.setItem("studentAccounts", JSON.stringify(accounts));
}


/* =====================================================
   3. LOGIN PAGE
   Email + password validation, remember me, email dropdown
   ===================================================== */
const email = document.getElementById("Email");
const isLoginPage = !!email; // sirf login page par "Email" id hoti hai

if (isLoginPage) {
  const loginForm = document.querySelector("form");
  const password = document.getElementById("password");
  const rememberCheckbox = document.getElementById("remember");
  const emailDropdown = document.getElementById("email-dropdown");

  // --- 3.1 Saved emails ki dropdown list banana ---
  function renderEmailDropdown() {
    const emails = getSavedEmails();
    emailDropdown.innerHTML = "";

    if (emails.length === 0) {
      emailDropdown.style.display = "none";
      return;
    }

    emails.forEach((savedEmail) => {
      const li = document.createElement("li");

      const textSpan = document.createElement("span");
      textSpan.textContent = savedEmail;

      // Har email ke side mein delete (×) button
      const deleteBtn = document.createElement("span");
      deleteBtn.textContent = "×";
      deleteBtn.className = "delete-email";
      deleteBtn.title = "Remove email";

      // Email par click -> email + password input mein fill ho jayega
      li.addEventListener("click", (e) => {
        if (e.target === deleteBtn) return;
        email.value = savedEmail;
        password.value = getSavedPasswords()[savedEmail] || "";
        rememberCheckbox.checked = true;
        emailDropdown.style.display = "none";
        password.focus(); // seedha password box par cursor
      });

      // × par click -> woh email list se delete ho jayega
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        saveEmails(getSavedEmails().filter((item) => item !== savedEmail));
        removePassword(savedEmail);
        if (email.value === savedEmail) {
          email.value = "";
          password.value = "";
          rememberCheckbox.checked = false;
        }
        renderEmailDropdown();
      });

      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      emailDropdown.appendChild(li);
    });
  }

  // --- 3.2 Page load hote hi last remembered email fill karo ---
  window.addEventListener("DOMContentLoaded", () => {
    const emails = getSavedEmails();
    renderEmailDropdown();

    if (emails.length > 0) {
      email.value = emails[emails.length - 1];
      password.value = getSavedPasswords()[email.value] || "";
      rememberCheckbox.checked = true;
    }
  });

  // --- 3.3 Email box par click/focus -> saved emails dikhao ---
  email.addEventListener("focus", () => {
    if (getSavedEmails().length > 0) {
      renderEmailDropdown();
      emailDropdown.style.display = "block";
    }
  });

  // --- 3.4 Bahar kahin bhi click karo -> dropdown band ---
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".email-wrapper")) {
      emailDropdown.style.display = "none";
    }
  });

  // --- 3.5 Type karte waqt checkbox auto-update karo ---
  email.addEventListener("input", () => {
    rememberCheckbox.checked = getSavedEmails().includes(email.value.trim());
    // Poori saved email type ho gayi to uska password bhi fill kar do
    const saved = getSavedPasswords()[email.value.trim()];
    if (rememberCheckbox.checked && saved) password.value = saved;
  });

  // --- 3.6 Checkbox uncheck karo -> is email ko list se hata do ---
  rememberCheckbox.addEventListener("change", () => {
    if (!rememberCheckbox.checked) {
      const emailValue = email.value.trim();
      saveEmails(getSavedEmails().filter((item) => item !== emailValue));
      removePassword(emailValue);
      renderEmailDropdown();
    }
  });

  // --- 3.7 Login form submit: VALIDATION ---
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    // Step 1: email aur password ka format check
    const emailOk = validateEmailField(email, emailValue);
    const passwordOk = validatePasswordField(password, passwordValue);
    let isValid = emailOk && passwordOk;

    // Step 2: agar koi account register hai to email + password match hona chahiye
    const accounts = getAccounts();
    const hasAccounts = Object.keys(accounts).length > 0;
    if (isValid && hasAccounts) {
      if (!(emailValue in accounts)) {
        showError(email, "No account found. Please register first");
        isValid = false;
      } else if (accounts[emailValue].password !== passwordValue) {
        showError(password, "Incorrect password");
        isValid = false;
      }
    }

    // Step 3: koi account nahi hai lekin password reset hua tha -> naya password chalega
    const resetPassword = localStorage.getItem("studentPassword");
    if (isValid && !hasAccounts && resetPassword !== null && passwordValue !== resetPassword) {
      showError(password, "Incorrect password");
      isValid = false;
    }

    // Step 4: sab sahi hai -> remember me save karo aur login karo
    if (isValid) {
      let emails = getSavedEmails().filter((item) => item !== emailValue);

      if (rememberCheckbox.checked) {
        emails.push(emailValue);
        savePassword(emailValue, passwordValue);
      } else {
        removePassword(emailValue);
      }

      saveEmails(emails);
      renderEmailDropdown();
      emailDropdown.style.display = "none";
      // sessionStorage: sirf is tab ke liye login details yaad rakho
      const acc = getAccounts()[emailValue];
      sessionStorage.setItem("studentSession", JSON.stringify({
        email: emailValue,
        name: acc ? acc.name : emailValue.split("@")[0],
        loginTime: new Date().toLocaleString()
      }));
      alert("Login successful");
      window.location.href="dashboard.html"; // login ke baad dashboard par bhejo
    }
  });
}


/* =====================================================
   4. FORGET PASSWORD PAGE
   New password + confirm password validation
   ===================================================== */
const newPassword = document.getElementById("new_password");
const confirmPassword = document.getElementById("confirm_password");

if (newPassword && confirmPassword) {
  const forgetForm = document.querySelector("form");

  forgetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const newValue = newPassword.value.trim();
    const confirmValue = confirmPassword.value.trim();

    // New password ka format check
    let isValid = validatePasswordField(newPassword, newValue, "New password cannot be empty");

    // Confirm password: khali na ho aur new password se match kare
    if (confirmValue === "") {
      showError(confirmPassword, "Confirm password cannot be empty");
      isValid = false;
    } else if (newValue !== confirmValue) {
      showError(confirmPassword, "Passwords do not match");
      isValid = false;
    } else {
      showSuccess(confirmPassword);
    }

    if (isValid) {
      // Purane password ki jagah naya password save karo
      localStorage.setItem("studentPassword", newValue);

      // Remembered emails ke autofill passwords bhi update karo
      const remembered = getSavedPasswords();
      Object.keys(remembered).forEach((key) => (remembered[key] = newValue));
      localStorage.setItem("rememberedPasswords", JSON.stringify(remembered));

      // Registered accounts ka password bhi update karo
      const accounts = getAccounts();
      Object.keys(accounts).forEach((key) => (accounts[key].password = newValue));
      saveAccounts(accounts);

      alert("Password reset successful. Please login with your new password.");
      window.location.href = "student login.html";
    }
  });
}


/* =====================================================
   5. REGISTER PAGE
   Naya account banana: name, email, password, confirm password
   ===================================================== */
const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const nameInput = document.getElementById("reg_name");
    const emailInput = document.getElementById("reg_email");
    const passInput = document.getElementById("reg_password");
    const confirmInput = document.getElementById("reg_confirm");

    const nameValue = nameInput.value.trim();
    const emailValue = emailInput.value.trim();
    const passValue = passInput.value.trim();
    const confirmValue = confirmInput.value.trim();

    const accounts = getAccounts();
    let isValid = true;

    // Name khali nahi hona chahiye
    if (nameValue === "") {
      showError(nameInput, "Name cannot be empty");
      isValid = false;
    } else {
      showSuccess(nameInput);
    }

    // Email: format sahi ho aur pehle se registered na ho
    if (emailValue in accounts) {
      showError(emailInput, "This email is already registered. Please login");
      isValid = false;
    } else if (!validateEmailField(emailInput, emailValue)) {
      isValid = false;
    }

    // Password ka format check
    if (!validatePasswordField(passInput, passValue)) isValid = false;

    // Confirm password: khali na ho aur match kare
    if (confirmValue === "") {
      showError(confirmInput, "Confirm password cannot be empty");
      isValid = false;
    } else if (passValue !== confirmValue) {
      showError(confirmInput, "Passwords do not match");
      isValid = false;
    } else {
      showSuccess(confirmInput);
    }

    // Sab sahi -> account save karo aur login page par bhejo
    if (isValid) {
      accounts[emailValue] = { name: nameValue, password: passValue };
      saveAccounts(accounts);
      alert("Registration successful. Please login.");
      window.location.href = "student login.html";
    }
  });
}


/* =====================================================
   6. EYE ICON - password show / hide
   Har password field mein eye button add hota hai
   ===================================================== */
const EYE_OPEN = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12A3 3 0 1 1 9.88 9.88"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

document.querySelectorAll('input[type="password"]').forEach((input) => {
  const wrap = input.parentElement;
  wrap.classList.add("password-wrap");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "toggle-password";
  btn.title = "Show password";
  btn.innerHTML = EYE_OPEN;

  // Click par password <-> text switch hota hai
  btn.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.innerHTML = show ? EYE_OFF : EYE_OPEN;
    btn.title = show ? "Hide password" : "Show password";
  });

  wrap.appendChild(btn);
});

/* =====================================================
   Dark mode toggle button
   ===================================================== */

const DARK_LOGO = "https://upload.wikimedia.org/wikipedia/en/7/71/GCET_Jammu_Logo.svg";
// Dashboard pages (dashboard, profile, courses, result) mein button nahi hai, isliye JS se bana do
const portalHeader = document.querySelector(".header_board");
if (portalHeader && !document.getElementById("theme-toggle")) {
  const newBtn = document.createElement("button");
  newBtn.type = "button";
  newBtn.id = "theme-toggle";
  newBtn.setAttribute("aria-label", "Toggle theme");
  newBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  portalHeader.appendChild(newBtn);
}

const themeBtn = document.getElementById("theme-toggle");

if (themeBtn) {
  const icon = themeBtn.querySelector("i");

  // Theme set karta hai: dark ya light, aur icon badalta hai
  function applyTheme(isDark) {
    document.body.classList.toggle("dark", isDark);
    if (icon) icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";

    // Dark mode mein dashboard wala GCET logo use karo, light mein original
    const logo = document.querySelector(".header-logo img");
    if (logo) {
      if (!logo.dataset.lightSrc) logo.dataset.lightSrc = logo.getAttribute("src");
      logo.src = isDark ? DARK_LOGO : logo.dataset.lightSrc;
    }
  }

  // Pichli baar ka choice yaad rakho
  applyTheme(localStorage.getItem("theme") === "dark");

  themeBtn.addEventListener("click", function () {
    const isDark = !document.body.classList.contains("dark");
    applyTheme(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

   


/* =====================================================
   7. ADMISSION FORM VALIDATION
   ===================================================== */
const admissionForm = document.querySelector("form.admission");
if (admissionForm) {
  const f = admissionForm.elements;

  function setFieldError(field, message) {
    const wrap = field.closest("div");
    wrap.querySelectorAll(".field-error").forEach((el) => el.remove());
    if (field.style) field.style.border = message ? "1px solid red" : "";
    if (!message) return;
    const small = document.createElement("small");
    small.className = "field-error";
    small.style.cssText = "display:block;color:#e53935;font-size:12px;margin-top:4px;";
    small.textContent = message;
    wrap.appendChild(small);
  }

  const rules = {
    name(v) {
      if (!v) return "Full name is required";
      if (!/^[A-Za-z][A-Za-z .'-]{1,49}$/.test(v)) return "Enter a valid name (letters only, 2-50 characters)";
      return "";
    },
    email(v) {
      if (!v) return "Email is required";
      if (!EMAIL_PATTERN.test(v)) return "Please enter a valid email address";
      return "";
    },
    dob(v) {
      if (!v) return "Date of birth is required";
      const d = new Date(v), today = new Date();
      if (d > today) return "Date of birth cannot be in the future";
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      if (age < 15) return "You must be at least 15 years old";
      if (age > 60) return "Please enter a valid date of birth";
      return "";
    },
    mob(v) {
      if (!v) return "Mobile number is required";
      if (!/^[6-9]\d{9}$/.test(v)) return "Enter a valid 10-digit mobile number";
      return "";
    },
    course(v) { return v ? "" : "Please select a course"; },
    address(v) {
      if (!v) return "Address is required";
      if (v.length < 10) return "Address must be at least 10 characters";
      return "";
    },
  };

  function checkField(name) {
    const field = f[name];
    const msg = rules[name](field.value.trim());
    setFieldError(field, msg);
    return !msg;
  }

  function checkGender() {
    const picked = admissionForm.querySelector('input[name="gender"]:checked');
    const box = admissionForm.querySelector(".gender");
    box.querySelectorAll(".field-error").forEach((el) => el.remove());
    if (picked) return true;
    const small = document.createElement("small");
    small.className = "field-error";
    small.style.cssText = "display:block;color:#e53935;font-size:12px;margin-top:4px;";
    small.textContent = "Please select a gender";
    box.appendChild(small);
    return false;
  }

  Object.keys(rules).forEach((name) => {
    f[name].addEventListener("blur", () => checkField(name));
    f[name].addEventListener("input", () => {
      if (f[name].closest("div").querySelector(".field-error")) checkField(name);
    });
  });
  admissionForm.querySelectorAll('input[name="gender"]').forEach((r) => r.addEventListener("change", checkGender));
  f.mob.addEventListener("input", () => { f.mob.value = f.mob.value.replace(/\D/g, "").slice(0, 10); });
  f.dob.max = new Date().toISOString().split("T")[0];

  admissionForm.addEventListener("submit", (e) => {
    let ok = true;
    Object.keys(rules).forEach((name) => { if (!checkField(name)) ok = false; });
    if (!checkGender()) ok = false;
    if (!ok) {
      e.preventDefault();
      const first = admissionForm.querySelector(".field-error");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  admissionForm.addEventListener("reset", () => {
    admissionForm.querySelectorAll(".field-error").forEach((el) => el.remove());
    admissionForm.querySelectorAll("input,select,textarea").forEach((el) => (el.style.border = ""));
  });
}


/* =====================================================
   8. LOGOUT CONFIRMATION
   ===================================================== */
const logoutLink = document.querySelector("#logout a");
if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    if (!confirm("Are you sure you want to log out?")) {
      e.preventDefault();
      return;
    }
    sessionStorage.removeItem("studentSession"); // student session hata do
  });
}


/* =====================================================
   9. STUDENT SESSION (sessionStorage)
   - Portal pages login ke bina nahi khulte
   - Dashboard par session details dikhti hain
   ===================================================== */
function getStudentSession() {
  try { return JSON.parse(sessionStorage.getItem("studentSession")); } catch (e) { return null; }
}

if (/\/(dashboard|profile|courses|result)\.html$/.test(location.pathname) && !getStudentSession()) {
  window.location.replace("student login.html");
}

const sessionBox = document.getElementById("session-info");
if (sessionBox) {
  const sess = getStudentSession();
  if (sess) {
    sessionBox.textContent = "";
    [["Logged in as", sess.name], ["Email", sess.email], ["Login time", sess.loginTime]].forEach(([k, v]) => {
      const p = document.createElement("p");
      const b = document.createElement("strong");
      b.textContent = k + ": ";
      p.append(b, document.createTextNode(v));
      sessionBox.appendChild(p);
    });
  }
}
