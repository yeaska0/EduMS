package kz.edu.sms.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.edu.sms.dto.enrollment.*;
import kz.edu.sms.service.EnrollmentService;
import kz.edu.sms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/enrollments") @RequiredArgsConstructor
@Tag(name="Enrollments")
public class EnrollmentController {
    private final EnrollmentService service;

    @GetMapping @Operation(summary="Get all enrollments")
    public ResponseEntity<PageResponse<EnrollmentResponse>> all(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size,
            @RequestParam(required=false) Long studentId,
            @RequestParam(required=false) Long courseId){
        if(studentId!=null) return ResponseEntity.ok(service.byStudent(studentId, page, size));
        if(courseId!=null)  return ResponseEntity.ok(service.byCourse(courseId, page, size));
        return ResponseEntity.ok(service.findAll(page, size));
    }

    @PostMapping @Operation(summary="Enroll student in course")
    public ResponseEntity<EnrollmentResponse> enroll(@Valid @RequestBody EnrollmentRequest req){
        return ResponseEntity.status(201).body(service.enroll(req));
    }

    @DeleteMapping("/{id}") @Operation(summary="Drop enrollment")
    public ResponseEntity<Void> drop(@PathVariable Long id){
        service.drop(id);
        return ResponseEntity.noContent().build();
    }
}
