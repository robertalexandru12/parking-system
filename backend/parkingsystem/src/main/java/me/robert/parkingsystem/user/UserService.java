package me.robert.parkingsystem.user;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements IUserService {
    UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    @Override
    public boolean addUser(User user) {
        for(User a : userRepository.findAll()) {
            if(a.getEmail().equals(user.getEmail())) {
                return false;
            }
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return true;
    }
    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUser(Long id) {
        return userRepository.findById((long) Math.toIntExact(id)).orElseThrow(
                () -> new IllegalArgumentException(String.format("User-ul cu id-ul %s nu exista!", id))
        );
    }
    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new IllegalArgumentException(String.format("User-ul cu email-ul %s nu exista!", email))
        );
    }

    @Override
    public boolean validateAuthentication(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.filter(value -> passwordEncoder.matches(password, value.getPassword())).isPresent();
    }
    @Override
    public void updateUser(User user) {

    }
    @Override
    public void updatePassword(String email, String oldPassword, String newPassword) {
        Optional<User> user = userRepository.findByEmail(email);
        if(user.filter(value -> passwordEncoder.matches(oldPassword, value.getPassword())).isPresent()){
            user.get().setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user.get());
        }
        else throw new IllegalArgumentException("Parola curentă este incorectă");
    }
}
