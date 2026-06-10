package kz.edu.sms.service;
import kz.edu.sms.dto.grade.*;
import kz.edu.sms.entity.*;
import kz.edu.sms.exception.*;
import kz.edu.sms.mapper.GradeMapper;
import kz.edu.sms.repository.*;
import kz.edu.sms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class GradeService {
    private final GradeRepository repo;
    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;
    private final GradeMapper mapper;

    public PageResponse<GradeResponse> findAll(int page, int size){
        Pageable p = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toPage(repo.findAll(p));
    }

    public PageResponse<GradeResponse> byStudent(Long studentId, int page, int size){
        Pageable p = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toPage(repo.findByStudentId(studentId, p));
    }

    public PageResponse<GradeResponse> byCourse(Long courseId, int page, int size){
        Pageable p = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return toPage(repo.findByCourseId(courseId, p));
    }

    public GradeResponse findById(Long id){ return mapper.toResponse(get(id)); }

    @Transactional
    public GradeResponse create(GradeRequest req){
        Student student = studentRepo.findById(req.getStudentId())
            .orElseThrow(()->new ResourceNotFoundException("Student not found: "+req.getStudentId()));
        Course course = courseRepo.findById(req.getCourseId())
            .orElseThrow(()->new ResourceNotFoundException("Course not found: "+req.getCourseId()));

        Grade g = Grade.builder()
            .student(student).course(course)
            .score(req.getScore())
            .maxScore(req.getMaxScore()!=null?req.getMaxScore():100)
            .type(req.getType()!=null?req.getType():Grade.Type.ASSIGNMENT)
            .semester(req.getSemester()).date(req.getDate())
            .createdAt(LocalDateTime.now())
            .build();
        GradeResponse resp = mapper.toResponse(repo.save(g));
        updateStudentGpa(student.getId());
        return resp;
    }

    @Transactional
    public GradeResponse update(Long id, GradeRequest req){
        Grade g = get(id);
        g.setScore(req.getScore());
        if(req.getMaxScore()!=null) g.setMaxScore(req.getMaxScore());
        if(req.getType()!=null) g.setType(req.getType());
        if(req.getSemester()!=null) g.setSemester(req.getSemester());
        if(req.getDate()!=null) g.setDate(req.getDate());
        GradeResponse resp = mapper.toResponse(repo.save(g));
        updateStudentGpa(g.getStudent().getId());
        return resp;
    }

    @Transactional
    public void delete(Long id){
        Grade g = get(id);
        Long studentId = g.getStudent().getId();
        repo.deleteById(id);
        updateStudentGpa(studentId);
    }

    private void updateStudentGpa(Long studentId){
        Double gpa = repo.calcGpaByStudent(studentId);
        studentRepo.findById(studentId).ifPresent(s -> {
            s.setGpa(gpa!=null ? Math.round(gpa*100)/100.0 : 0.0);
            studentRepo.save(s);
        });
    }

    private Grade get(Long id){
        return repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Grade not found: "+id));
    }

    private PageResponse<GradeResponse> toPage(Page<Grade> p){
        return PageResponse.<GradeResponse>builder()
            .content(p.getContent().stream().map(mapper::toResponse).toList())
            .page(p.getNumber()).size(p.getSize())
            .totalElements(p.getTotalElements()).totalPages(p.getTotalPages()).last(p.isLast()).build();
    }
}
