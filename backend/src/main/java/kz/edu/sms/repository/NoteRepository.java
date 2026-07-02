package kz.edu.sms.repository;

import kz.edu.sms.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserIdOrderByPinnedDescUpdatedAtDesc(Long userId);

    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND " +
           "(LOWER(n.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(n.content) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Note> search(Long userId, String q);
}
