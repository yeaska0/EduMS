package kz.edu.sms.repository;
import kz.edu.sms.entity.Student;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface StudentRepository extends JpaRepository<Student,Long> {
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    @Query("SELECT s FROM Student s WHERE LOWER(CONCAT(s.firstName,' ',s.lastName,' ',s.email,' ',COALESCE(s.major,''))) LIKE %:q%")
    Page<Student> search(@Param("q") String q, Pageable pageable);
    Page<Student> findAll(Pageable pageable);
    long countByStatus(Student.Status status);
}
