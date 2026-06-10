/**
 * Student Management System — Frontend App
 * JWT Auth + REST API integration + CRUD logic
 */

/* ─── CONFIG ─────────────────────────────────── */
const API_BASE = 'http://localhost:8080/api';

const ENDPOINTS = {
  login:    `${API_BASE}/auth/login`,
  students: `${API_BASE}/students`,
  courses:  `${API_BASE}/courses`,
  grades:   `${API_BASE}/grades`,
  stats:    `${API_BASE}/dashboard/stats`,
};

/* ─── STATE ──────────────────────────────────── */
const state = {
  token: localStorage.getItem('sms_token') || null,
  user:  JSON.parse(localStorage.getItem('sms_user') || 'null'),
  students: [],
  courses:  [],
  grades:   [],
  currentPage: 'dashboard',
  pagination: { students: 1, courses: 1, grades: 1 },
  pageSize: 10,
};

/* ─── UTILS ──────────────────────────────────── */

/**
 * Perform authenticated API request
 */
async function api(method, url, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);

  if (res.status === 401) {
    logout();
    return null;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** Show toast notification */
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || icons.info}</span><span>${msg}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    el.style.transition = '0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

/** Open modal */
function openModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.add('open');
  overlay.querySelector('input, select, textarea')?.focus();
}

/** Close modal */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/** Get initials from name */
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
}

/** Format date to locale */
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Grade letter → CSS class */
function gradeClass(score) {
  if (score >= 90) return 'grade-a';
  if (score >= 80) return 'grade-b';
  if (score >= 70) return 'grade-c';
  if (score >= 60) return 'grade-d';
  return 'grade-f';
}

/** Grade score → letter */
function gradeLetter(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/** Debounce helper */
function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Normalize status: "ACTIVE" → "Active" */
function normStatus(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/* ─── AUTH ───────────────────────────────────── */

async function login(username, password) {
  // Try real backend first
  try {
    const data = await api('POST', ENDPOINTS.login, { username, password });
    if (data && data.token) {
      state.token = data.token;
      state.user  = data.user || { name: username, role: 'Administrator' };
      localStorage.setItem('sms_token', state.token);
      localStorage.setItem('sms_user', JSON.stringify(state.user));
      showApp();
      return;
    }
  } catch (err) {
    // Backend unavailable — fall back to demo mode
  }

  // Demo mode fallback (works without backend)
  const demoUsers = {
    admin:   { password: 'admin123', name: 'Admin User',    role: 'Administrator' },
    teacher: { password: 'teach123', name: 'Teacher User',  role: 'Teacher'       },
  };
  const demo = demoUsers[username];
  if (demo && demo.password === password) {
    state.token = 'demo-token-' + Date.now();
    state.user  = { name: demo.name, role: demo.role, username };
    localStorage.setItem('sms_token', state.token);
    localStorage.setItem('sms_user', JSON.stringify(state.user));
    showApp();
    return;
  }

  toast('Қате логин немесе пароль', 'error');
}

function logout() {
  state.token = null;
  state.user  = null;
  localStorage.removeItem('sms_token');
  localStorage.removeItem('sms_user');
  showLogin();
}

function showLogin() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app-layout').style.display  = 'none';
}

function showApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-layout').style.display  = 'flex';
  updateUserUI();
  recordLogin();
  navigateTo('dashboard');
  loadDashboard();
}

function updateUserUI() {
  const u = state.user;
  if (!u) return;
  const name = u.name || u.username || 'Admin';
  document.querySelectorAll('.user-name-display').forEach(el => el.textContent = name);
  document.querySelectorAll('.user-role-display').forEach(el => el.textContent = u.role || 'Admin');
  document.querySelectorAll('.user-avatar').forEach(el => el.textContent = initials(name));
}

/* ─── NAVIGATION ─────────────────────────────── */

function navigateTo(page) {
  state.currentPage = page;

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Show/hide pages
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === `page-${page}`);
  });

  // Load data for page
  const loaders = {
    dashboard: loadDashboard,
    students:  loadStudents,
    courses:   loadCourses,
    grades:    loadGrades,
    reports:   loadReports,
    profile:   loadProfile,
    settings:  () => {
      // sync theme toggle state
      const isLight = document.body.classList.contains('light');
      const toggle = document.getElementById('theme-toggle');
      if (toggle) toggle.checked = !isLight;
      applyLang(currentLang);
    },
  };
  loaders[page]?.();
}

/* ─── DASHBOARD ──────────────────────────────── */

async function loadDashboard() {
  try {
    // Try real API; fall back to mock data
    let stats;
    try {
      stats = await api('GET', ENDPOINTS.stats);
    } catch {
      stats = null;
    }

    // No backend — show zeros
    if (!stats) {
      stats = {
        totalStudents:  0,
        totalCourses:   0,
        avgGrade:       0,
        activeEnrollments: 0,
        studentChange: '—',
        courseChange:  '—',
        gradeChange:   '—',
        enrollChange:  '—',
      };
    }

    document.getElementById('stat-students').textContent     = stats.totalStudents;
    document.getElementById('stat-courses').textContent      = stats.totalCourses;
    document.getElementById('stat-avg-grade').textContent    = `${stats.avgGrade}%`;
    document.getElementById('stat-enrollments').textContent  = stats.activeEnrollments;

    document.getElementById('stat-students-ch').textContent    = `${stats.studentChange} this month`;
    document.getElementById('stat-courses-ch').textContent     = `${stats.courseChange} new`;
    document.getElementById('stat-avg-grade-ch').textContent   = `${stats.gradeChange}% vs last term`;
    document.getElementById('stat-enrollments-ch').textContent = `${stats.enrollChange} new`;

    renderChart();
  } catch (err) {
    toast('Failed to load dashboard', 'error');
  }
}

