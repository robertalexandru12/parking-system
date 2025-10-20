package me.robert.parkingsystem.parkingspot;

import jakarta.persistence.*;

@Entity
@Table(name = "parkingspot")

public class ParkingSpot {
    @Id
    @SequenceGenerator(
            name = "parkingspot_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "parkingspot_sequence",
            strategy = GenerationType.SEQUENCE
    )
    private Long id;
    private String name;
    private boolean inUse;
    private Long joinTime;
    private String orientation;

    public ParkingSpot() {}
    public ParkingSpot(String name, boolean inUse, Long joinTime, String orientation) {
        this.name = name;
        this.inUse = inUse;
        this.joinTime = joinTime;
        this.orientation = orientation;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public boolean isInUse() {
        return inUse;
    }
    public void setInUse(boolean inUse) {
        this.inUse = inUse;
    }
    public Long getJoinTime() {
        return joinTime;
    }
    public void setJoinTime(Long joinTime) {
        this.joinTime = joinTime;
    }
    public String getOrientation() {
        return orientation;
    }
    public void setOrientation(String orientation) {
        this.orientation = orientation;
    }
}
