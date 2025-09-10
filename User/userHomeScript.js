document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("user-info");
  const logoutLink = document.getElementById("logout");
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.username) {
    userInfo.innerHTML = `<li><span>Welcome, ${user.username}</span></li>`;
  }

  logoutLink.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    window.location.href = "user.html";
  });
});
