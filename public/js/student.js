document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'student') {
        window.location.href = 'login.html';
        return;
    }

    // DOM Elements
    const logoutBtn = document.getElementById('logout-btn');
    const subjectsTab = document.getElementById('subjects-tab');
    const attendanceTab = document.getElementById('attendance-tab');
    const marksTab = document.getElementById('marks-tab');
    const subjectsSection = document.getElementById('subjects-section');
    const attendanceSection = document.getElementById('attendance-section');
    const marksSection = document.getElementById('marks-section');
    const subjectsTableBody = document.getElementById('subjects-table-body');
    const attendanceTableBody = document.getElementById('attendance-table-body');
    const marksTableBody = document.getElementById('marks-table-body');
    const attendanceSubjectFilter = document.getElementById('attendance-subject-filter');

    // Event Listeners
    logoutBtn.addEventListener('click', handleLogout);
    subjectsTab.addEventListener('click', () => showSection('subjects'));
    attendanceTab.addEventListener('click', () => showSection('attendance'));
    marksTab.addEventListener('click', () => showSection('marks'));
    attendanceSubjectFilter.addEventListener('change', loadAttendance);

    // Load initial data
    loadSubjects();
    showSection('subjects');

    // Functions
    function showSection(section) {
        subjectsSection.style.display = 'none';
        attendanceSection.style.display = 'none';
        marksSection.style.display = 'none';
        
        document.getElementById(`${section}-section`).style.display = 'block';
        
        // Load data when section is shown
        if (section === 'attendance') {
            loadAttendance();
        } else if (section === 'marks') {
            loadMarks();
        }
    }

    async function loadSubjects() {
        try {
            const response = await fetch('/api/student/subjects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch subjects');
            
            const subjects = await response.json();
            renderSubjects(subjects);
            populateSubjectFilter(subjects);
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
                <td>${subject.teacher || 'Not assigned'}</td>
            `;
            subjectsTableBody.appendChild(row);
        });
    }

    function populateSubjectFilter(subjects) {
        attendanceSubjectFilter.innerHTML = '<option value="">All Subjects</option>';
        
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            attendanceSubjectFilter.appendChild(option);
        });
    }

    async function loadAttendance() {
        const subjectId = attendanceSubjectFilter.value;
        
        try {
            const url = subjectId 
                ? `/api/student/attendance?subjectId=${subjectId}`
                : '/api/student/attendance';
                
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch attendance');
            
            const attendance = await response.json();
            renderAttendance(attendance);
        } catch (error) {
            console.error('Error loading attendance:', error);
            alert('Failed to load attendance');
        }
    }

    function renderAttendance(attendance) {
        attendanceTableBody.innerHTML = '';
        
        attendance.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.subject_name}</td>
                <td>
                    <span class="badge ${record.status === 'present' ? 'bg-success' : 'bg-danger'}">
                        ${record.status}
                    </span>
                </td>
            `;
            attendanceTableBody.appendChild(row);
        });
    }

    async function loadMarks() {
        try {
            const response = await fetch('/api/student/marks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch marks');
            
            const marks = await response.json();
            renderMarks(marks);
        } catch (error) {
            console.error('Error loading marks:', error);
            alert('Failed to load marks');
        }
    }

    function renderMarks(marks) {
        marksTableBody.innerHTML = '';
        
        marks.forEach(mark => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${mark.subject_name}</td>
                <td>${mark.assignment1}</td>
                <td>${mark.assignment2}</td>
                <td>${mark.ut}</td>
                <td>${mark.behavior}</td>
            `;
            marksTableBody.appendChild(row);
        });
    }

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = 'login.html';
    }
});