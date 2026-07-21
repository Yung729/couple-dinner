package com.coupledinner.repository;

import com.coupledinner.entity.Couple;
import com.coupledinner.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface CoupleRepository extends JpaRepository<Couple, UUID> {
    Optional<Couple> findByInviteCode(String inviteCode);
    Optional<Couple> findByUser1OrUser2(User user1, User user2);

    @Query("SELECT c FROM Couple c WHERE c.user1 = :user OR c.user2 = :user")
    Optional<Couple> findByUser(User user);
}
