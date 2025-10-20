package me.robert.parkingsystem.reservation;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "api/v1/reservation")
public class ReservationController {
    ReservationService reservationService;
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }
    @GetMapping(path = "allreservations")
    public List<Reservation> getAllReservations() {
        return reservationService.getReservations();
    }
    @PostMapping(path = "add/{userid}")
    public void addReservation(@PathVariable Long userid, @RequestBody Reservation reservation) {

        reservationService.addReservation(reservation, userid);
    }
    @PutMapping(path = "update/{id}")
    public Reservation updateReservation(@PathVariable Long id, @RequestBody Reservation reservation) {
        return reservationService.updateReservation(reservation, id);
    }
    @PutMapping(path = "left/{licensePlate}")
    public Reservation leftReservation(@PathVariable String licensePlate) {
        return reservationService.leftReservation(licensePlate);
    }
    @GetMapping(path = "get/{userid}")
    public List<Reservation> getReservation(@PathVariable Long userid) {
        return reservationService.findByUserId(userid);
    }
    @GetMapping(path = "verifyreservation/{licensePlate}")
    public Reservation verifyReservation(@PathVariable String licensePlate) {
        return reservationService.verifyReservation(licensePlate);
    }
    @GetMapping(path = "nrofactivereservations")
    public Integer getReservations() {
        System.out.println(reservationService.getNrOfActiveReservations(System.currentTimeMillis()));
        return reservationService.getNrOfActiveReservations(System.currentTimeMillis());
    }
}
