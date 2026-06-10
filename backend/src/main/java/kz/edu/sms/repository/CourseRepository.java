package kz.edu.sms.repository;
import kz.edu.sms.entity.Course;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
public interface CourseRepository extends JpaRepository<Course,Long> {
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);
    @Query("SELECT c FROM Course c WHERE LOWER(CONCAT(c.name,' ',c.code,' ',COALESCE(c.instructor,''))) LIKE %:q%")
    Page<Course> search(@Param("q") String q, Pageable pageable);
    Page<Course> findAll(Pageable pageable);
    long countByStatus(Course.Status status);
}
