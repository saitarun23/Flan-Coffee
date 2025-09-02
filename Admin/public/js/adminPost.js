async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('loginBtn');
  const errEl = document.getElementById('error-msg');
  errEl.textContent = '';
  if (!username || !password) {
    errEl.textContent = 'Enter username and password';
    return;
  }
  try {
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      btn.textContent = 'Welcome';
      // small delay so the user sees success state
      setTimeout(() => { window.location.href = '/adminproducts.html'; }, 300);
    } else {
      errEl.textContent = data.message || 'Invalid login!';
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  } catch (err) {
    console.error(err);
    errEl.textContent = 'Network or server error';
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('loginBtn');
  if (btn) btn.addEventListener('click', login);
  // allow enter key on form
  const form = document.getElementById('loginForm');
  if (form) form.addEventListener('submit', login);
});
