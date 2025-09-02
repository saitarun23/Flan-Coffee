// ...existing code...
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        window.location.href = "adminhome.html";
      } else {
        document.getElementById("error-msg").innerText = "Invalid login!";
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById("error-msg").innerText = "Network or server error";
    });
}
