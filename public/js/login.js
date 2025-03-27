document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
        redirectToDashboard(role);
    }

    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const roleBtns = document.querySelectorAll('.role-btn');
    const roleInput = document.getElementById('role');
    const errorMessage = document.getElementById('error-message');

    // Event Listeners
    roleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            roleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            roleInput.value = this.dataset.role;
        });
    });

    loginForm.addEventListener('submit', handleLogin);

    // Functions
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = roleInput.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save token and role
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            
            // Redirect to appropriate dashboard
            redirectToDashboard(data.role);
        } catch (error) {
            showError(error.message);
        }
    }

    function redirectToDashboard(role) {
        switch(role) {
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'teacher':
                window.location.href = 'teacher-dashboard.html';
                break;
            case 'student':
                window.location.href = 'student-dashboard.html';
                break;
            default:
                window.location.href = 'login.html';
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
        setTimeout(() => {
            errorMessage.classList.add('d-none');
        }, 5000);
    }
});