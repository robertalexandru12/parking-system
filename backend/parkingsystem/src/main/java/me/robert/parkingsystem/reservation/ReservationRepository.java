package me.robert.parkingsystem.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByLicensePlate(String licensePlate);

    @Query("""
    SELECT COUNT(r)
    FROM Reservation r
    WHERE 
        (r.isExpired = false)
        OR
        (r.isExpired = true AND r.entryTime != 0 AND r.leftTime = 0)
""")
    Integer getNrOfActiveReservations(@Param("currentTime") long currentTime);
}
