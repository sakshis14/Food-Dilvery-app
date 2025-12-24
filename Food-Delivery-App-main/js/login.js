document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  const errorMessage = document.getElementById("errorMessage");
  const signupErrorMessage = document.getElementById("signupErrorMessage");

  /* =======================
     LOGIN FORM
  ======================== */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      errorMessage.style.display = "none";

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
        errorMessage.textContent = "Please enter email and password";
        errorMessage.style.display = "block";
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          errorMessage.textContent = data.message || "Login failed";
          errorMessage.style.display = "block";
          return;
        }

        // Save logged-in user (SESSION ONLY)
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "../index.html";
        }
      } catch (err) {
        errorMessage.textContent = "Server error. Try again.";
        errorMessage.style.display = "block";
      }
    });
  }

  /* =======================
     SIGNUP FORM
  ======================== */
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      signupErrorMessage.style.display = "none";

      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirmPassword =
        document.getElementById("confirmPassword").value;

      // Frontend validation
      if (!name || !email || !password || !confirmPassword) {
        signupErrorMessage.textContent = "All fields are required";
        signupErrorMessage.style.display = "block";
        return;
      }

      if (password.length < 6) {
        signupErrorMessage.textContent =
          "Password must be at least 6 characters";
        signupErrorMessage.style.display = "block";
        return;
      }

      if (password !== confirmPassword) {
        signupErrorMessage.textContent = "Passwords do not match";
        signupErrorMessage.style.display = "block";
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          signupErrorMessage.textContent =
            data.message || "Signup failed";
          signupErrorMessage.style.display = "block";
          return;
        }

        signupErrorMessage.className = "success-message";
        signupErrorMessage.textContent =
          "Account created successfully! Please login.";
        signupErrorMessage.style.display = "block";

        setTimeout(() => {
          showLoginForm();
        }, 1500);
      } catch (err) {
        signupErrorMessage.textContent = "Server error. Try again.";
        signupErrorMessage.style.display = "block";
      }
    });
  }
});

/* =======================
   FORM TOGGLE FUNCTIONS
======================== */
function showLoginForm() {
  document.getElementById("loginFormContainer").style.display = "block";
  document.getElementById("signupFormContainer").style.display = "none";
}

function showSignupForm() {
  document.getElementById("loginFormContainer").style.display = "none";
  document.getElementById("signupFormContainer").style.display = "block";
}
