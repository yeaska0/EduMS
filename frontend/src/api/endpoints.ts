import api from './client'
import type {
  LoginRequest, AuthResponse,
  Student, StudentRequest,
  Course, CourseRequest,
  Grade, GradeRequest,
  Enrollment, EnrollmentRequest,
  DashboardStats, PageResponse
} from '../types'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) => api.post<AuthResponse>('/auth/refresh', { refreshToken }),
}

// ─── Students ────────────────────────────────────────────────────────────────
export const studentsApi = {
  list: (page = 0, size = 10, search?: string) =>
    api.get<PageResponse<Student>>('/students', { params: { page, size, search } }),
  get: (id: number) => api.get<Student>(`/students/${id}`),
  create: (data: StudentRequest) => api.post<Student>('/students', data),
  update: (id: number, data: StudentRequest) => api.put<Student>(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
}

// ─── Courses ─────────────────────────────────────────────────────────────────
export const coursesApi = {
  list: (page = 0, size = 10, search?: string) =>
    api.get<PageResponse<Course>>('/courses', { params: { page, size, search } }),
  get: (id: number) => api.get<Course>(`/courses/${id}`),
  create: (data: CourseRequest) => api.post<Course>('/courses', data),
  update: (id: number, data: CourseRequest) => api.put<Course>(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
}

// ─── Grades ──────────────────────────────────────────────────────────────────
export const gradesApi = {
  list: (page = 0, size = 10, studentId?: number, courseId?: number) =>
    api.get<PageResponse<Grade>>('/grades', { params: { page, size, studentId, courseId } }),
  get: (id: number) => api.get<Grade>(`/grades/${id}`),
  create: (data: GradeRequest) => api.post<Grade>('/grades', data),
  update: (id: number, data: GradeRequest) => api.put<Grade>(`/grades/${id}`, data),
  delete: (id: number) => api.delete(`/grades/${id}`),
}

// ─── Enrollments ─────────────────────────────────────────────────────────────
export const enrollmentsApi = {
  list: (page = 0, size = 10, studentId?: number, courseId?: number) =>
    api.get<PageResponse<Enrollment>>('/enrollments', { params: { page, size, studentId, courseId } }),
  enroll: (data: EnrollmentRequest) => api.post<Enrollment>('/enrollments', data),
  drop: (id: number) => api.delete(`/enrollments/${id}`),
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
}
