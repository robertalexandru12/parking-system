package me.robert.parkingsystem.settings;

import org.springframework.stereotype.Service;

@Service
public class SettingsService implements ISettingsService {
    SettingsRepository settingsRepository;
    public SettingsService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }
    @Override
    public Settings getSettings() {
        return settingsRepository.findById(1L).orElseThrow(
                () -> new IllegalArgumentException("Nu s-a gasit setarea")
        );
    }
    @Override
    public void updatePrice(double price) {
        Settings setting = settingsRepository.findById(1L).orElseThrow(
                () -> new IllegalArgumentException(String.format("Nu exista aceasta setare"))
        );
        setting.setPrice(price);
        settingsRepository.save(setting);
    }
    @Override
    public void updateNrOfParkingSpots(int nrOfParkingSpots) {
        Settings setting = settingsRepository.findById(1L).orElseThrow(
                () -> new IllegalArgumentException(String.format("Nu exista aceasta setare"))
        );
        setting.setMaxNumberOfSpots(nrOfParkingSpots);
        settingsRepository.save(setting);
    }
    @Override
    public void addSettings(Settings settings) {
        settingsRepository.save(settings);
    }
}
