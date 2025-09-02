const API_URL = "http://localhost:4000/api/v1/user";

document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const action = document.getElementById("action").value;

  try {
    let res;
    if (action === "login") {
      res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
    } else {
      res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
    }

    const data = await res.json();
    document.getElementById("result").textContent = data.message;
    if (data.success && action === "login") {
      window.location.href = "userhome.html";
    }
  } catch (err) {
    console.error("Error:", err);
  }
});

// Toggle between login and register
document.getElementById("toggleLink").addEventListener("click", (e) => {
  e.preventDefault();
  const action = document.getElementById("action").value;
  if (action === "login") {
    document.getElementById("action").value = "register";
    document.getElementById("form-title").textContent = "User Register";
    document.getElementById("formBtn").textContent = "Register";
    document.getElementById("toggleText").textContent = "Already have an account? ";
    document.getElementById("toggleLink").textContent = "Login";
  } else {
    document.getElementById("action").value = "login";
    document.getElementById("form-title").textContent = "User Login";
    document.getElementById("formBtn").textContent = "Login";
    document.getElementById("toggleText").textContent = "Don't have an account? ";
    document.getElementById("toggleLink").textContent = "Register";
  }
});
