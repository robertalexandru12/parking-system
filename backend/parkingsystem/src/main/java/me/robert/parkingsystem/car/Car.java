package me.robert.parkingsystem.car;

import jakarta.persistence.*;

@Entity
@Table(name = "cars")

public class Car {

    @Id
    @SequenceGenerator(
            name = "car_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "car_sequence",
            strategy = GenerationType.SEQUENCE
    )
    private Long id;
    private String licensePlate;
    private Long joinTime;
    private Long leftTime;
    private Long durationTime;
    private String ownerName;
    private double parkingFee;

    public Car(){
    }
    public Car(String licensePlate, Long joinTime, Long leftTime, Long durationTime, String ownerName, double parkingFee) {
        this.licensePlate = licensePlate;
        this.joinTime = joinTime;
        this.leftTime = leftTime;
        this.durationTime = durationTime;
        this.ownerName = ownerName;
        this.parkingFee = parkingFee;
    }

    public Long getId() {
        return id;
    }
    public String getLicensePlate() {
        return licensePlate;
    }
    public Long getJoinTime() {
        return joinTime;
    }
    public Long getLeftTime() {
        return leftTime;
    }
    public Long getDurationTime() {
        return durationTime;
    }
    public String getOwnerName() {
        return ownerName;
    }


    public void setId(Long id) {
        this.id = id;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public void setJoinTime(Long joinTime) {
        this.joinTime = joinTime;
    }
    public void setLeftTime(Long leftTime) {
        this.leftTime = leftTime;
    }
    public void setDurationTime(Long durationTime) {
        this.durationTime = durationTime;
    }
    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public double getParkingFee() {
        return parkingFee;
    }

    public void setParkingFee(double parkingFee) {
        this.parkingFee = parkingFee;
    }
}
