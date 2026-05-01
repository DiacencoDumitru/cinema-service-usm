package com.cineverse.user;

import com.cineverse.auth.UserPrincipal;
import com.cineverse.common.ApiException;
import com.cineverse.user.dto.ProfileResponse;
import com.cineverse.user.dto.UpdateProfileRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public ProfileResponse getProfile(UserPrincipal principal) {
        User user = userRepository.findById(principal.getUserId()).orElseThrow();
        return new ProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    @Transactional
    public ProfileResponse updateProfile(UserPrincipal principal, UpdateProfileRequest request) {
        User user = userRepository.findById(principal.getUserId()).orElseThrow();
        user.setName(request.name());
        userRepository.save(user);
        return new ProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public User requireUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
