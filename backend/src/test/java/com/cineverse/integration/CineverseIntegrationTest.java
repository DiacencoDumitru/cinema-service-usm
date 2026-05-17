package com.cineverse.integration;

import com.cineverse.auth.dto.LoginRequest;
import com.cineverse.auth.dto.RegisterRequest;
import com.cineverse.auth.dto.TokenResponse;
import com.cineverse.booking.dto.BookingPaidResponse;
import com.cineverse.booking.dto.BookingSeatItemRequest;
import com.cineverse.booking.dto.BookingSeatSelectionRequest;
import com.cineverse.common.ErrorResponse;
import com.cineverse.common.pagination.CursorPage;
import com.cineverse.movie.dto.MovieResponse;
import com.cineverse.price.PriceCategory;
import com.cineverse.screening.dto.ScreeningScheduleRowResponse;
import com.cineverse.screening.dto.ScreeningSeatResponse;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
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
                "password12",
                LocalDate.of(2000, 1, 15)
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
    void halls_withoutAuth_returns401WithJsonBody() {
        ResponseEntity<ErrorResponse> res = restTemplate.exchange(
                baseUrl() + "/api/halls",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                ErrorResponse.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().message()).isEqualTo("Unauthorized");
    }

    @Test
    void halls_withAdminToken_returns200() {
        String token = adminToken();
        HttpHeaders headers = bearer(token);
        ResponseEntity<String> res = restTemplate.exchange(
                baseUrl() + "/api/halls",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).contains("Sala");
    }

    @Test
    void lock_then_pay_booking_succeeds() {
        String token = registerAndLogin();
        Long screeningId = findScreeningWithFreeSeat();
        Long seatId = findFreeSeat(screeningId, null);

        BookingSeatSelectionRequest lockReq = new BookingSeatSelectionRequest(
                screeningId,
                List.of(new BookingSeatItemRequest(seatId, PriceCategory.STANDARD))
        );
        ResponseEntity<Void> lockRes = restTemplate.exchange(
                baseUrl() + "/api/bookings/lock",
                HttpMethod.POST,
                new HttpEntity<>(lockReq, bearer(token)),
                Void.class);
        assertThat(lockRes.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<BookingPaidResponse> payRes = restTemplate.exchange(
                baseUrl() + "/api/bookings",
                HttpMethod.POST,
                new HttpEntity<>(lockReq, bearer(token)),
                BookingPaidResponse.class);
        assertThat(payRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(payRes.getBody()).isNotNull();
        assertThat(payRes.getBody().bookingId()).isNotNull();
        assertThat(payRes.getBody().totalPrice()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    void pay_childCategory_usesChildPrice() {
        String token = registerAndLogin();
        Long screeningId = findScreeningWithFreeSeat();
        Long seatId = findFreeSeat(screeningId, null);

        BookingSeatSelectionRequest req = new BookingSeatSelectionRequest(
                screeningId,
                List.of(new BookingSeatItemRequest(seatId, PriceCategory.CHILD))
        );
        restTemplate.exchange(
                baseUrl() + "/api/bookings/lock",
                HttpMethod.POST,
                new HttpEntity<>(req, bearer(token)),
                Void.class);

        ResponseEntity<BookingPaidResponse> payRes = restTemplate.exchange(
                baseUrl() + "/api/bookings",
                HttpMethod.POST,
                new HttpEntity<>(req, bearer(token)),
                BookingPaidResponse.class);
        assertThat(payRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(payRes.getBody()).isNotNull();
        assertThat(payRes.getBody().seats()).hasSize(1);
        assertThat(payRes.getBody().seats().get(0).price()).isEqualByComparingTo(new BigDecimal("60.00"));
    }

    @Test
    void lock_conflict_when_seat_already_locked() {
        String token1 = registerAndLogin();
        String token2 = registerAndLogin();
        Long screeningId = findScreeningWithFreeSeat();
        Long seatId = findFreeSeat(screeningId, null);

        BookingSeatSelectionRequest req = new BookingSeatSelectionRequest(
                screeningId,
                List.of(new BookingSeatItemRequest(seatId, PriceCategory.STANDARD))
        );
        ResponseEntity<Void> first = restTemplate.exchange(
                baseUrl() + "/api/bookings/lock",
                HttpMethod.POST,
                new HttpEntity<>(req, bearer(token1)),
                Void.class);
        assertThat(first.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<ErrorResponse> second = restTemplate.exchange(
                baseUrl() + "/api/bookings/lock",
                HttpMethod.POST,
                new HttpEntity<>(req, bearer(token2)),
                ErrorResponse.class);
        assertThat(second.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void birthday_discount_applied_when_eligible() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        LocalDate screeningDay = LocalDate.now().plusDays(1);
        LocalDate birthDate = screeningDay.minusYears(25);
        RegisterRequest reg = new RegisterRequest(
                "Birthday User",
                "bday_" + suffix + "@test.local",
                "password12",
                "password12",
                birthDate
        );
        ResponseEntity<TokenResponse> regRes = restTemplate.postForEntity(
                baseUrl() + "/api/auth/register", reg, TokenResponse.class);
        assertThat(regRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        String token = regRes.getBody().accessToken();

        String dateStr = screeningDay.format(DateTimeFormatter.ISO_LOCAL_DATE);
        ResponseEntity<CursorPage<ScreeningScheduleRowResponse>> schedule = restTemplate.exchange(
                baseUrl() + "/api/sessions?date=" + dateStr + "&limit=5",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<>() {
                });
        assertThat(schedule.getBody()).isNotNull();
        assertThat(schedule.getBody().items()).isNotEmpty();
        Long screeningId = schedule.getBody().items().get(0).screeningId();
        Long seatId = findFreeSeat(screeningId, null);

        BookingSeatSelectionRequest req = new BookingSeatSelectionRequest(
                screeningId,
                List.of(new BookingSeatItemRequest(seatId, PriceCategory.STANDARD))
        );
        restTemplate.exchange(
                baseUrl() + "/api/bookings/lock",
                HttpMethod.POST,
                new HttpEntity<>(req, bearer(token)),
                Void.class);

        ResponseEntity<BookingPaidResponse> payRes = restTemplate.exchange(
                baseUrl() + "/api/bookings",
                HttpMethod.POST,
                new HttpEntity<>(req, bearer(token)),
                BookingPaidResponse.class);
        assertThat(payRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(payRes.getBody()).isNotNull();
        assertThat(payRes.getBody().discountPercent()).isEqualTo(30);
        assertThat(payRes.getBody().discountAmount()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    void logout_blacklists_token() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest reg = new RegisterRequest(
                "Logout User",
                "logout_" + suffix + "@test.local",
                "password12",
                "password12",
                LocalDate.of(1990, 3, 10)
        );
        ResponseEntity<TokenResponse> regRes = restTemplate.postForEntity(
                baseUrl() + "/api/auth/register", reg, TokenResponse.class);
        String token = regRes.getBody().accessToken();
        HttpHeaders headers = bearer(token);

        ResponseEntity<Void> logout = restTemplate.exchange(
                baseUrl() + "/api/auth/logout",
                HttpMethod.POST,
                new HttpEntity<>(headers),
                Void.class);
        assertThat(logout.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<ErrorResponse> profile = restTemplate.exchange(
                baseUrl() + "/api/user/profile",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                ErrorResponse.class);
        assertThat(profile.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void cancel_booking_frees_seat() {
        String token = registerAndLogin();
        Long screeningId = findScreeningWithFreeSeat();
        Long seatId = findFreeSeat(screeningId, null);

        BookingSeatSelectionRequest req = new BookingSeatSelectionRequest(
                screeningId,
                List.of(new BookingSeatItemRequest(seatId, PriceCategory.STANDARD))
        );
        restTemplate.exchange(
                baseUrl() + "/api/bookings/lock",
                HttpMethod.POST,
                new HttpEntity<>(req, bearer(token)),
                Void.class);
        ResponseEntity<BookingPaidResponse> payRes = restTemplate.exchange(
                baseUrl() + "/api/bookings",
                HttpMethod.POST,
                new HttpEntity<>(req, bearer(token)),
                BookingPaidResponse.class);
        Long bookingId = payRes.getBody().bookingId();

        ResponseEntity<Void> cancelRes = restTemplate.exchange(
                baseUrl() + "/api/bookings/" + bookingId + "/cancel",
                HttpMethod.POST,
                new HttpEntity<>(null, bearer(token)),
                Void.class);
        assertThat(cancelRes.getStatusCode()).isEqualTo(HttpStatus.OK);

        Long seatIdAfter = findFreeSeat(screeningId, seatId);
        assertThat(seatIdAfter).isEqualTo(seatId);
    }

    private String adminToken() {
        LoginRequest login = new LoginRequest("admin@cineverse.local", "password");
        ResponseEntity<TokenResponse> loginRes = restTemplate.postForEntity(
                baseUrl() + "/api/auth/login",
                login,
                TokenResponse.class);
        assertThat(loginRes.getBody()).isNotNull();
        return loginRes.getBody().accessToken();
    }

    private String registerAndLogin() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest reg = new RegisterRequest(
                "Booking User",
                "book_" + suffix + "@test.local",
                "password12",
                "password12",
                LocalDate.of(1995, 6, 1)
        );
        ResponseEntity<TokenResponse> regRes = restTemplate.postForEntity(
                baseUrl() + "/api/auth/register",
                reg,
                TokenResponse.class);
        assertThat(regRes.getStatusCode()).isEqualTo(HttpStatus.OK);
        return regRes.getBody().accessToken();
    }

    private Long findScreeningWithFreeSeat() {
        LocalDate day = LocalDate.now().plusDays(1);
        String dateStr = day.format(DateTimeFormatter.ISO_LOCAL_DATE);
        ResponseEntity<CursorPage<ScreeningScheduleRowResponse>> res = restTemplate.exchange(
                baseUrl() + "/api/sessions?date=" + dateStr + "&limit=20",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<>() {
                });
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().items()).isNotEmpty();
        return res.getBody().items().get(0).screeningId();
    }

    private Long findFreeSeat(Long screeningId, Long expectedSeatId) {
        ResponseEntity<List<ScreeningSeatResponse>> seatsRes = restTemplate.exchange(
                baseUrl() + "/api/sessions/" + screeningId + "/seats",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<>() {
                });
        assertThat(seatsRes.getBody()).isNotNull();
        if (expectedSeatId != null) {
            ScreeningSeatResponse seat = seatsRes.getBody().stream()
                    .filter(s -> s.seatId().equals(expectedSeatId))
                    .findFirst()
                    .orElseThrow();
            assertThat(seat.status()).isEqualTo("FREE");
            return expectedSeatId;
        }
        return seatsRes.getBody().stream()
                .filter(s -> "FREE".equals(s.status()))
                .findFirst()
                .orElseThrow()
                .seatId();
    }

    private HttpHeaders bearer(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
