package me.robert.parkingsystem.user;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping(path = "api/v1/user")
@CrossOrigin(origins = "*")
@RestController

public class UserController {
    UserService userService;
    private final AuthenticationManager authenticationManager;
    public UserController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }
    @PostMapping(path = "register")
    public ResponseEntity<String>  register(@RequestBody User user) {
        if(userService.addUser(user)){
            return ResponseEntity.ok("[INFO] Utilizatorul a fost inregistrat!");
        }
        else  return ResponseEntity.status(401).body("[EROARE] Email-ul exista deja");
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.get("email"), request.get("password"))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            return ResponseEntity.ok("Autentificare reușita");
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email sau parola incorecte");
        }
    }
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            Object principal = auth.getPrincipal();

            if (principal instanceof org.springframework.security.core.userdetails.User) {
                org.springframework.security.core.userdetails.User userDetails =
                        (org.springframework.security.core.userdetails.User) principal;
                User userDto = new User();
                userDto.setEmail(userDetails.getUsername());
                userDto.setFirstname("");
                userDto.setLastname("");
                return ResponseEntity.ok(userDto);
            } else {
                return ResponseEntity.ok(principal);
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nu ești autentificat");
        }
    }

    @GetMapping(path = "profile/{email}")
    public User getProfile(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        user.setPassword(null);
        return userService.getUserByEmail(email);
    }
    @GetMapping(path = "users")
    public List<User> getUsers() {
        return userService.getUsers();
    }
    @PutMapping(path = "updatepassword")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        System.out.println(request.get("email") + " " + request.get("currentPassword") + " " + request.get("newPassword"));
        try {
            userService.updatePassword(request.get("email"), request.get("currentPassword"), request.get("newPassword"));
            return ResponseEntity.ok("Parola a fost schimbata cu succes.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

}
