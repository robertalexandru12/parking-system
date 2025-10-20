package me.robert.parkingsystem.reservation;

import me.robert.parkingsystem.parkingspot.ParkingSpotService;
import me.robert.parkingsystem.user.User;
import me.robert.parkingsystem.user.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReservationService implements IReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final ParkingSpotService parkingSpotService;

    public ReservationService(ReservationRepository reservationRepository,
                              UserRepository userRepository, ParkingSpotService parkingSpotService) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.parkingSpotService = parkingSpotService;
    }
    @Override
    public void addReservation(Reservation reservation, Long user_id) {
        List<Reservation> reservations = reservationRepository.findByUserId(user_id);
        for(Reservation reservation1 : reservations) {
            if(!reservation1.isExpired() || (reservation1.getEntryTime()!=0 && reservation1.getLeftTime()==0)) {
                throw new IllegalArgumentException("Rezervarea este in curs");
            }
        }
        System.out.println(parkingSpotService.getNumberOfParkingSpotsOccupied() + " " +  reservationRepository.getNrOfActiveReservations(System.currentTimeMillis()) + " " + parkingSpotService.getNumberOfParkingSpots());
        if(parkingSpotService.getNumberOfParkingSpotsOccupied() + reservationRepository.getNrOfActiveReservations(System.currentTimeMillis()) >= parkingSpotService.getNumberOfParkingSpots()){
            throw new IllegalArgumentException("Parcarea este plina");
        }
        User user = userRepository.findById(user_id)
                .orElseThrow(() -> new IllegalArgumentException("Utilizatr invalid"));
        reservation.setUser(user);
        reservation.setExpirationTime(System.currentTimeMillis() + 600000L);
        reservation.setReservationTime(System.currentTimeMillis());

        reservationRepository.save(reservation);
    }
    @Override
    public List<Reservation> getReservations() {
        return reservationRepository.findAll().reversed();
    }
    @Override
    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nu exista aceasta rezervare"));
    }
    @Override
    public List<Reservation> findByUserId(Long userId) {
        List<Reservation> reservations = reservationRepository.findByUserId(userId);
        for(Reservation reservation : reservations) {
            if(!reservation.isExpired() && reservation.getExpirationTime()<System.currentTimeMillis()) {
                reservation.setExpired(true);
                reservationRepository.save(reservation);
            }
        }
        return reservations;
    }
    @Override
    public Reservation verifyReservation(String licensePlate) {
        List<Reservation> verifications = reservationRepository.findByLicensePlate(licensePlate);
        Reservation res = new Reservation();
        for(Reservation reservation : verifications) {
            if(reservation.getExpirationTime()>System.currentTimeMillis() && reservation.getEntryTime()==0) {
                return reservation;
            }
            else {
                reservation.setExpired(true);
                reservationRepository.save(reservation);
            }
        }
        return null;
    }
    @Override
    public Integer getNrOfActiveReservations(Long currentTime) {
        return reservationRepository.getNrOfActiveReservations(currentTime);
    }
    @Override
    public Reservation updateReservation(Reservation reservation, Long user_id) {
        Reservation reservation1 = reservationRepository.findById((long) Math.toIntExact(reservation.getId())).orElseThrow(
                () -> new IllegalArgumentException(String.format("Rezervarea cu id-ul %s nu exista!", reservation.getId()))
        );
        if(reservation.getEntryTime()==0) {
            reservation1.setEntryTime(System.currentTimeMillis());
            reservation1.setExpired(true);
        }
        else if (reservation.getEntryTime()!=0 && reservation.getLeftTime()==0) {
            reservation1.setLeftTime(System.currentTimeMillis());
            reservation1.setExpired(true);
        }
        reservationRepository.save(reservation1);
        return reservation1;
    }
    @Override
    public Reservation leftReservation(String licensePlate) {
        List<Reservation> reservation = reservationRepository.findByLicensePlate(licensePlate);
        for(Reservation reservation1 : reservation) {
            if(reservation1.getEntryTime()!=0 && reservation1.getLeftTime()==0) {
                reservation1.setLeftTime(System.currentTimeMillis());
                reservation1.setExpired(true);
                reservationRepository.save(reservation1);
                return reservation1;
            }
        }
        return null;
    }
}
