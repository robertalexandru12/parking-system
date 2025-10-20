package me.robert.parkingsystem.parkingspot;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RequestMapping(path = "api/v1/parkingspot")
@CrossOrigin(origins = "*")
@RestController
public class ParkingSpotController {
    ParkingSpotService parkingSpotService;
    public ParkingSpotController(ParkingSpotService parkingSpotService) {
        this.parkingSpotService = parkingSpotService;
    }
    @GetMapping(path = "allspots")
    public List<ParkingSpot> getAllParkingSpots() {
        return parkingSpotService.getAllParkingSpots();
    }
    @PostMapping(path = "addspot")
    public void addParkingSpot(@RequestBody ParkingSpot parkingSpot) {
        parkingSpotService.addParkingSpot(parkingSpot);
    }
    @PutMapping(path = "updatespotstatus")
    public void updateStatusSpot(@RequestBody Map<String, String> request) {
        parkingSpotService.updateParkingSpotOccupied(request.get("name"), Boolean.parseBoolean(request.get("isUsed")));
    }
    @DeleteMapping(path= "delete/{id}")
    public void deleteParkingSpot(@PathVariable Long id) {
        parkingSpotService.deleteParkingSpot(id);
    }
    @GetMapping(path = "getnrofoccupiedspots")
    public Integer getNrOfOccupiedSpots() {
        return parkingSpotService.getNumberOfParkingSpotsOccupied();
    }
    @GetMapping(path = "getnrofspots")
    public Integer getNrOfSpots() {
        return parkingSpotService.getNumberOfParkingSpots();
    }
}
