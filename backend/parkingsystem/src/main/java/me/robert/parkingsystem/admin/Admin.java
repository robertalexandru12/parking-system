package me.robert.parkingsystem.admin;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")

public class Admin {

    @Id
    @SequenceGenerator(
            name = "admin_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "admin_sequence",
            strategy = GenerationType.SEQUENCE
    )
    private Long id;
    private String username;
    private String password;
    private String email;
    private String lastname;
    private String firstname;

    public Admin(){}
    public Admin(String username, String password, String email, String lastname, String firstname) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.lastname = lastname;
        this.firstname = firstname;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getUsername() {
        return username;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getPassword() {
        return password;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getEmail() {
        return email;
    }
    public void setLastname(String lastname) {
        this.lastname = lastname;
    }
    public String getLastname() {
        return lastname;
    }
    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }
    public String getFirstname() {
        return firstname;
    }
}
