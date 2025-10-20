package me.robert.parkingsystem.parkingspot;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingSpotService implements IParkingSpotService {
    ParkingSpotRepository parkingSpotRepository;
    public ParkingSpotService(ParkingSpotRepository parkingSpotRepository) {
        this.parkingSpotRepository = parkingSpotRepository;
    }
    @Override
    public void addParkingSpot(ParkingSpot parkingSpot) {
        parkingSpotRepository.save(parkingSpot);
    }

    @Override
    public void deleteParkingSpot(Long parkingSpotId) {
        boolean exists = parkingSpotRepository.existsById(parkingSpotId);
        if (exists) {
            parkingSpotRepository.deleteById(parkingSpotId);
        }
        else {
            throw new IllegalArgumentException("Locul de parcare cu id-ul " + parkingSpotId + " nu exista");
        }
    }
    @Override
    public void updateParkingSpot(Long parkingSpotId, ParkingSpot parkingSpot) {
        ParkingSpot parkingSpot1 = parkingSpotRepository.findById(parkingSpotId).orElseThrow(
                () -> new IllegalArgumentException(String.format("Parcarea cu ID-ul %d nu exsta", parkingSpotId))
        );
        parkingSpot1.setName(parkingSpot.getName());
        parkingSpot1.setJoinTime(parkingSpot.getJoinTime());
        parkingSpot1.setInUse(parkingSpot1.isInUse());
        parkingSpotRepository.save(parkingSpot1);
    }

    @Override
    public List<ParkingSpot> getAllParkingSpots() {
        return parkingSpotRepository.findAll();
    }

    @Override
    public Integer getNumberOfParkingSpots() {
        return parkingSpotRepository.nrOfParkingSpots();
    }
    @Override
    public Integer getNumberOfParkingSpotsOccupied() {
        return parkingSpotRepository.nrOfParkingSpotsOccupied();
    }
    @Override
    public void updateParkingSpotOccupied(String spotName, boolean ocupied) {
        ParkingSpot parkingSpot = parkingSpotRepository.getParkingSpotByName(spotName);
        parkingSpot.setInUse(ocupied);
        parkingSpot.setJoinTime(System.currentTimeMillis()/1000);
        parkingSpotRepository.save(parkingSpot);

    }
}
