document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'teacher') {
        window.location.href = 'login.html';
        return;
    }

    // DOM Elements
    const logoutBtn = document.getElementById('logout-btn');
    const saveAttendanceBtn = document.getElementById('save-attendance-btn');
    const subjectsTableBody = document.getElementById('subjects-table-body');
    const attendanceModal = new bootstrap.Modal(document.getElementById('attendanceModal'));
    const attendanceRecords = document.getElementById('attendance-records');

    // Event Listeners
    logoutBtn.addEventListener('click', handleLogout);
    saveAttendanceBtn.addEventListener('click', handleSaveAttendance);

    // Load initial data
    loadSubjects();

    // Functions
    async function loadSubjects() {
        try {
            const response = await fetch('/api/teacher/subjects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch subjects');
            
            const subjects = await response.json();
            renderSubjects(subjects);
        } catch (error) {
            console.error('Error loading subjects:', error);
            alert('Failed to load subjects');
        }
    }

    function renderSubjects(subjects) {
        subjectsTableBody.innerHTML = '';
        
        subjects.forEach(subject => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${subject.code}</td>
                <td>${subject.name}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary attendance-btn" 
                            data-subject-id="${subject.id}">
                        <i class="fas fa-clipboard-check"></i> Attendance
                    </button>
                </td>
            `;
            subjectsTableBody.appendChild(row);
        });

        // Add event listeners to attendance buttons
        document.querySelectorAll('.attendance-btn').forEach(btn => {
            btn.addEventListener('click', handleTakeAttendance);
        });
    }

    async function handleTakeAttendance(e) {
        const subjectId = e.target.closest('button').dataset.subjectId;
        
        try {
            // Load students for this subject
            const response = await fetch(`/api/teacher/students?subjectId=${subjectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch students');
            
            const students = await response.json();
            renderAttendanceForm(students, subjectId);
            attendanceModal.show();
        } catch (error) {
            console.error('Error loading students:', error);
            alert('Failed to load students for attendance');
        }
    }

    function renderAttendanceForm(students, subjectId) {
        attendanceRecords.innerHTML = '';
        document.getElementById('attendance-subject-id').value = subjectId;
        
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>
                    <select class="form-select" name="status-${student.id}">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                    </select>
                </td>
            `;
            attendanceRecords.appendChild(row);
        });
    }

    async function handleSaveAttendance() {
        const form = document.getElementById('attendance-form');
        const formData = new FormData(form);
        const subjectId = formData.get('subjectId');
        const date = formData.get('date');
        
        const attendanceRecords = [];
        const selects = document.querySelectorAll('select[name^="status-"]');
        
        selects.forEach(select => {
            const studentId = select.name.split('-')[1];
            attendanceRecords.push({
                studentId,
                status: select.value
            });
        });

        try {
            const response = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subjectId,
                    date,
                    attendanceRecords
                })
            });

            if (!response.ok) throw new Error('Failed to save attendance');
            
            attendanceModal.hide();
            alert('Attendance saved successfully');
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance');
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = 'login.html';
    }
});