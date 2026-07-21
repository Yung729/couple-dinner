package com.coupledinner.security;

import com.coupledinner.entity.User;
import com.coupledinner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user;
        // JWT passes userId (UUID string); try UUID first
        try {
            java.util.UUID uuid = java.util.UUID.fromString(identifier);
            user = userRepository.findById(uuid)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));
        } catch (IllegalArgumentException e) {
            // Fall back to email lookup
            user = userRepository.findByEmail(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));
        }

        return new org.springframework.security.core.userdetails.User(
            user.getId().toString(),
            user.getPasswordHash(),
            Collections.emptyList()
        );
    }
}
