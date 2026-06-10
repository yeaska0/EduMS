// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest { username: string; password: string }
export interface AuthResponse { token: string; refreshToken: string; username: string; role: string }

// ─── Common ──────────────────────────────────────────────────────────────────
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

// ─── Student ─────────────────────────────────────────────────────────────────
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED'

export interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  enrollmentDate?: string
  major?: string
  gpa: number
  status: StudentStatus
  createdAt: string
}

export interface StudentRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  enrollmentDate?: string
  major?: string
  status?: StudentStatus
}

// ─── Course ──────────────────────────────────────────────────────────────────
export type CourseStatus = 'ACTIVE' | 'INACTIVE' | 'FULL'

export interface Course {
  id: number
  code: string
  name: string
  description?: string
  credits: number
  instructor?: string
  startDate?: string
  endDate?: string
  enrolled: number
  capacity: number
  status: CourseStatus
  createdAt: string
}

export interface CourseRequest {
  code: string
  name: string
  description?: string
  credits: number
  instructor?: string
  startDate?: string
  endDate?: string
  capacity?: number
  status?: CourseStatus
}

// ─── Grade ───────────────────────────────────────────────────────────────────
export type GradeType = 'MIDTERM' | 'FINAL' | 'ASSIGNMENT' | 'QUIZ' | 'PROJECT'

export interface Grade {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  score: number
  maxScore: number
  type: GradeType
  semester?: string
  date?: string
  createdAt: string
}

export interface GradeRequest {
  studentId: number
  courseId: number
  score: number
  maxScore?: number
  type?: GradeType
  semester?: string
  date?: string
}

// ─── Enrollment ──────────────────────────────────────────────────────────────
export type EnrollmentStatus = 'ACTIVE' | 'DROPPED' | 'COMPLETED'

export interface Enrollment {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  enrolledAt: string
  status: EnrollmentStatus
}

export interface EnrollmentRequest {
  studentId: number
  courseId: number
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalStudents: number
  activeStudents: number
  totalCourses: number
  activeCourses: number
  totalEnrollments: number
  totalGrades: number
  averageGpa: number
  topStudents: { id: number; name: string; gpa: number }[]
  gradeDistribution: { type: string; count: number }[]
  enrollmentByStatus: { status: string; count: number }[]
}
