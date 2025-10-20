package me.robert.parkingsystem.user;

import java.util.List;

public interface IUserService {
    boolean addUser(User user);
    List<User> getUsers();
    User getUser(Long id);
    User getUserByEmail(String email);
    boolean validateAuthentication(String email, String password);
    void updateUser(User user);
    void updatePassword(String email,String oldPassword, String newPassword);
}
