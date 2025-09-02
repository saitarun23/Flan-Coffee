const API_URL = "http://localhost:4000/api/v1/user";

document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const action = document.getElementById("action").value;

  try {
    let res;
    if (action === "login") {
      res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
    } else {
      res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
    }

    const data = await res.json();
    document.getElementById("result").textContent = data.message;
    if (data.success) {
      if (action === "login") {
        localStorage.setItem("username", data.username); // Store username
        window.location.href = "userhome.html";
      } else {
        // Registration successful, clear the form
        document.getElementById("userForm").reset();
        document.getElementById("result").textContent = "Registration successful! Please login.";
        // Switch to login form
        document.getElementById("action").value = "login";
        document.getElementById("form-title").textContent = "User Login";
        document.getElementById("formBtn").textContent = "Login";
        document.getElementById("toggleText").textContent = "Don't have an account? ";
        document.getElementById("toggleLink").textContent = "Register";
        document.getElementById("username-group").style.display = "none";
        document.getElementById("username").required = false;
      }
    } else {
      // Clear password field on failed login/register
      document.getElementById("password").value = "";
    }
  } catch (err) {
    console.error("Error:", err);
  }
});

// Toggle between login and register
document.getElementById("toggleLink").addEventListener("click", (e) => {
  e.preventDefault();
  const action = document.getElementById("action").value;
  const usernameGroup = document.getElementById("username-group");
  if (action === "login") {
    document.getElementById("action").value = "register";
    document.getElementById("form-title").textContent = "User Register";
    document.getElementById("formBtn").textContent = "Register";
    document.getElementById("toggleText").textContent = "Already have an account? ";
    document.getElementById("toggleLink").textContent = "Login";
    usernameGroup.style.display = "block";
    document.getElementById("username").required = true;
  } else {
    document.getElementById("action").value = "login";
    document.getElementById("form-title").textContent = "User Login";
    document.getElementById("formBtn").textContent = "Login";
    document.getElementById("toggleText").textContent = "Don't have an account? ";
    document.getElementById("toggleLink").textContent = "Register";
    usernameGroup.style.display = "none";
    document.getElementById("username").required = false;
  }
});
