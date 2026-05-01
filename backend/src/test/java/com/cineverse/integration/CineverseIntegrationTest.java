package com.cineverse.integration;

import com.cineverse.auth.dto.LoginRequest;
import com.cineverse.auth.dto.RegisterRequest;
import com.cineverse.auth.dto.TokenResponse;
import com.cineverse.common.pagination.CursorPage;
import com.cineverse.movie.dto.MovieResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers(disabledWithoutDocker = true)
class CineverseIntegrationTest {

    private static final String JWT_TEST_SECRET =
            "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void registerProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> String.valueOf(redis.getMappedPort(6379)));
        registry.add("cineverse.jwt.secret", () -> JWT_TEST_SECRET);
    }

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate restTemplate;

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    @Test
    void listMovies_returnsCursorPage() {
        ResponseEntity<CursorPage<MovieResponse>> res = restTemplate.exchange(
                baseUrl() + "/api/movies?limit=5",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<>() {
                });
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().items()).isNotEmpty();
    }

    @Test
    void register_then_login_returnsToken() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest reg = new RegisterRequest(
                "Test User",
                "user_" + suffix + "@test.local",
                "password12",
                "password12"
        );
        ResponseEntity<TokenResponse> regRes = restTemplate.postForEntity(
                baseUrl() + "/api/auth/register",
                reg,
                TokenResponse.class);
        assertThat(regRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(regRes.getBody()).isNotNull();
        assertThat(regRes.getBody().accessToken()).isNotBlank();

        LoginRequest login = new LoginRequest(reg.email(), "password12");
        ResponseEntity<TokenResponse> loginRes = restTemplate.postForEntity(
                baseUrl() + "/api/auth/login",
                login,
                TokenResponse.class);
        assertThat(loginRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginRes.getBody()).isNotNull();
        assertThat(loginRes.getBody().accessToken()).isNotBlank();
    }

    @Test
    void halls_withoutAuth_returns401Or403() {
        ResponseEntity<Void> res = restTemplate.exchange(
                baseUrl() + "/api/halls",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                Void.class);
        assertThat(res.getStatusCode()).isIn(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    @Test
    void halls_withAdminToken_returns200() {
        LoginRequest login = new LoginRequest("admin@cineverse.local", "password");
        ResponseEntity<TokenResponse> loginRes = restTemplate.postForEntity(
                baseUrl() + "/api/auth/login",
                login,
                TokenResponse.class);
        assertThat(loginRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginRes.getBody()).isNotNull();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(loginRes.getBody().accessToken());
        ResponseEntity<String> res = restTemplate.exchange(
                baseUrl() + "/api/halls",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).contains("Sala");
    }
}
