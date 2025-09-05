document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const admin_id = document.getElementById('admin_id').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const res = await fetch('/api/v1/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_id, password }),
        });

        const data = await res.json();

        if (data.success) {
            window.location.href = '/adminhome.html'; // Redirect to the main admin page
        } else {
            errorMessage.textContent = data.message || 'Login failed. Please check your credentials.';
        }
    } catch (err) {
        console.error('Login error:', err);
        errorMessage.textContent = 'An error occurred during login. Please try again.';
    }
});

document.getElementById('showPassword').addEventListener('change', function() {
  const pwd = document.getElementById('password');
  pwd.type = this.checked ? 'text' : 'password';
});
