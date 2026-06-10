package kz.edu.sms.repository;
import kz.edu.sms.entity.Grade;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface GradeRepository extends JpaRepository<Grade,Long> {
    Page<Grade> findByStudentId(Long studentId, Pageable pageable);
    Page<Grade> findByCourseId(Long courseId, Pageable pageable);
    Page<Grade> findAll(Pageable pageable);
    List<Grade> findByStudentId(Long studentId);
    @Query("SELECT AVG(g.score * 1.0 / g.maxScore * 4.0) FROM Grade g WHERE g.student.id = :sid")
    Double calcGpaByStudent(@Param("sid") Long studentId);
    @Query("SELECT AVG(g.score * 1.0 / g.maxScore * 100.0) FROM Grade g")
    Double avgScorePercent();
}
