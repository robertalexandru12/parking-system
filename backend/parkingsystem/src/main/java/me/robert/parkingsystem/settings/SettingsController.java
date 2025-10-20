package me.robert.parkingsystem.settings;

import org.springframework.web.bind.annotation.*;

@RequestMapping(path = "api/v1/settings")
@CrossOrigin(origins = "*")
@RestController
public class SettingsController {
    SettingsService settingsService;
    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping(path = "get")
    public Settings getMainSetting() {
        return settingsService.getSettings();
    }
    @PostMapping(path = "add")
    public void addSetting(@RequestBody Settings settings) {
        settingsService.addSettings(settings);
    }
    @PutMapping(path = "updateprice/{price}")
    public void updatePrice(@PathVariable double price) {
        settingsService.updatePrice(price);
    }
    @PutMapping(path = "updatemaxnrofspots/{nr}")
    public void updateMaxNrofSpots(@PathVariable int nr) {
        settingsService.updateNrOfParkingSpots(nr);
    }
}
