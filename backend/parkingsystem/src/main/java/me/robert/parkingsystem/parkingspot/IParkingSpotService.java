package me.robert.parkingsystem.parkingspot;

import java.util.List;

public interface IParkingSpotService {
    void addParkingSpot(ParkingSpot parkingSpot);
    void deleteParkingSpot(Long parkingSpotId);
    void updateParkingSpot(Long parkingSpotId, ParkingSpot parkingSpot);
    List<ParkingSpot> getAllParkingSpots();
    Integer getNumberOfParkingSpots();
    Integer getNumberOfParkingSpotsOccupied();
    void updateParkingSpotOccupied(String spotName, boolean ocupied);
}
