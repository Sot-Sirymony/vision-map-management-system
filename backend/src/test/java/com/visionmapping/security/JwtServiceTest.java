package com.visionmapping.security;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

/**
 * Covers the JWT secret fail-fast guard: the built-in development default must be rejected
 * outside the local/test profiles, and a missing/blank secret must always be rejected.
 */
@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private static final String DEFAULT_SECRET = "vision-mapping-development-secret-key-change-before-production";
    private static final String REAL_SECRET = "a-sufficiently-long-and-unique-production-jwt-secret-value";

    @Mock private Environment environment;

    @Test
    void defaultSecretIsAllowedOnLocalProfile() {
        when(environment.getActiveProfiles()).thenReturn(new String[] {"local"});
        new JwtService(DEFAULT_SECRET, 1440, environment);
    }

    @Test
    void defaultSecretIsAllowedOnTestProfile() {
        when(environment.getActiveProfiles()).thenReturn(new String[] {"test"});
        new JwtService(DEFAULT_SECRET, 1440, environment);
    }

    @Test
    void defaultSecretIsRejectedWithNoActiveProfile() {
        when(environment.getActiveProfiles()).thenReturn(new String[] {});
        assertThatThrownBy(() -> new JwtService(DEFAULT_SECRET, 1440, environment))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("built-in development default");
    }

    @Test
    void defaultSecretIsRejectedOnAnyOtherProfile() {
        when(environment.getActiveProfiles()).thenReturn(new String[] {"prod"});
        assertThatThrownBy(() -> new JwtService(DEFAULT_SECRET, 1440, environment))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("built-in development default");
    }

    @Test
    void realSecretIsAcceptedOnNonDevProfile() {
        when(environment.getActiveProfiles()).thenReturn(new String[] {"prod"});
        new JwtService(REAL_SECRET, 1440, environment);
    }

    @Test
    void blankSecretIsAlwaysRejected() {
        assertThatThrownBy(() -> new JwtService("   ", 1440, environment))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must be set");
    }

    @Test
    void nullSecretIsAlwaysRejected() {
        assertThatThrownBy(() -> new JwtService(null, 1440, environment))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must be set");
    }
}
