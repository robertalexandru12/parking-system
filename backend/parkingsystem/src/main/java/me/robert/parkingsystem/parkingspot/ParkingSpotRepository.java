package me.robert.parkingsystem.parkingspot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    @Query("SELECT COUNT(p) FROM ParkingSpot p")
    int nrOfParkingSpots();
    @Query("SELECT COUNT(*) FROM ParkingSpot p WHERE p.inUse = true")
    int nrOfParkingSpotsOccupied();
    ParkingSpot getParkingSpotByName(String name);
}
