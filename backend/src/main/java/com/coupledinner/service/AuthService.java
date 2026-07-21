package com.coupledinner.service;

import com.coupledinner.dto.request.JoinRequest;
import com.coupledinner.dto.request.LoginRequest;
import com.coupledinner.dto.request.RegisterRequest;
import com.coupledinner.dto.response.AuthResponse;
import com.coupledinner.dto.response.UserResponse;
import com.coupledinner.entity.Couple;
import com.coupledinner.entity.User;
import com.coupledinner.exception.BadRequestException;
import com.coupledinner.exception.ResourceNotFoundException;
import com.coupledinner.repository.CoupleRepository;
import com.coupledinner.repository.UserRepository;
import com.coupledinner.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CoupleRepository coupleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail().toLowerCase())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .build();
        userRepository.save(user);

        String inviteCode = generateInviteCode();
        Couple couple = Couple.builder()
            .inviteCode(inviteCode)
            .user1(user)
            .build();
        coupleRepository.save(couple);

        String token = tokenProvider.generateToken(user.getId());
        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .user(toUserResponse(user))
            .inviteCode(inviteCode)
            .coupleComplete(false)
            .build();
    }

    @Transactional
    public AuthResponse join(JoinRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Couple couple = coupleRepository.findByInviteCode(request.getInviteCode().toUpperCase())
            .orElseThrow(() -> new BadRequestException("Invalid invite code"));

        if (couple.isComplete()) {
            throw new BadRequestException("This couple is already complete. The invite code cannot be reused.");
        }

        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail().toLowerCase())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .build();
        userRepository.save(user);

        couple.setUser2(user);
        couple.setFormedAt(LocalDateTime.now());
        coupleRepository.save(couple);

        String token = tokenProvider.generateToken(user.getId());
        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .user(toUserResponse(user))
            .partner(toUserResponse(couple.getUser1()))
            .coupleComplete(true)
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
            .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        Couple couple = coupleRepository.findByUser(user).orElse(null);
        User partner = null;
        String inviteCode = null;
        boolean coupleComplete = false;

        if (couple != null) {
            coupleComplete = couple.isComplete();
            inviteCode = coupleComplete ? null : couple.getInviteCode();
            if (couple.getUser1() != null && !couple.getUser1().getId().equals(user.getId())) {
                partner = couple.getUser1();
            } else if (couple.getUser2() != null && !couple.getUser2().getId().equals(user.getId())) {
                partner = couple.getUser2();
            }
        }

        String token = tokenProvider.generateToken(user.getId());
        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .user(toUserResponse(user))
            .partner(partner != null ? toUserResponse(partner) : null)
            .inviteCode(inviteCode)
            .coupleComplete(coupleComplete)
            .build();
    }

    public AuthResponse getMe(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Couple couple = coupleRepository.findByUser(user).orElse(null);
        User partner = null;
        String inviteCode = null;
        boolean coupleComplete = false;

        if (couple != null) {
            coupleComplete = couple.isComplete();
            inviteCode = coupleComplete ? null : couple.getInviteCode();
            if (couple.getUser1() != null && !couple.getUser1().getId().equals(userId)) {
                partner = couple.getUser1();
            } else if (couple.getUser2() != null && !couple.getUser2().getId().equals(userId)) {
                partner = couple.getUser2();
            }
        }

        return AuthResponse.builder()
            .user(toUserResponse(user))
            .partner(partner != null ? toUserResponse(partner) : null)
            .inviteCode(inviteCode)
            .coupleComplete(coupleComplete)
            .build();
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .createdAt(user.getCreatedAt())
            .build();
    }

    private String generateInviteCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
        Random random = new Random();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