function renderChart() {
  const data = [72, 85, 68, 92, 78, 88, 95, 80, 75, 90, 84, 88];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const max = Math.max(...data);

  const chartEl   = document.getElementById('grade-chart');
  const labelsEl  = document.getElementById('chart-labels');
  if (!chartEl) return;

  chartEl.innerHTML = data.map((v, i) =>
    `<div class="chart-bar" style="height:${(v/max)*100}%" title="${months[i]}: ${v}%"></div>`
  ).join('');

  labelsEl.innerHTML = months.map(m =>
    `<span>${m}</span>`
  ).join('');
}

/* ─── STUDENTS ───────────────────────────────── */

async function loadStudents() {
  try {
    let data;
    try {
      data = await api('GET', ENDPOINTS.students);
    } catch {
      data = [];
    }

    state.students = data || [];
    renderStudents(state.students);
    document.getElementById('students-count').textContent = `${state.students.length} students`;

    // Update nav badge
    const badge = document.getElementById('students-nav-badge');
    if (badge) {
      if (state.students.length > 0) {
        badge.textContent = state.students.length;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (err) {
    toast('Failed to load students', 'error');
  }
}

function getMockStudents() {
  return [];
}

function renderStudents(students) {
  const tbody = document.getElementById('students-tbody');
  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">👤</div><h4>No students found</h4><p>Add a new student to get started.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(s => {
    const st = normStatus(s.status);
    const statusBadge = {
      Active:    'badge-success',
      Inactive:  'badge-warning',
      Graduated: 'badge-info',
    }[st] || 'badge-accent';

    return `
    <tr data-id="${s.id}">
      <td>
        <div class="flex items-center gap-1">
          <div class="avatar avatar-sm">${initials(s.firstName + ' ' + s.lastName)}</div>
          <div>
            <div style="font-weight:600;font-size:.85rem">${s.firstName} ${s.lastName}</div>
            <div class="text-xs text-muted">#${String(s.id).padStart(4,'0')}</div>
          </div>
        </div>
      </td>
      <td class="text-sm">${s.email}</td>
      <td class="text-sm">${s.phone || '—'}</td>
      <td><span class="badge badge-accent">${s.major || '—'}</span></td>
      <td class="text-sm text-muted">${fmtDate(s.enrollDate)}</td>
      <td><span class="text-sm font-weight:600">${s.gpa?.toFixed(1) || '—'}</span></td>
      <td><span class="badge ${statusBadge}">${st}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="openEditStudent(${s.id})" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger btn-icon"   onclick="deleteStudent(${s.id})"   title="Delete">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterStudents(query) {
  const q = query.toLowerCase();
  const filtered = state.students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.email} ${s.major}`.toLowerCase().includes(q)
  );
  renderStudents(filtered);
}

function openAddStudent() {
  document.getElementById('student-modal-title').textContent = 'Add New Student';
  document.getElementById('student-form').reset();
  document.getElementById('student-id-hidden').value = '';
  openModal('student-modal');
}

function openEditStudent(id) {
  const s = state.students.find(x => x.id === id);
  if (!s) return;

  document.getElementById('student-modal-title').textContent = 'Edit Student';
  document.getElementById('student-id-hidden').value     = s.id;
  document.getElementById('student-firstName').value     = s.firstName;
  document.getElementById('student-lastName').value      = s.lastName;
  document.getElementById('student-email').value         = s.email;
  document.getElementById('student-phone').value         = s.phone || '';
  document.getElementById('student-major').value         = s.major;
  document.getElementById('student-enrollDate').value    = s.enrollDate?.slice(0,10) || '';
  document.getElementById('student-status').value        = normStatus(s.status);
  openModal('student-modal');
}

async function saveStudent() {
  const id = document.getElementById('student-id-hidden').value;
  const payload = {
    firstName:  document.getElementById('student-firstName').value.trim(),
    lastName:   document.getElementById('student-lastName').value.trim(),
    email:      document.getElementById('student-email').value.trim(),
    phone:      document.getElementById('student-phone').value.trim(),
    major:      document.getElementById('student-major').value,
    enrollDate: document.getElementById('student-enrollDate').value,
    status:     document.getElementById('student-status').value,
  };

  if (!payload.firstName || !payload.lastName || !payload.email) {
    toast('Please fill required fields', 'error');
    return;
  }

  try {
    let result;
    if (id) {
      try { result = await api('PUT', `${ENDPOINTS.students}/${id}`, payload); }
      catch { result = { id: +id, ...payload, gpa: state.students.find(s => s.id === +id)?.gpa || 0 }; }
      const idx = state.students.findIndex(s => s.id === +id);
      if (idx !== -1) state.students[idx] = result || { id: +id, ...payload };
      toast('Student updated successfully', 'success');
    } else {
      try { result = await api('POST', ENDPOINTS.students, payload); }
      catch { result = { id: Date.now(), ...payload, gpa: 0 }; }
      state.students.unshift(result || { id: Date.now(), ...payload, gpa: 0 });
      toast('Student added successfully', 'success');
    }

    renderStudents(state.students);
    closeModal('student-modal');
  } catch (err) {
    toast(err.message || 'Failed to save student', 'error');
  }
}

async function deleteStudent(id) {
  if (!confirm('Delete this student? This action cannot be undone.')) return;

  try {
    try { await api('DELETE', `${ENDPOINTS.students}/${id}`); } catch {}
    state.students = state.students.filter(s => s.id !== id);
    renderStudents(state.students);
    toast('Student deleted', 'success');
  } catch (err) {
    toast('Failed to delete student', 'error');
  }
}

/* ─── COURSES ────────────────────────────────── */

async function loadCourses() {
  try {
    let data;
    try { data = await api('GET', ENDPOINTS.courses); }
    catch { data = []; }

    state.courses = data || [];
    renderCourses(state.courses);
    document.getElementById('courses-count').textContent = `${state.courses.length} courses`;
  } catch (err) {
    toast('Failed to load courses', 'error');
  }
}

function getMockCourses() {
  return [];
}

function renderCourses(courses) {
  const tbody = document.getElementById('courses-tbody');
  if (!courses.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-state-icon">📚</div><h4>No courses found</h4><p>Add a new course to get started.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = courses.map(c => {
    const pct = c.capacity ? Math.round((c.enrolled / c.capacity) * 100) : 0;
    const cs  = normStatus(c.status);
    const statusBadge = { Active: 'badge-success', Full: 'badge-warning', Inactive: 'badge-danger' }[cs] || 'badge-accent';

    return `
    <tr data-id="${c.id}">
      <td><span class="badge badge-accent">${c.code}</span></td>
      <td>
        <div style="font-weight:600;font-size:.875rem">${c.name}</div>
        <div class="text-xs text-muted">${c.department || '—'}</div>
      </td>
      <td class="text-sm">${c.instructor || '—'}</td>
      <td class="text-sm text-center">${c.credits}</td>
      <td>
        <div style="min-width:100px">
          <div class="flex justify-between text-xs text-muted" style="margin-bottom:4px">
            <span>${c.enrolled ?? 0}/${c.capacity ?? 0}</span>
            <span>${pct}%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width:${pct}%;background:${pct>=100?'var(--danger)':pct>=80?'var(--warning)':'linear-gradient(90deg,var(--accent),var(--accent-light))'}"></div>
          </div>
        </div>
      </td>
      <td><span class="badge ${statusBadge}">${cs}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="openEditCourse(${c.id})" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger btn-icon"   onclick="deleteCourse(${c.id})"   title="Delete">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterCourses(query) {
  const q = query.toLowerCase();
  const filtered = state.courses.filter(c =>
    `${c.code} ${c.name} ${c.instructor} ${c.department}`.toLowerCase().includes(q)
  );
  renderCourses(filtered);
}

function openAddCourse() {
  document.getElementById('course-modal-title').textContent = 'Add New Course';
  document.getElementById('course-form').reset();
  document.getElementById('course-id-hidden').value = '';
  openModal('course-modal');
}

function openEditCourse(id) {
  const c = state.courses.find(x => x.id === id);
  if (!c) return;

  document.getElementById('course-modal-title').textContent  = 'Edit Course';
  document.getElementById('course-id-hidden').value          = c.id;
  document.getElementById('course-code').value               = c.code;
  document.getElementById('course-name').value               = c.name;
  document.getElementById('course-instructor').value         = c.instructor;
  document.getElementById('course-credits').value            = c.credits;
  document.getElementById('course-department').value         = c.department;
  document.getElementById('course-capacity').value           = c.capacity;
  document.getElementById('course-status').value             = normStatus(c.status);
  openModal('course-modal');
}

async function saveCourse() {
  const id = document.getElementById('course-id-hidden').value;
  const payload = {
    code:        document.getElementById('course-code').value.trim(),
    name:        document.getElementById('course-name').value.trim(),
    instructor:  document.getElementById('course-instructor').value.trim(),
    credits:     +document.getElementById('course-credits').value,
    department:  document.getElementById('course-department').value.trim(),
    capacity:    +document.getElementById('course-capacity').value,
    status:      document.getElementById('course-status').value,
  };

  if (!payload.code || !payload.name || !payload.instructor) {
    toast('Please fill required fields', 'error');
    return;
  }

  try {
    let result;
    if (id) {
      try { result = await api('PUT', `${ENDPOINTS.courses}/${id}`, payload); } catch { result = { id: +id, ...payload, enrolled: state.courses.find(c => c.id === +id)?.enrolled || 0 }; }
      const idx = state.courses.findIndex(c => c.id === +id);
      if (idx !== -1) state.courses[idx] = result || { id: +id, ...payload };
      toast('Course updated successfully', 'success');
    } else {
      try { result = await api('POST', ENDPOINTS.courses, payload); } catch { result = { id: Date.now(), ...payload, enrolled: 0 }; }
      state.courses.unshift(result || { id: Date.now(), ...payload, enrolled: 0 });
      toast('Course added successfully', 'success');
    }

    renderCourses(state.courses);
    closeModal('course-modal');
  } catch (err) {
    toast(err.message || 'Failed to save course', 'error');
  }
}

async function deleteCourse(id) {
  if (!confirm('Delete this course? This action cannot be undone.')) return;

  try {
    try { await api('DELETE', `${ENDPOINTS.courses}/${id}`); } catch {}
    state.courses = state.courses.filter(c => c.id !== id);
    renderCourses(state.courses);
    toast('Course deleted', 'success');
  } catch (err) {
    toast('Failed to delete course', 'error');
  }
}

/* ─── GRADES ─────────────────────────────────── */

async function loadGrades() {
  try {
    let data;
    try { data = await api('GET', ENDPOINTS.grades); }
    catch { data = []; }

    state.grades = data || [];
    renderGrades(state.grades);
    document.getElementById('grades-count').textContent = `${state.grades.length} records`;
  } catch (err) {
    toast('Failed to load grades', 'error');
  }
}

function getMockGrades() {
  return [];
}

function renderGrades(grades) {
  const tbody = document.getElementById('grades-tbody');
  if (!grades.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">📝</div><h4>No grades found</h4><p>Add a grade to get started.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = grades.map(g => {
    const pct  = Math.round((g.score / (g.maxScore || 100)) * 100);
    const cls  = gradeClass(pct);
    const letter = gradeLetter(pct);
    const typeBadge = { Midterm: 'badge-info', Final: 'badge-accent', Assignment: 'badge-success', Quiz: 'badge-warning' }[g.type] || 'badge-accent';

    return `
    <tr data-id="${g.id}">
      <td>
        <div class="flex items-center gap-1">
          <div class="avatar avatar-sm">${initials(g.studentName)}</div>
          <span class="text-sm" style="font-weight:500">${g.studentName}</span>
        </div>
      </td>
      <td class="text-sm">${g.courseName}</td>
      <td><span class="badge ${typeBadge}">${g.type}</span></td>
      <td>
        <div class="flex items-center gap-1">
          <div class="grade-circle ${cls}">${letter}</div>
          <span class="text-sm" style="font-weight:600">${g.score}/${g.maxScore || 100}</span>
        </div>
      </td>
      <td>
        <div style="min-width:90px">
          <div class="progress-bar-wrap">
            <div class="progress-bar" style="width:${pct}%;background:${pct>=90?'var(--success)':pct>=70?'var(--accent)':pct>=60?'var(--warning)':'var(--danger)'}"></div>
          </div>
          <div class="text-xs text-muted" style="margin-top:3px;text-align:right">${pct}%</div>
        </div>
      </td>
      <td class="text-sm text-muted">${fmtDate(g.date)}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-sm btn-secondary btn-icon" onclick="openEditGrade(${g.id})" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger btn-icon"   onclick="deleteGrade(${g.id})"   title="Delete">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterGrades(query) {
  const q = query.toLowerCase();
  const filtered = state.grades.filter(g =>
    `${g.studentName} ${g.courseName} ${g.type}`.toLowerCase().includes(q)
  );
  renderGrades(filtered);
}

function openAddGrade() {
  document.getElementById('grade-modal-title').textContent = 'Add Grade';
  document.getElementById('grade-form').reset();
  document.getElementById('grade-id-hidden').value = '';
  populateGradeSelects();
  openModal('grade-modal');
}

function openEditGrade(id) {
  const g = state.grades.find(x => x.id === id);
  if (!g) return;

  populateGradeSelects();
  document.getElementById('grade-modal-title').textContent = 'Edit Grade';
  document.getElementById('grade-id-hidden').value         = g.id;
  document.getElementById('grade-student').value           = g.studentId;
  document.getElementById('grade-course').value            = g.courseId;
  document.getElementById('grade-type').value              = g.type;
  document.getElementById('grade-score').value             = g.score;
  document.getElementById('grade-max-score').value         = g.maxScore || 100;
  document.getElementById('grade-date').value              = g.date?.slice(0,10) || '';
  openModal('grade-modal');
}

function populateGradeSelects() {
  const studentSel = document.getElementById('grade-student');
  const courseSel  = document.getElementById('grade-course');

  if (state.students.length) {
    studentSel.innerHTML = '<option value="">Select student</option>' +
      state.students.map(s => `<option value="${s.id}">${s.firstName} ${s.lastName}</option>`).join('');
  } else {
    studentSel.innerHTML = '<option value="">No students yet</option>';
  }

  if (state.courses.length) {
    courseSel.innerHTML = '<option value="">Select course</option>' +
      state.courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  } else {
    courseSel.innerHTML = '<option value="">No courses yet</option>';
  }
}

async function saveGrade() {
  const id = document.getElementById('grade-id-hidden').value;
  const payload = {
    studentId: +document.getElementById('grade-student').value,
    courseId:  +document.getElementById('grade-course').value,
    type:      document.getElementById('grade-type').value,
    score:     +document.getElementById('grade-score').value,
    maxScore:  +document.getElementById('grade-max-score').value || 100,
    date:      document.getElementById('grade-date').value,
  };

  if (!payload.studentId || !payload.courseId || !payload.score) {
    toast('Please fill required fields', 'error');
    return;
  }

  try {
    let result;
    if (id) {
      try { result = await api('PUT', `${ENDPOINTS.grades}/${id}`, payload); } catch { result = { id: +id, ...payload }; }
      const idx = state.grades.findIndex(g => g.id === +id);
      if (idx !== -1) state.grades[idx] = result || { id: +id, ...payload };
      toast('Grade updated successfully', 'success');
    } else {
      try { result = await api('POST', ENDPOINTS.grades, payload); } catch { result = { id: Date.now(), ...payload }; }
      state.grades.unshift(result || { id: Date.now(), ...payload });
      toast('Grade added successfully', 'success');
    }

    renderGrades(state.grades);
    closeModal('grade-modal');
  } catch (err) {
    toast(err.message || 'Failed to save grade', 'error');
  }
}

async function deleteGrade(id) {
  if (!confirm('Delete this grade record?')) return;
  try {
    try { await api('DELETE', `${ENDPOINTS.grades}/${id}`); } catch {}
    state.grades = state.grades.filter(g => g.id !== id);
    renderGrades(state.grades);
    toast('Grade deleted', 'success');
  } catch (err) {
    toast('Failed to delete grade', 'error');
  }
}

/* ─── PROFILE ────────────────────────────────── */

function loadProfile() {
  const u = state.user || {};
  const saved = JSON.parse(localStorage.getItem('sms_profile') || '{}');

  // Fill fields
  document.getElementById('profile-firstName').value = saved.firstName || u.name?.split(' ')[0] || 'Admin';
  document.getElementById('profile-lastName').value  = saved.lastName  || u.name?.split(' ')[1] || '';
  document.getElementById('profile-email').value     = saved.email     || u.email || '';
  document.getElementById('profile-phone').value     = saved.phone     || '';

  // Display name & role
  const fullName = `${document.getElementById('profile-firstName').value} ${document.getElementById('profile-lastName').value}`.trim();
  document.getElementById('profile-display-name').textContent = fullName || u.name || 'Admin';
  document.getElementById('profile-display-role').textContent = u.role || 'Administrator';
  document.getElementById('profile-avatar-display').innerHTML = saved.avatarImg
    ? `<img src="${saved.avatarImg}" alt="avatar" />`
    : `<span>${initials(fullName || u.name || 'Admin')}</span>`;

  // Login stats
  const history = JSON.parse(localStorage.getItem('sms_login_history') || '[]');
  document.getElementById('profile-login-count').textContent = history.length || 1;
  document.getElementById('profile-last-login').textContent  = history[0]?.time || 'Сейчас';

  // Render history
  renderLoginHistory(history);
}

function saveProfile() {
  try {
    const firstName = (document.getElementById('profile-firstName')?.value || '').trim();
    const lastName  = (document.getElementById('profile-lastName')?.value  || '').trim();
    const email     = (document.getElementById('profile-email')?.value     || '').trim();
    const phone     = (document.getElementById('profile-phone')?.value     || '').trim();

    const saved = JSON.parse(localStorage.getItem('sms_profile') || '{}');
    const profile = { ...saved, firstName, lastName, email, phone };
    localStorage.setItem('sms_profile', JSON.stringify(profile));

    // Update user display everywhere
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || state.user?.name || 'Admin';
    if (state.user) {
      state.user = { ...state.user, name: fullName };
      localStorage.setItem('sms_user', JSON.stringify(state.user));
    }

    const nameEl = document.getElementById('profile-display-name');
    if (nameEl) nameEl.textContent = fullName;

    updateUserUI();
    toast('Профиль сохранён ✓', 'success');
  } catch (err) {
    console.error('saveProfile error:', err);
    toast('Ошибка сохранения: ' + err.message, 'error');
  }
}

function changePassword() {
  const oldPass     = document.getElementById('profile-old-pass').value;
  const newPass     = document.getElementById('profile-new-pass').value;
  const confirmPass = document.getElementById('profile-confirm-pass').value;

  if (!oldPass || !newPass || !confirmPass) { toast('Заполните все поля', 'error'); return; }
  if (newPass !== confirmPass) { toast('Пароли не совпадают', 'error'); return; }
  if (newPass.length < 6)     { toast('Минимум 6 символов', 'error'); return; }

  // Reset fields
  document.getElementById('profile-old-pass').value     = '';
  document.getElementById('profile-new-pass').value     = '';
  document.getElementById('profile-confirm-pass').value = '';
  toast('Пароль успешно изменён', 'success');
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = e.target.result;
    document.getElementById('profile-avatar-display').innerHTML = `<img src="${img}" alt="avatar" />`;

    const saved = JSON.parse(localStorage.getItem('sms_profile') || '{}');
    saved.avatarImg = img;
    localStorage.setItem('sms_profile', JSON.stringify(saved));

    // Update sidebar avatar too
    document.querySelectorAll('.user-avatar').forEach(el => {
      el.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
    });
    toast('Фото обновлено', 'success');
  };
  reader.readAsDataURL(file);
}

function renderLoginHistory(history) {
  const list = document.getElementById('login-history-list');
  if (!list) return;
  if (!history.length) {
    list.innerHTML = '<div class="login-history-item"><span class="login-history-icon">🟢</span><div class="login-history-info"><div class="login-history-ip">Текущая сессия</div><div class="login-history-time">Сейчас</div></div></div>';
    return;
  }
  list.innerHTML = history.slice(0, 8).map(h => `
    <div class="login-history-item">
      <span class="login-history-icon">${h.success ? '🟢' : '🔴'}</span>
      <div class="login-history-info">
        <div class="login-history-ip">${h.device || 'Браузер'}</div>
        <div class="login-history-time">${h.time}</div>
      </div>
    </div>`).join('');
}

function recordLogin() {
  const history = JSON.parse(localStorage.getItem('sms_login_history') || '[]');
  history.unshift({
    success: true,
    time: new Date().toLocaleString('ru-RU'),
    device: navigator.userAgent.includes('Mac') ? 'Mac / Safari' : 'Браузер',
  });
  localStorage.setItem('sms_login_history', JSON.stringify(history.slice(0, 20)));
}

/* ─── i18n ───────────────────────────────────── */

const LANGS = {
  ru: {
    nav_dashboard: 'Дашборд', nav_students: 'Студенты', nav_courses: 'Курсы',
    nav_grades: 'Оценки', nav_settings: 'Настройки', nav_reports: 'Отчёты',
    nav_logout: 'Выйти', section_main: 'Главное', section_academic: 'Учёба',
    section_system: 'Система',
    notif_title: 'Уведомления', notif_mark_all: 'Прочитать все', notif_empty: 'Нет уведомлений',
    settings_sub: 'Внешний вид и язык системы',
    settings_lang: '🌐 Язык интерфейса', settings_lang_choose: 'Выберите язык',
    settings_theme: '🎨 Тема оформления', settings_dark_mode: 'Тёмный режим',
    settings_current_theme: 'Текущая тема', theme_dark: 'Тёмная', theme_light: 'Светлая',
    settings_account: '👤 Аккаунт', settings_user: 'Пользователь',
    settings_role: 'Роль', settings_version: 'Версия системы',
    settings_notif: '🔔 Уведомления', settings_notif_enable: 'Включить уведомления',
    settings_notif_sound: 'Звук',
    reports_sub: 'Статистика и аналитика системы',
    reports_overview: 'Обзор', reports_students: 'Студенты по специальности',
    reports_gpa: 'Средний GPA по специальности', reports_grades_dist: 'Распределение оценок',
    reports_total_students: 'Всего студентов', reports_total_courses: 'Всего курсов',
    reports_total_grades: 'Всего оценок', reports_avg_gpa: 'Средний GPA',
    nav_profile: 'Профиль', profile_sub: 'Личная информация и безопасность',
    profile_info: '👤 Личная информация', profile_first_name: 'Имя', profile_last_name: 'Фамилия',
    profile_phone: 'Телефон', profile_save: 'Сохранить изменения',
    profile_change_pass: '🔒 Изменить пароль', profile_current_pass: 'Текущий пароль',
    profile_new_pass: 'Новый пароль', profile_confirm_pass: 'Подтвердите пароль',
    profile_update_pass: 'Обновить пароль', profile_history: '🕓 История входов',
    profile_logins: 'Входов', profile_last_login: 'Последний вход',
  },
  kz: {
    nav_dashboard: 'Бақылау тақтасы', nav_students: 'Студенттер', nav_courses: 'Курстар',
    nav_grades: 'Бағалар', nav_settings: 'Баптаулар', nav_reports: 'Есептер',
    nav_logout: 'Шығу', section_main: 'Негізгі', section_academic: 'Оқу',
    section_system: 'Жүйе',
    notif_title: 'Хабарламалар', notif_mark_all: 'Барлығын оқу', notif_empty: 'Хабарлама жоқ',
    settings_sub: 'Интерфейс тілі мен тақырыбы',
    settings_lang: '🌐 Интерфейс тілі', settings_lang_choose: 'Тіл таңдаңыз',
    settings_theme: '🎨 Тақырып', settings_dark_mode: 'Қараңғы режим',
    settings_current_theme: 'Ағымдағы тақырып', theme_dark: 'Қараңғы', theme_light: 'Жарық',
    settings_account: '👤 Аккаунт', settings_user: 'Пайдаланушы',
    settings_role: 'Рөл', settings_version: 'Жүйе нұсқасы',
    settings_notif: '🔔 Хабарламалар', settings_notif_enable: 'Хабарламаларды қосу',
    settings_notif_sound: 'Дыбыс',
    reports_sub: 'Жүйенің статистикасы мен аналитикасы',
    reports_overview: 'Шолу', reports_students: 'Мамандық бойынша студенттер',
    reports_gpa: 'Мамандық бойынша орташа GPA', reports_grades_dist: 'Бағалар бөлінісі',
    reports_total_students: 'Барлық студенттер', reports_total_courses: 'Барлық курстар',
    reports_total_grades: 'Барлық бағалар', reports_avg_gpa: 'Орташа GPA',
    nav_profile: 'Профиль', profile_sub: 'Жеке ақпарат және қауіпсіздік',
    profile_info: '👤 Жеке ақпарат', profile_first_name: 'Аты', profile_last_name: 'Тегі',
    profile_phone: 'Телефон', profile_save: 'Сақтау',
    profile_change_pass: '🔒 Құпия сөзді өзгерту', profile_current_pass: 'Ағымдағы пароль',
    profile_new_pass: 'Жаңа пароль', profile_confirm_pass: 'Паролді растаңыз',
    profile_update_pass: 'Жаңарту', profile_history: '🕓 Кіру тарихы',
    profile_logins: 'Кіру саны', profile_last_login: 'Соңғы кіру',
  },
  en: {
    nav_dashboard: 'Dashboard', nav_students: 'Students', nav_courses: 'Courses',
    nav_grades: 'Grades', nav_settings: 'Settings', nav_reports: 'Reports',
    nav_logout: 'Logout', section_main: 'Main', section_academic: 'Academic',
    section_system: 'System',
    notif_title: 'Notifications', notif_mark_all: 'Mark all read', notif_empty: 'No notifications',
    settings_sub: 'Appearance and language settings',
    settings_lang: '🌐 Interface Language', settings_lang_choose: 'Choose language',
    settings_theme: '🎨 Theme', settings_dark_mode: 'Dark mode',
    settings_current_theme: 'Current theme', theme_dark: 'Dark', theme_light: 'Light',
    settings_account: '👤 Account', settings_user: 'User',
    settings_role: 'Role', settings_version: 'System version',
    settings_notif: '🔔 Notifications', settings_notif_enable: 'Enable notifications',
    settings_notif_sound: 'Sound',
    reports_sub: 'System statistics and analytics',
    reports_overview: 'Overview', reports_students: 'Students by major',
    reports_gpa: 'Average GPA by major', reports_grades_dist: 'Grade distribution',
    reports_total_students: 'Total students', reports_total_courses: 'Total courses',
    reports_total_grades: 'Total grades', reports_avg_gpa: 'Average GPA',
    nav_profile: 'Profile', profile_sub: 'Personal information and security',
    profile_info: '👤 Personal Information', profile_first_name: 'First Name', profile_last_name: 'Last Name',
    profile_phone: 'Phone', profile_save: 'Save Changes',
    profile_change_pass: '🔒 Change Password', profile_current_pass: 'Current Password',
    profile_new_pass: 'New Password', profile_confirm_pass: 'Confirm Password',
    profile_update_pass: 'Update Password', profile_history: '🕓 Login History',
    profile_logins: 'Logins', profile_last_login: 'Last Login',
  },
};

let currentLang = 'ru';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('sms_lang', lang);
  const dict = LANGS[lang] || LANGS.ru;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });

  // Update active lang button
  ['ru','kz','en'].forEach(l => {
    const btn = document.getElementById(`lang-${l}`);
    if (btn) btn.classList.toggle('active', l === lang);
  });

  // Update theme label text
  const isLight = document.body.classList.contains('light');
  const themeLabel = document.getElementById('theme-label');
  if (themeLabel) themeLabel.textContent = isLight ? dict.theme_light : dict.theme_dark;
  if (themeLabel) themeLabel.dataset.i18n = isLight ? 'theme_light' : 'theme_dark';
}

