package kz.edu.sms.service;
import kz.edu.sms.dto.enrollment.*;
import kz.edu.sms.entity.*;
import kz.edu.sms.exception.*;
import kz.edu.sms.mapper.EnrollmentMapper;
import kz.edu.sms.repository.*;
import kz.edu.sms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository repo;
    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;
    private final EnrollmentMapper mapper;

    public PageResponse<EnrollmentResponse> findAll(int page, int size){
        Pageable p = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toPage(repo.findAll(p));
    }

    public PageResponse<EnrollmentResponse> byStudent(Long studentId, int page, int size){
        Pageable p = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toPage(repo.findByStudentId(studentId, p));
    }

    public PageResponse<EnrollmentResponse> byCourse(Long courseId, int page, int size){
        Pageable p = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toPage(repo.findByCourseId(courseId, p));
    }

    @Transactional
    public EnrollmentResponse enroll(EnrollmentRequest req){
        if(repo.existsByStudentIdAndCourseId(req.getStudentId(), req.getCourseId()))
            throw new DuplicateResourceException("Student already enrolled in this course");

        Student student = studentRepo.findById(req.getStudentId())
            .orElseThrow(()->new ResourceNotFoundException("Student not found: "+req.getStudentId()));
        Course course = courseRepo.findById(req.getCourseId())
            .orElseThrow(()->new ResourceNotFoundException("Course not found: "+req.getCourseId()));

        if(course.getEnrolled() >= course.getCapacity())
            throw new BadRequestException("Course is full (capacity: "+course.getCapacity()+")");

        Enrollment e = Enrollment.builder().student(student).course(course).build();
        Enrollment saved = repo.save(e);

        course.setEnrolled(course.getEnrolled() + 1);
        if(course.getEnrolled() >= course.getCapacity()) course.setStatus(Course.Status.FULL);
        courseRepo.save(course);

        return mapper.toResponse(saved);
    }

    @Transactional
    public void drop(Long id){
        Enrollment e = repo.findById(id)
            .orElseThrow(()->new ResourceNotFoundException("Enrollment not found: "+id));
        Course course = e.getCourse();
        repo.deleteById(id);
        if(course.getEnrolled() > 0) course.setEnrolled(course.getEnrolled() - 1);
        if(course.getStatus()==Course.Status.FULL) course.setStatus(Course.Status.ACTIVE);
        courseRepo.save(course);
    }

    private PageResponse<EnrollmentResponse> toPage(Page<Enrollment> p){
        return PageResponse.<EnrollmentResponse>builder()
            .content(p.getContent().stream().map(mapper::toResponse).toList())
            .page(p.getNumber()).size(p.getSize())
            .totalElements(p.getTotalElements()).totalPages(p.getTotalPages()).last(p.isLast()).build();
    }
}
