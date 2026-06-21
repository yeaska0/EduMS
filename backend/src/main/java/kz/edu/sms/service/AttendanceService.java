package kz.edu.sms.service;
import kz.edu.sms.dto.attendance.*;
import kz.edu.sms.entity.*;
import kz.edu.sms.repository.*;
import kz.edu.sms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository repo;
    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;

    @Transactional
    public AttendanceResponse save(AttendanceRequest req) {
        Student student = studentRepo.findById(req.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Course course = courseRepo.findById(req.getCourseId())
            .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        LocalDate date = LocalDate.parse(req.getDate());
        Attendance.Status status = req.getStatus() != null
            ? Attendance.Status.valueOf(req.getStatus())
            : Attendance.Status.PRESENT;

        Attendance att = repo.findByStudentIdAndCourseIdAndDate(req.getStudentId(), req.getCourseId(), date)
            .orElse(Attendance.builder().student(student).course(course).date(date).build());
        att.setStatus(status);
        att.setNote(req.getNote());
        return toResponse(repo.save(att));
    }

    public List<AttendanceResponse> getByCourseAndDate(Long courseId, String date) {
        return repo.findByCourseIdAndDate(courseId, LocalDate.parse(date))
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AttendanceResponse> getByStudentAndCourse(Long studentId, Long courseId) {
        return repo.findByStudentIdAndCourseId(studentId, courseId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AttendanceResponse> getByCourse(Long courseId) {
        return repo.findByCourseIdOrderByDateDesc(courseId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
            .id(a.getId())
            .studentId(a.getStudent().getId())
            .studentName(a.getStudent().getFirstName() + " " + a.getStudent().getLastName())
            .courseId(a.getCourse().getId())
            .courseName(a.getCourse().getName())
            .date(a.getDate().toString())
            .status(a.getStatus().name())
            .note(a.getNote())
            .build();
    }
}
