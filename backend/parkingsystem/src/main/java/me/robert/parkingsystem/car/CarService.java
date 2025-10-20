package me.robert.parkingsystem.car;

import me.robert.parkingsystem.settings.SettingsService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CarService implements ICarService {
    private final CarRepository carRepository;
    private final SettingsService settingsService;
    public CarService(CarRepository carRepository, SettingsService settingsService) {
        this.carRepository = carRepository;
        this.settingsService =  settingsService;
    }
    public List<Car> getCars() {
        return carRepository.findAll();
    }
    @Override
    public void createCar(Car car) {
        car.setDurationTime(car.getLeftTime()-car.getJoinTime());
        car.setParkingFee((int)((double) car.getDurationTime() /3600+1) * settingsService.getSettings().getPrice());
       carRepository.save(car);
    }

    @Override
    public void updateCar(Long id, Car car) {
        Car carToUpdate = carRepository.findById(id).orElseThrow(
                () -> new IllegalArgumentException(String.format("Masina cu id-ul %d nu exista", id))
        );
        carToUpdate.setLicensePlate(car.getLicensePlate());
        carToUpdate.setJoinTime(car.getJoinTime());
        carToUpdate.setLeftTime(car.getLeftTime());
        carToUpdate.setDurationTime(car.getLeftTime()-car.getJoinTime());
        carToUpdate.setOwnerName(car.getOwnerName());
        carRepository.save(carToUpdate);
    }

    @Override
    public void deleteCar(Long id) {
        boolean exists = carRepository.existsById(id);
        if (exists) {
            carRepository.deleteById(id);
        }
        else {
            throw new IllegalArgumentException("Masina cu id-ul %d nu exista");
        }
    }

    @Override
    public List<Car> getCarByLicensePlate(String licensePlate) {
        return carRepository.findByLicensePlate(licensePlate).orElseThrow(
                () -> new IllegalArgumentException(String.format("Nu exista masina cu nr. de inmatriculare ", licensePlate))
        );
    }

    @Override
    public int getNumberOfCars() {
        return carRepository.countAllParkedCars();
    }

    @Override
    public int getNumberOfCarsMonth() {
        return carRepository.countThisMonthParkedCars();
    }

    @Override
    public int getNumberOfCarsToday() {
        return carRepository.countTodayParkedCars();
    }

    @Override
    public Map<String, Integer> getMonthlyStats() {
        List<Map<String, Object>> dbResults = carRepository.findMonthlyStatsThisYear();

        Map<String, Integer> existingStats = dbResults.stream()
                .collect(Collectors.toMap(
                        entry -> (String) entry.get("month"),
                        entry -> ((Number) entry.get("count")).intValue()
                ));
        String[] luniRomana = {
                "January", "February", "March", "April", "May", "June",
                "July", "August",
                "September", "October", "November", "December"
        };

        int currentMonth = LocalDate.now().getMonthValue();

        Map<String, Integer> completeStats = new LinkedHashMap<>();

        for (int i = 0; i < currentMonth; i++) {
            String luna = luniRomana[i];
            completeStats.put(luna, existingStats.getOrDefault(luna, 0));
        }

        return completeStats;
    }

    @Override
    public Map<Integer, Integer> getDailyStats() {
        List<Map<Integer, Object>> dbResults = carRepository.findDaysThisMonth();

        Map<Integer, Integer> existingStats = dbResults.stream()
                .collect(Collectors.toMap(
                        entry -> ((Number) entry.get("day")).intValue(),
                        entry -> ((Number) entry.get("count")).intValue()
                ));
        int currentDay = LocalDate.now().getDayOfMonth();
        Map<Integer, Integer> completeStats = new LinkedHashMap<>();
        for (int i = 0; i < currentDay; i++) {
            completeStats.put(i+1, existingStats.getOrDefault(i+1, 0));
        }

        return completeStats;
    }
    @Override
    public Map<String, Integer> getWeeklyStats() {
        List<Map<String, Object>> dbResults = carRepository.findDaysOfWeek();

        Map<String, Integer> existingStats = dbResults.stream()
                .collect(Collectors.toMap(
                        entry -> (String) entry.get("day_name"),
                        entry -> ((Number) entry.get("count")).intValue()
                ));

        String[] zile = {
                "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata",
                "Duminica"
        };
        int currentDay = LocalDate.now().getDayOfWeek().getValue();


        Map<String, Integer> completeStats = new LinkedHashMap<>();

        for (int i = 0; i < currentDay; i++) {
            completeStats.put(zile[i], existingStats.getOrDefault(zile[i], 0));
        }

        return completeStats;
    }

}
