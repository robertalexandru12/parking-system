package me.robert.parkingsystem.car;

import java.util.List;
import java.util.Map;

public interface ICarService {
    List<Car> getCars();
    void createCar(Car car);
    void updateCar(Long id, Car car);
    void deleteCar(Long id);
    List<Car> getCarByLicensePlate(String licensePlate);
    int getNumberOfCars();
    int getNumberOfCarsMonth();
    int getNumberOfCarsToday();
    Map<String, Integer> getMonthlyStats();
    Map<Integer, Integer> getDailyStats();
    Map<String, Integer> getWeeklyStats();
}
