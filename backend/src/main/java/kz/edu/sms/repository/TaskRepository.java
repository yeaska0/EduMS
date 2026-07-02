package kz.edu.sms.repository;

import kz.edu.sms.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByDueDateAscCreatedAtDesc(Long userId);
    List<Task> findByUserIdAndStatusOrderByDueDateAsc(Long userId, Task.TaskStatus status);
}
