package me.robert.parkingsystem.settings;

import jakarta.persistence.*;

@Entity
@Table(name = "settings")
public class Settings {
    @Id
    @SequenceGenerator(
            name = "settings_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "settings_sequence",
            strategy = GenerationType.SEQUENCE
    )
    private Long id;
    private double price;
    private Integer maxNumberOfSpots;
    public Settings() {}
    public Settings(double price, Integer maxNumberOfSpots) {
        this.price = price;
        this.maxNumberOfSpots = maxNumberOfSpots;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public double getPrice() {
        return price;
    }
    public void setPrice(double price) {
        this.price = price;
    }
    public Integer getMaxNumberOfSpots() {
        return maxNumberOfSpots;
    }
    public void setMaxNumberOfSpots(Integer maxNumberOfSpots) {
        this.maxNumberOfSpots = maxNumberOfSpots;
    }
}
