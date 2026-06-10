package kz.edu.sms.dto.dashboard;
import lombok.*;
@Data @Builder public class DashboardStats {
    private long totalStudents;
    private long totalCourses;
    private long totalEnrollments;
    private long totalGrades;
    private double averageGpa;
    private long activeStudents;
    private long activeCourses;
}
