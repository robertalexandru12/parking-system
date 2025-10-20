package me.robert.parkingsystem.settings;

public interface ISettingsService {
    Settings getSettings();
    void updatePrice(double price);
    void updateNrOfParkingSpots(int nrOfParkingSpots);
    void addSettings(Settings settings);
}