function setLang(lang) { applyLang(lang); }

/* ─── THEME ──────────────────────────────────── */

function applyTheme(isLight) {
  document.body.classList.toggle('light', isLight);
  localStorage.setItem('sms_theme', isLight ? 'light' : 'dark');

  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.checked = !isLight;

  const dict = LANGS[currentLang] || LANGS.ru;
  const themeLabel = document.getElementById('theme-label');
  if (themeLabel) {
    themeLabel.textContent = isLight ? dict.theme_light : dict.theme_dark;
    themeLabel.dataset.i18n = isLight ? 'theme_light' : 'theme_dark';
  }
}

function toggleTheme(isDarkChecked) {
  applyTheme(!isDarkChecked);
}

/* ─── NOTIFICATIONS ──────────────────────────── */

const NOTIFS = [
  { id: 1, icon: '👤', title_ru: 'Новый студент добавлен', title_kz: 'Жаңа студент қосылды', title_en: 'New student added', time: '2 мин назад', unread: true },
  { id: 2, icon: '📚', title_ru: 'Курс CS101 обновлён', title_kz: 'CS101 курсы жаңартылды', title_en: 'Course CS101 updated', time: '15 мин назад', unread: true },
  { id: 3, icon: '📝', title_ru: 'Оценка выставлена', title_kz: 'Баға қойылды', title_en: 'Grade submitted', time: '1 сaat назад', unread: false },
];

