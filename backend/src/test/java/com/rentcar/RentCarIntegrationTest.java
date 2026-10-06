package com.rentcar;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentcar.dto.*;
import com.rentcar.entity.*;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class RentCarIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String userToken;
    private static String adminToken;
    private static Long createdBookingId;
    private static Long selectedCarId;

    @Test
    @Order(1)
    void step1_registerAndLoginUser() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setName("Siddharth Verma");
        reg.setEmail("siddharth.test@rentcar.com");
        reg.setPhone("+91 9876500001");
        reg.setPassword("Pass@123");
        reg.setConfirmPassword("Pass@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("USER"));

        LoginRequest login = new LoginRequest();
        login.setEmail("siddharth.test@rentcar.com");
        login.setPassword("Pass@123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        JsonNode json = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        userToken = json.get("token").asText();
        assertThat(userToken).isNotBlank();
    }

    @Test
    @Order(2)
    void step2_browseSearchFilterAndCarDetails() throws Exception {
        MvcResult carsRes = mockMvc.perform(get("/api/cars")
                        .param("category", "SUV")
                        .param("sortBy", "price_asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        JsonNode carsData = objectMapper.readTree(carsRes.getResponse().getContentAsString()).get("data");
        assertThat(carsData.isArray()).isTrue();
        assertThat(carsData.size()).isGreaterThan(0);

        selectedCarId = carsData.get(0).get("id").asLong();

        mockMvc.perform(get("/api/cars/" + selectedCarId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(selectedCarId));
    }

    @Test
    @Order(3)
    void step3_checkAvailabilityCalculatePriceAndCreateBooking() throws Exception {
        LocalDate pickup = LocalDate.now().plusDays(20);
        LocalDate drop = LocalDate.now().plusDays(23); // 3 days

        Map<String, Object> calcReq = Map.of(
                "carId", selectedCarId,
                "pickupDate", pickup.toString(),
                "returnDate", drop.toString(),
                "selectedExtras", List.of("GPS", "INSURANCE"),
                "couponCode", "WELCOME20"
        );

        mockMvc.perform(post("/api/bookings/calculate-price")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(calcReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available").value(true))
                .andExpect(jsonPath("$.data.numberOfDays").value(3))
                .andExpect(jsonPath("$.data.discountAmount").isNumber());

        BookingRequest bookingReq = new BookingRequest();
        bookingReq.setCarId(selectedCarId);
        bookingReq.setPickupLocation("Ahmedabad Airport");
        bookingReq.setDropLocation("Ahmedabad Airport");
        bookingReq.setPickupDate(pickup);
        bookingReq.setPickupTime(LocalTime.of(10, 0));
        bookingReq.setReturnDate(drop);
        bookingReq.setReturnTime(LocalTime.of(10, 0));
        bookingReq.setSelectedExtras(List.of("GPS", "INSURANCE"));
        bookingReq.setCouponCode("WELCOME20");

        MvcResult bookingRes = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.bookingReference").isNotEmpty())
                .andReturn();

        JsonNode bookingNode = objectMapper.readTree(bookingRes.getResponse().getContentAsString()).get("data");
        createdBookingId = bookingNode.get("id").asLong();

        // Verify overlapping booking is rejected (Business Rule 4 & 5)
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isConflict());
    }

    @Test
    @Order(4)
    void step4_simulatePaymentViewBookingsInvoiceAndCancel() throws Exception {
        PaymentRequest payReq = new PaymentRequest();
        payReq.setBookingId(createdBookingId);
        payReq.setPaymentMethod(PaymentMethod.UPI);

        mockMvc.perform(post("/api/payments")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.paymentStatus").value("SUCCESS"))
                .andExpect(jsonPath("$.data.transactionId").isNotEmpty());

        // View My Bookings
        mockMvc.perform(get("/api/bookings/my")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status").value("CONFIRMED"));

        // View Invoice / Booking Details
        mockMvc.perform(get("/api/bookings/" + createdBookingId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentStatus").value("SUCCESS"));

        // Cancel Booking -> Status becomes CANCELLED and Payment becomes REFUNDED
        mockMvc.perform(put("/api/bookings/" + createdBookingId + "/cancel")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.paymentStatus").value("REFUNDED"));
    }

    @Test
    @Order(5)
    void step5_adminLoginDashboardCarsUsersBookingsMaintenanceAndAnalytics() throws Exception {
        LoginRequest adminLogin = new LoginRequest();
        adminLogin.setEmail("admin@rentcar.com");
        adminLogin.setPassword("Admin@123");

        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andReturn();

        adminToken = objectMapper.readTree(loginRes.getResponse().getContentAsString()).get("token").asText();

        // View Admin Dashboard & Analytics
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalCars").isNumber())
                .andExpect(jsonPath("$.data.totalRevenue").isNumber());

        // Add Car as Admin
        CarRequest newCar = new CarRequest();
        newCar.setBrand("Skoda");
        newCar.setModel("Slavia");
        newCar.setYear(2025);
        newCar.setCategory(CarCategory.SEDAN);
        newCar.setFuelType(FuelType.PETROL);
        newCar.setTransmission(TransmissionType.AUTOMATIC);
        newCar.setSeats(5);
        newCar.setDoors(4);
        newCar.setLuggageCapacity(4);
        newCar.setPricePerDay(new BigDecimal("2300.00"));
        newCar.setLocation("Pune");
        newCar.setDescription("Turbocharged executive sedan.");
        newCar.setStatus(CarStatus.AVAILABLE);

        MvcResult addCarRes = mockMvc.perform(post("/api/admin/cars")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCar)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.brand").value("Skoda"))
                .andReturn();

        Long addedCarId = objectMapper.readTree(addCarRes.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // Schedule Maintenance for the new car -> Car status automatically becomes MAINTENANCE
        MaintenanceRequest maintReq = new MaintenanceRequest();
        maintReq.setCarId(addedCarId);
        maintReq.setDescription("Initial inspection & ceramic coating");
        maintReq.setMaintenanceDate(LocalDate.now().plusDays(1));
        maintReq.setCost(new BigDecimal("3500.00"));
        maintReq.setStatus(MaintenanceStatus.SCHEDULED);

        mockMvc.perform(post("/api/admin/maintenance")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maintReq)))
                .andExpect(status().isCreated());

        // Verify car under maintenance cannot be booked (Rule 3)
        BookingRequest blockedCarBooking = new BookingRequest();
        blockedCarBooking.setCarId(addedCarId);
        blockedCarBooking.setPickupLocation("Pune");
        blockedCarBooking.setDropLocation("Pune");
        blockedCarBooking.setPickupDate(LocalDate.now().plusDays(10));
        blockedCarBooking.setPickupTime(LocalTime.of(10, 0));
        blockedCarBooking.setReturnDate(LocalDate.now().plusDays(12));
        blockedCarBooking.setReturnTime(LocalTime.of(10, 0));

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blockedCarBooking)))
                .andExpect(status().isConflict());
    }
}
