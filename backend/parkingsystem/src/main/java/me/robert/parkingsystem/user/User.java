package me.robert.parkingsystem.user;

import jakarta.persistence.*;

@Entity
@Table(name = "users")

public class User {

    @Id
    @SequenceGenerator(
            name = "users_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "users_sequence",
            strategy = GenerationType.SEQUENCE
    )
    private Long id;
    private String password;
    private String email;
    private String lastname;
    private String firstname;

    public User() {}
    public User(String password, String email, String lastname, String firstname) {
        this.password = password;
        this.email = email;
        this.lastname = lastname;
        this.firstname = firstname;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getLastname() {
        return lastname;
    }
    public void setLastname(String lastname) {
        this.lastname = lastname;
    }
    public String getFirstname() {
        return firstname;
    }
    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }
}
