package me.robert.parkingsystem.reservation;

import java.util.List;

public interface IReservationService {
    void addReservation(Reservation reservationm, Long user_id);
    List<Reservation> getReservations();
    Reservation getReservationById(Long id);
    List<Reservation> findByUserId(Long userId);
    Reservation verifyReservation(String licensePlate);
    Integer getNrOfActiveReservations(Long currentTime);
    Reservation updateReservation(Reservation reservation, Long user_id);
    Reservation leftReservation(String licensePlate);

}
