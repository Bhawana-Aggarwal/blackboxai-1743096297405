document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    // DOM Elements
    const logoutBtn = document.getElementById('logout-btn');
    const addUserBtn = document.getElementById('add-user-btn');
    const saveUserBtn = document.getElementById('save-user-btn');
    const usersTableBody = document.getElementById('users-table-body');
    const addUserModal = new bootstrap.Modal(document.getElementById('addUserModal'));

    // Event Listeners
    logoutBtn.addEventListener('click', handleLogout);
    addUserBtn.addEventListener('click', () => addUserModal.show());
    saveUserBtn.addEventListener('click', handleAddUser);

    // Load initial data
    loadUsers();

    // Functions
    async function loadUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch users');
            
            const users = await response.json();
            renderUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Failed to load users');
        }
    }

    function renderUsers(users) {
        usersTableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name || '-'}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEditUser);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteUser);
        });
    }

    async function handleAddUser() {
        const form = document.getElementById('add-user-form');
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) throw new Error('Failed to add user');
            
            addUserModal.hide();
            form.reset();
            loadUsers();
            alert('User added successfully');
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user');
        }
    }

    function handleEditUser(e) {
        const userId = e.target.closest('button').dataset.id;
        // Implementation for editing user
        console.log('Edit user:', userId);
    }

    function handleDeleteUser(e) {
        const userId = e.target.closest('button').dataset.id;
        if (confirm('Are you sure you want to delete this user?')) {
            deleteUser(userId);
        }
    }

    async function deleteUser(userId) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete user');
            
            loadUsers();
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = 'login.html';
    }
});