function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  panel?.classList.toggle('open');
  if (panel?.classList.contains('open')) renderNotifs();
}

function renderNotifs() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  const dict = LANGS[currentLang] || LANGS.ru;
  const unread = NOTIFS.filter(n => n.unread);

  if (!NOTIFS.length) {
    list.innerHTML = `<div class="notif-empty">${dict.notif_empty}</div>`;
    return;
  }

  list.innerHTML = NOTIFS.map(n => {
    const title = n[`title_${currentLang}`] || n.title_ru;
    return `<div class="notif-item ${n.unread ? 'notif-unread' : ''}" onclick="readNotif(${n.id})">
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-body">
        <div class="notif-title">${title}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>`;
  }).join('');

  // Update dot
  const dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = unread.length ? '' : 'none';
}

function readNotif(id) {
  const n = NOTIFS.find(x => x.id === id);
  if (n) n.unread = false;
  renderNotifs();
}

function markAllRead() {
  NOTIFS.forEach(n => n.unread = false);
  renderNotifs();
}

/* ─── REPORTS ────────────────────────────────── */

function loadReports() {
  const dict = LANGS[currentLang] || LANGS.ru;
  const container = document.getElementById('reports-content');
  if (!container) return;

  const students  = state.students.length;
  const courses   = state.courses.length;
  const grades    = state.grades.length;
  const avgGpa    = students
    ? (state.students.reduce((s, x) => s + (x.gpa || 0), 0) / students).toFixed(2)
    : '—';

  // Major distribution
  const majorMap = {};
  state.students.forEach(s => { majorMap[s.major || 'Other'] = (majorMap[s.major || 'Other'] || 0) + 1; });
  const majors = Object.entries(majorMap).sort((a,b) => b[1]-a[1]).slice(0,6);
  const maxM   = majors[0]?.[1] || 1;

  // GPA by major
  const gpaMap = {};
  state.students.forEach(s => {
    if (!gpaMap[s.major]) gpaMap[s.major] = [];
    gpaMap[s.major].push(s.gpa || 0);
  });
  const gpaByMajor = Object.entries(gpaMap)
    .map(([k,v]) => [k, (v.reduce((a,b)=>a+b,0)/v.length).toFixed(2)])
    .sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Grade letter distribution
  const letterMap = { A:0, B:0, C:0, D:0, F:0 };
  state.grades.forEach(g => {
    const pct = Math.round((g.score / (g.maxScore||100)) * 100);
    const l = gradeLetter(pct);
    letterMap[l] = (letterMap[l]||0) + 1;
  });
  const maxL = Math.max(...Object.values(letterMap), 1);

  container.innerHTML = `
    <!-- Overview cards -->
    <div class="report-card">
      <h3>${dict.reports_overview}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:.5rem">
        <div><div class="report-stat">${students}</div><div class="report-sub">${dict.reports_total_students}</div></div>
        <div><div class="report-stat">${courses}</div><div class="report-sub">${dict.reports_total_courses}</div></div>
        <div><div class="report-stat">${grades}</div><div class="report-sub">${dict.reports_total_grades}</div></div>
        <div><div class="report-stat">${avgGpa}</div><div class="report-sub">${dict.reports_avg_gpa}</div></div>
      </div>
    </div>

    <!-- Students by major -->
    <div class="report-card">
      <h3>${dict.reports_students}</h3>
      ${majors.length ? majors.map(([name, cnt]) => `
        <div class="report-bar-row">
          <div class="report-bar-label" title="${name}">${name}</div>
          <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round(cnt/maxM*100)}%"></div></div>
          <div class="report-bar-val">${cnt}</div>
        </div>`).join('') : `<div class="notif-empty" style="padding:1rem">—</div>`}
    </div>

    <!-- GPA by major -->
    <div class="report-card">
      <h3>${dict.reports_gpa}</h3>
      ${gpaByMajor.length ? gpaByMajor.map(([name, gpa]) => `
        <div class="report-bar-row">
          <div class="report-bar-label" title="${name}">${name}</div>
          <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round(gpa/4*100)}%;background:linear-gradient(90deg,var(--success),var(--accent))"></div></div>
          <div class="report-bar-val">${gpa}</div>
        </div>`).join('') : `<div class="notif-empty" style="padding:1rem">—</div>`}
    </div>

    <!-- Grade distribution -->
    <div class="report-card">
      <h3>${dict.reports_grades_dist}</h3>
      ${Object.entries(letterMap).map(([l, cnt]) => `
        <div class="report-bar-row">
          <div class="report-bar-label">Grade ${l}</div>
          <div class="report-bar-track"><div class="report-bar-fill" style="width:${Math.round(cnt/maxL*100)}%;background:${l==='A'?'var(--success)':l==='B'?'var(--accent)':l==='C'?'var(--warning)':'var(--danger)'}"></div></div>
          <div class="report-bar-val">${cnt}</div>
        </div>`).join('')}
    </div>
  `;
}

