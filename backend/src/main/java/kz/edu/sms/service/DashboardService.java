package kz.edu.sms.service;
import kz.edu.sms.dto.dashboard.DashboardStats;
import kz.edu.sms.entity.*;
import kz.edu.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class DashboardService {
    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final GradeRepository gradeRepo;

    public DashboardStats stats(){
        Double avg = gradeRepo.avgScorePercent();
        return DashboardStats.builder()
            .totalStudents(studentRepo.count())
            .totalCourses(courseRepo.count())
            .totalEnrollments(enrollmentRepo.count())
            .totalGrades(gradeRepo.count())
            .averageGpa(avg!=null ? Math.round(avg*10)/10.0 : 0.0)
            .activeStudents(studentRepo.countByStatus(Student.Status.ACTIVE))
            .activeCourses(courseRepo.countByStatus(Course.Status.ACTIVE))
            .build();
    }
}
