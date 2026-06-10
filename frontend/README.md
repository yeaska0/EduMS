# 🎓 EduMS — Student Management System

> Full-stack web application for managing students, courses, grades and enrollments.

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=flat&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat&logo=openjdk&logoColor=white)

---

## ✨ Features

- 🔐 **JWT Authentication** — login, token refresh, secure logout
- 👨‍🎓 **Student Management** — CRUD, search, pagination, GPA tracking
- 📚 **Course Management** — capacity control, status (Active / Full / Inactive)
- 📊 **Grades** — score tracking by student & course with color coding
- 🔗 **Enrollments** — enroll/drop students with automatic capacity updates
- 📈 **Dashboard** — live stats, grade distribution chart, enrollment pie chart
- 🌐 **i18n** — Russian, Kazakh, English interface
- 🌙 **Dark / Light theme**
- 📱 **Responsive design**

---

## 🛠 Tech Stack

### Backend
| Technology | Version |
|---|---|
| Java | 21 |
| Spring Boot | 3.3.5 |
| Spring Security + JWT | jjwt 0.11.5 |
| Spring Data JPA | Hibernate 6.5 |
| PostgreSQL | 16 |
| Lombok | 1.18.34 |
| SpringDoc OpenAPI | 2.3.0 |

### Frontend
| Technology | Version |
|---|---|
| React | 18 |
| TypeScript | 5.5 |
| Vite | 5.4 |
| Tailwind CSS | 3.4 |
| Zustand | 4.5 |
| React Router | v6 |
| Axios | 1.7 |
| Recharts | 2.12 |

---

## 🚀 Getting Started

### Prerequisites
- Java 21 ([OpenJDK 21](https://adoptium.net/))
- Node.js 18+
- PostgreSQL 14+

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/EduMS.git
cd EduMS
```

### 2. Database

```sql
CREATE DATABASE student_management;
```

### 3. Backend

```bash
cd backend
# Edit application.properties: set spring.datasource.username and password
export JAVA_HOME=/path/to/jdk-21
./mvnw spring-boot:run
```

Backend: **http://localhost:8080** | Swagger: **http://localhost:8080/swagger-ui.html**

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:3000**

### Default Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin |
| `teacher` | `teach123` | Teacher |

---

## 📁 Project Structure

```
EduMS/
├── backend/                    # Spring Boot application
│   ├── src/main/java/kz/edu/sms/
│   │   ├── config/             # Security, CORS
│   │   ├── controller/         # REST API controllers
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities
│   │   ├── exception/          # Global exception handling
│   │   ├── mapper/             # Entity ↔ DTO mappers
│   │   ├── repository/         # Spring Data JPA
│   │   ├── security/           # JWT filter, UserDetailsService
│   │   └── service/            # Business logic
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/                   # React + TypeScript application
    └── src/
        ├── api/                # Axios client & endpoints
        ├── components/         # UI components
        ├── i18n/               # Translations (RU/KZ/EN)
        ├── pages/              # Page components
        ├── store/              # Zustand state
        └── types/              # TypeScript interfaces
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/students` | List students |
| POST | `/api/students` | Create student |
| PUT | `/api/students/{id}` | Update student |
| DELETE | `/api/students/{id}` | Delete student |
| GET | `/api/courses` | List courses |
| POST | `/api/courses` | Create course |
| GET | `/api/grades` | List grades |
| POST | `/api/grades` | Add grade |
| GET | `/api/enrollments` | List enrollments |
| POST | `/api/enrollments` | Enroll student |
| DELETE | `/api/enrollments/{id}` | Drop enrollment |
| GET | `/api/dashboard/stats` | Dashboard stats |

---

## 👤 Author

**Yerasyl** — Portfolio Project 2026

---

## 📄 License

MIT License
