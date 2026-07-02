// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginRequest { username: string; password: string }
export interface AuthResponse { accessToken: string; refreshToken: string; username: string; role: string; tokenType?: string; name?: string }

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

// ─── User ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: number
  username: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  bio?: string
  role: string
  createdAt?: string
}

export interface UserProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  bio?: string
}

// ─── Attendance ──────────────────────────────────────────────────────────────
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

export interface Attendance {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  date: string
  status: AttendanceStatus
  note?: string
}

export interface AttendanceRequest {
  studentId: number
  courseId: number
  date: string
  status: AttendanceStatus
  note?: string
}

// ─── Task ────────────────────────────────────────────────────────────────────
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus   = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: number
  title: string
  description?: string
  dueDate?: string
  courseId?: number
  courseName?: string
  priority: TaskPriority
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface TaskRequest {
  title: string
  description?: string
  dueDate?: string
  courseId?: number
  priority?: TaskPriority
  status?: TaskStatus
}

// ─── Note ────────────────────────────────────────────────────────────────────
export interface Note {
  id: number
  title: string
  content?: string
  courseId?: number
  courseName?: string
  tags?: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface NoteRequest {
  title: string
  content?: string
  courseId?: number
  tags?: string
  pinned?: boolean
}

// ─── ScheduleEvent ───────────────────────────────────────────────────────────
export type EventType = 'LECTURE' | 'SEMINAR' | 'LAB' | 'EXAM' | 'OTHER'

export interface ScheduleEvent {
  id: number
  title: string
  courseId?: number
  courseName?: string
  instructor?: string
  room?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  color?: string
  type: EventType
}

export interface ScheduleRequest {
  title: string
  courseId?: number
  instructor?: string
  room?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  color?: string
  type?: EventType
}

// ─── Pomodoro ────────────────────────────────────────────────────────────────
export interface PomodoroSession {
  id: number
  taskId?: number
  taskTitle?: string
  durationMinutes: number
  completed: boolean
  startedAt: string
}

export interface PomodoroRequest {
  taskId?: number
  durationMinutes?: number
  completed?: boolean
}

// ─── AI ──────────────────────────────────────────────────────────────────────
export interface AIRequest {
  prompt: string
  type: 'explain' | 'quiz' | 'flashcards' | 'summary'
}

export interface AIResponse {
  response: string
  tokensUsed?: number
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
