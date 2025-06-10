package com.btec.gomoku_game.controllers;

import com.btec.gomoku_game.entities.Admin;
import com.btec.gomoku_game.entities.User;
import com.btec.gomoku_game.repositories.AdminRepository;
import com.btec.gomoku_game.security.JwtUtil;
import com.btec.gomoku_game.services.AdminService;
import com.btec.gomoku_game.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;


import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Sign-up: Create a new user.
     *
     * @param user The user object containing sign-up details.
     * @return ResponseEntity with the created user.
     */
    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@RequestBody User user) {
        // Check if the email already exists
        if (userService.getUserByEmail(user.getEmail()) != null) {
            return new ResponseEntity<>("Email is already taken", HttpStatus.UNAUTHORIZED);
        }

        // Save the user with a hashed password
        User createdUser = userService.createUser(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    /**
     * Sign-in: Authenticate a user and return a JWT token.
     *
     * @param loginRequest A map containing email and password.
     * @return ResponseEntity with the JWT token or error message.
     */
    @PostMapping("/sign-in")
    public ResponseEntity<?> signIn(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // Find the user by email
        User user = userService.getUserByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        // Generate JWT token
        String token = JwtUtil.generateToken(user.getEmail());

        // Return the token
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/admin/sign-in")
    public ResponseEntity<?> adminSignIn(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Optional<Admin> adminOpt = adminService.getAdminByEmail(email);
        if (adminOpt.isPresent() && passwordEncoder.matches(password, adminOpt.get().getPassword())) {
            String token = JwtUtil.generateToken(adminOpt.get().getEmail());
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "admin");
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>("Invalid admin email or password", HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/admin/sign-up")
    public ResponseEntity<?> adminSignUp(@RequestBody Admin admin) {
        Admin createdAdmin = adminService.createAdmin(admin);
        return new ResponseEntity<>(createdAdmin, HttpStatus.CREATED);
    }


}

