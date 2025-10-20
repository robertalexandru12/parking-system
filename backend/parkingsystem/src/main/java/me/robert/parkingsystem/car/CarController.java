package me.robert.parkingsystem.car;

import me.robert.parkingsystem.settings.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping(path = "api/v1/cars")
@CrossOrigin(origins = "*")
@RestController
public class CarController {
    private final CarService carService;

    public CarController(CarService carService, SettingsService settingsService) {
        this.carService = carService;
    }

    @GetMapping (path = "list")
    public List<Car> getCars() {
        carService.getWeeklyStats().forEach((day_name, count) ->
                System.out.println(day_name + ": " + count)
        );
        return carService.getCars();
    }
    @GetMapping (path = "get/{licensePlate}")
    public List<Car> getCar(@PathVariable String licensePlate) {
        return carService.getCarByLicensePlate(licensePlate);
    }
    @PostMapping(path = "add")
    public void createCar(@RequestBody Car car){
        carService.createCar(car);
    }
    @PutMapping(path = "update/{id}")
    public void updateCar(@PathVariable Long id, @RequestBody Car car){
        carService.updateCar(id, car);
    }
    @DeleteMapping(path = "delete/{id}")
    public void deleteCar(@PathVariable Long id){
        carService.deleteCar(id);
    }
    @PostMapping(path = "addcars")
    public ResponseEntity<String> addMultipleCars(@RequestBody List<Car> cars){
        System.out.println("Dimensiunea este " + cars.size());
        for (Car car : cars) {
            carService.createCar(car);
        }
        return ResponseEntity.ok("OK");
    }
    @GetMapping(path = "statistic_total")
    public Map<String, Integer> getStatisticTotal(){
        Map<String, Integer> map = new HashMap<>();
        map.put("total", carService.getNumberOfCars());
        map.put("month", carService.getNumberOfCarsMonth());
        map.put("today", carService.getNumberOfCarsToday());
        return map;
    }
    @GetMapping(path = "statistic_year")
    public Map<String, Integer> getStatisticYear(){
        return carService.getMonthlyStats();
    }
    @GetMapping(path = "statistic_month")
    public Map<Integer, Integer> getStatisticMonth(){
        return carService.getDailyStats();
    }

    @GetMapping(path = "statistic_week")
    public Map<String, Integer> getStatisticWeek(){
        return carService.getWeeklyStats();
    }
}
