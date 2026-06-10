package kz.edu.sms.repository;
import kz.edu.sms.entity.Enrollment;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
public interface EnrollmentRepository extends JpaRepository<Enrollment,Long> {
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    Page<Enrollment> findByStudentId(Long studentId, Pageable pageable);
    Page<Enrollment> findByCourseId(Long courseId, Pageable pageable);
    Page<Enrollment> findAll(Pageable pageable);
    long countByStudentId(Long studentId);
    long countByCourseId(Long courseId);
}