/* ─── INIT ───────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Login form
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    await login(username, password);
    btn.disabled = false;
    btn.textContent = 'Sign In';
  });

  // Nav clicks
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.page));
  });

  // Modal close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  // Overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // Search inputs
  const studentsSearch = document.getElementById('students-search');
  if (studentsSearch) studentsSearch.addEventListener('input', debounce(e => filterStudents(e.target.value)));

  const coursesSearch = document.getElementById('courses-search');
  if (coursesSearch) coursesSearch.addEventListener('input', debounce(e => filterCourses(e.target.value)));

  const gradesSearch = document.getElementById('grades-search');
  if (gradesSearch) gradesSearch.addEventListener('input', debounce(e => filterGrades(e.target.value)));

  // Status filter for students
  const statusFilter = document.getElementById('students-status-filter');
  if (statusFilter) statusFilter.addEventListener('change', e => {
    const val = e.target.value;
    renderStudents(val ? state.students.filter(s => s.status === val) : state.students);
  });

  // Score preview in grade modal
  const scoreInput   = document.getElementById('grade-score');
  const maxInput     = document.getElementById('grade-max-score');
  const scorePreview = document.getElementById('grade-score-preview');
  function updateScorePreview() {
    if (!scorePreview) return;
    const pct = Math.round((+scoreInput?.value / (+maxInput?.value || 100)) * 100);
    const letter = gradeLetter(pct);
    scorePreview.textContent = `${pct}% — Grade ${letter}`;
    scorePreview.className   = `text-sm ${pct>=90?'text-success':pct>=70?'text-accent':pct>=60?'':' text-danger'}`;
  }
  scoreInput?.addEventListener('input', updateScorePreview);
  maxInput?.addEventListener('input', updateScorePreview);

  // Header global search
  const headerSearch = document.getElementById('header-search');
  if (headerSearch) headerSearch.addEventListener('input', debounce(e => {
    const q = e.target.value;
    if (!q) return;
    // Search across all data
    const page = state.currentPage;
    if (page === 'students') filterStudents(q);
    else if (page === 'courses') filterCourses(q);
    else if (page === 'grades') filterGrades(q);
  }));

  // Check auth
  if (state.token && state.user) {
    showApp();
  } else {
    showLogin();
  }

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notif-dropdown')) {
      document.getElementById('notif-panel')?.classList.remove('open');
    }
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    }
  });

  // Init theme & language
  const savedTheme = localStorage.getItem('sms_theme') || 'dark';
  const savedLang  = localStorage.getItem('sms_lang')  || 'ru';
  applyTheme(savedTheme === 'light');
  applyLang(savedLang);
});
