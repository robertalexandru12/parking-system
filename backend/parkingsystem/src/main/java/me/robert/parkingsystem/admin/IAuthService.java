package me.robert.parkingsystem.admin;

import java.util.List;

public interface IAuthService {
    void createAdmin(Admin admin);
    void deleteAdmin(Long id);
    void updateAdmin(Long id, Admin admin);
    Admin getAdminByUsername(String username);
    Admin getAdmin(Long id);
    List<Admin> getAdmins();
}
