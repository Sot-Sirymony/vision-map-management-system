package com.visionmapping.util;

import com.visionmapping.entity.AppUser;
import com.visionmapping.exception.ResourceNotFoundException;
import com.visionmapping.repository.AppUserRepository;
import com.visionmapping.security.AppUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class UserScope {

    private final AppUserRepository appUserRepository;

    @Transactional(readOnly = true)
    public AppUser currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            throw new ResourceNotFoundException("Authenticated user not found.");
        }

        return appUserRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found."));
    }
}
