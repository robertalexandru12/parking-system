package me.robert.parkingsystem.admin;

import me.robert.parkingsystem.user.User;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service

public class AuthService implements IAuthService {
    private final PasswordEncoder passwordEncoder;
    private final AdminRepository adminRepository;

    public AuthService(PasswordEncoder passwordEncoder, AdminRepository adminRepository) {
        this.passwordEncoder = passwordEncoder;
        this.adminRepository = adminRepository;
    }

    @Override
    public void createAdmin(Admin admin) {
        for(Admin a : adminRepository.findAll()) {
            if(a.getUsername().equals(admin.getUsername())) {
                throw new IllegalArgumentException(String.format("Administratorul cu username-ul %s exista deja!", admin.getUsername()));
            }
            if(a.getEmail().equals(admin.getEmail())) {
                throw new IllegalArgumentException(String.format("Administratorul cu email-ul %s exista deja!", admin.getEmail()));
            }
        }
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        adminRepository.save(admin);
    }

    @Override
    public void deleteAdmin(Long id) {
        boolean exists = adminRepository.existsById(Math.toIntExact(id));
        if (exists) {
            adminRepository.deleteById(Math.toIntExact(id));
        }
        else{
            throw new IllegalArgumentException(String.format("Adminul cu id-ul %s nu exista!", id));
        }
    }

    @Override
    public void updateAdmin(Long id, Admin admin) {
        Admin adminToUpdate = adminRepository.findById(Math.toIntExact(id)).orElseThrow(
                () -> new IllegalArgumentException(String.format("Adminul cu id-ul %s nu exista!", id))
        );
        adminToUpdate.setEmail(admin.getEmail());
        adminToUpdate.setFirstname(admin.getFirstname());
        adminToUpdate.setLastname(admin.getLastname());
        adminToUpdate.setPassword(passwordEncoder.encode(admin.getPassword()));
        adminToUpdate.setUsername(admin.getUsername());
        adminRepository.save(adminToUpdate);
    }

    @Override
    public Admin getAdmin(Long id) {
        return adminRepository.findById(Math.toIntExact(id)).orElseThrow(
                () -> new IllegalArgumentException(String.format("Adminul cu id-ul %s nu exista!", id))
        );
    }

    @Override
    public List<Admin> getAdmins() {
        return adminRepository.findAll();
    }
    public boolean validateAuthentication(String username, String password) {
        Optional<Admin> admin = adminRepository.findByUsername(username);
        return admin.filter(value -> passwordEncoder.matches(password, value.getPassword())).isPresent();
    }
    @Override
    public Admin getAdminByUsername(String username) {
        return adminRepository.findByUsername(username).orElseThrow(
                () -> new IllegalArgumentException(String.format("User-ul cu email-ul %s nu exista!", username))
        );
    }
}
