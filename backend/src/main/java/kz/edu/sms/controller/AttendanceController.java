package kz.edu.sms.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.edu.sms.dto.attendance.*;
import kz.edu.sms.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/attendance") @RequiredArgsConstructor
@Tag(name="Attendance")
public class AttendanceController {
    private final AttendanceService service;

    @PostMapping @Operation(summary="Mark attendance")
    public ResponseEntity<AttendanceResponse> mark(@Valid @RequestBody AttendanceRequest req) {
        return ResponseEntity.ok(service.save(req));
    }

    @GetMapping("/course/{courseId}") @Operation(summary="Get attendance by course")
    public ResponseEntity<List<AttendanceResponse>> byCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(service.getByCourse(courseId));
    }

    @GetMapping("/course/{courseId}/date/{date}") @Operation(summary="Get attendance by course and date")
    public ResponseEntity<List<AttendanceResponse>> byCourseAndDate(
            @PathVariable Long courseId, @PathVariable String date) {
        return ResponseEntity.ok(service.getByCourseAndDate(courseId, date));
    }

    @GetMapping("/student/{studentId}/course/{courseId}") @Operation(summary="Get student attendance in course")
    public ResponseEntity<List<AttendanceResponse>> byStudentAndCourse(
            @PathVariable Long studentId, @PathVariable Long courseId) {
        return ResponseEntity.ok(service.getByStudentAndCourse(studentId, courseId));
    }
}
