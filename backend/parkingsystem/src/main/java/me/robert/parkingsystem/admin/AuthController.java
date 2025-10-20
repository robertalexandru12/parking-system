package me.robert.parkingsystem.admin;


import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/admin-auth")
@CrossOrigin(origins = "*")

public class AuthController {
    private final AuthService authService;

    public AuthController(AuthenticationManager authenticationManager, AuthService authService) {
        this.authService = authService;
    }
    @PostMapping(path = "register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Admin admin) {
        authService.createAdmin(admin);
        Map<String, String> response = new HashMap<>();
        response.put("id", admin.getId().toString());
        response.put("email", admin.getEmail());
        response.put("username", admin.getUsername());
        response.put("firstname", admin.getFirstname());
        response.put("lastname", admin.getLastname());
        return ResponseEntity.ok(response);
    }
    @PostMapping (path = "/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> request){
        if(authService.validateAuthentication(request.get("username"), request.get("password"))){
            return ResponseEntity.ok("[INFO] Adminul a fost logat");
        }
        else return ResponseEntity.status(401).body("[ERROR] Invalid username or password");
    }

    @GetMapping(path = "profile/{username}")
    public Admin getProfile(@PathVariable String username) {
        Admin admin = authService.getAdminByUsername(username);
        admin.setPassword(null);
        return admin;
    }
    @GetMapping (path = "admins")
    public List<Admin> getAdmins(){
        return authService.getAdmins();
    }
    @DeleteMapping(path = "admins/delete/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long id) {
        authService.deleteAdmin(id);
        return ResponseEntity.ok("[INFO] Adminul a fost șters");
    }
    @PutMapping(path = "admins/{id}")
    public ResponseEntity<String> updateAdmin(@PathVariable Long id, @RequestBody Admin admin) {
        authService.updateAdmin(id, admin);
        return ResponseEntity.ok("[INFO] Adminul a fost actualizat");
    }
}
