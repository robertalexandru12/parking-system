package me.robert.parkingsystem.reservation;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import me.robert.parkingsystem.user.User;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @SequenceGenerator(
            name = "reservations_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "reservations_sequence",
            strategy = GenerationType.SEQUENCE
    )
    private Long id;

    private String licensePlate;
    private Long reservationTime;
    private Long expirationTime;
    private Long entryTime;
    private long leftTime;
    private boolean isExpired;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "reservations"})
    private User user;

    public Reservation() {
        this.leftTime = 0L;
        this.isExpired = false;
        entryTime = 0L;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getReservationTime() { return reservationTime; }
    public void setReservationTime(Long reservationTime) { this.reservationTime = reservationTime; }
    public Long getExpirationTime() { return expirationTime; }
    public void setExpirationTime(Long expirationTime) { this.expirationTime = expirationTime; }
    public Long getEntryTime() { return entryTime; }
    public void setEntryTime(Long entryTime) { this.entryTime = entryTime; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public long getLeftTime() {
        return leftTime;
    }
    public void setLeftTime(long leftTime) {
        this.leftTime = leftTime;
    }
    public boolean isExpired() {
        return isExpired;
    }
    public void setExpired(boolean expired) {
        isExpired = expired;
    }
}
