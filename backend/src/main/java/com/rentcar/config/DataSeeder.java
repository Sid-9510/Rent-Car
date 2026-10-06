package com.rentcar.config;

import com.rentcar.entity.*;
import com.rentcar.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final CouponRepository couponRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteRepository favoriteRepository;
    private final NotificationRepository notificationRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-password:Admin@123}")
    private String defaultAdminPassword;

    @Value("${app.seed.user-password:User@123}")
    private String defaultUserPassword;

    public DataSeeder(UserRepository userRepository,
                      CarRepository carRepository,
                      CouponRepository couponRepository,
                      BookingRepository bookingRepository,
                      PaymentRepository paymentRepository,
                      ReviewRepository reviewRepository,
                      FavoriteRepository favoriteRepository,
                      NotificationRepository notificationRepository,
                      MaintenanceRepository maintenanceRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.couponRepository = couponRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.favoriteRepository = favoriteRepository;
        this.notificationRepository = notificationRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("RentCar database already contains data. Skipping initial seed.");
            return;
        }

        log.info("Seeding initial RentCar database records...");

        // 1. Seed Users
        User admin = createUser(
                "RentCar Admin",
                "admin@rentcar.com",
                defaultAdminPassword,
                "+91 98765 43210",
                "Corporate HQ, SG Highway, Ahmedabad",
                "GJ01-20180091234",
                Role.ADMIN
        );

        User demoUser = createUser(
                "Aarav Mehta",
                "user@rentcar.com",
                defaultUserPassword,
                "+91 98250 11223",
                "Navrangpura, Ahmedabad, Gujarat",
                "GJ01-20210045678",
                Role.USER
        );

        User rahul = createUser(
                "Rahul Sharma",
                "rahul.sharma@example.com",
                defaultUserPassword,
                "+91 98111 22334",
                "Andheri West, Mumbai, Maharashtra",
                "MH02-20190078231",
                Role.USER
        );

        User priya = createUser(
                "Priya Patel",
                "priya.patel@example.com",
                defaultUserPassword,
                "+91 97234 55667",
                "Indiranagar, Bengaluru, Karnataka",
                "KA01-20200033412",
                Role.USER
        );

        // 2. Seed Cars (11 realistic cars covering all categories and fuel types)
        Car creta = createCar("Hyundai", "Creta", 2025, CarCategory.SUV, FuelType.PETROL,
                TransmissionType.AUTOMATIC, 5, 5, 4, new BigDecimal("2500.00"), "Ahmedabad",
                "Premium mid-size SUV featuring panoramic sunroof, ventilated seats, Bose audio system, and smooth IVT automatic transmission ideal for city and highway drives.",
                "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car swift = createCar("Maruti", "Swift", 2024, CarCategory.HATCHBACK, FuelType.PETROL,
                TransmissionType.MANUAL, 5, 5, 2, new BigDecimal("1400.00"), "Ahmedabad",
                "Sporty, fuel-efficient hatchback with peppy K-Series engine, SmartPlay infotainment, and effortless city maneuverability.",
                "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car seltos = createCar("Kia", "Seltos", 2025, CarCategory.SUV, FuelType.DIESEL,
                TransmissionType.AUTOMATIC, 5, 5, 4, new BigDecimal("2600.00"), "Mumbai",
                "Feature-packed SUV with ADAS Level 2 safety, dual 10.25-inch displays, 360-degree camera, and refined diesel torque for long road trips.",
                "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car nexon = createCar("Tata", "Nexon", 2024, CarCategory.SUV, FuelType.PETROL,
                TransmissionType.MANUAL, 5, 5, 3, new BigDecimal("1900.00"), "Pune",
                "5-Star Global NCAP safety rated compact SUV with bold styling, high ground clearance, and multi-drive modes.",
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car city = createCar("Honda", "City", 2025, CarCategory.SEDAN, FuelType.HYBRID,
                TransmissionType.AUTOMATIC, 5, 4, 4, new BigDecimal("2200.00"), "Ahmedabad",
                "Executive sedan with e:HEV strong hybrid technology, plush leather upholstery, Honda Sensing safety suite, and exceptional rear legroom.",
                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car innova = createCar("Toyota", "Innova", 2025, CarCategory.SUV, FuelType.DIESEL,
                TransmissionType.AUTOMATIC, 7, 5, 5, new BigDecimal("3500.00"), "Mumbai",
                "The ultimate 7-seater family and business tourer with captain seats, dual-zone climate control, and legendary Toyota reliability.",
                "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car xuv700 = createCar("Mahindra", "XUV700", 2025, CarCategory.SUV, FuelType.DIESEL,
                TransmissionType.AUTOMATIC, 7, 5, 5, new BigDecimal("3200.00"), "Delhi",
                "Commanding 7-seater SUV equipped with mHawk turbo diesel, skyroof, Sony 3D audio, and intelligent driver assistance.",
                "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car bmw3 = createCar("BMW", "3 Series", 2025, CarCategory.LUXURY, FuelType.PETROL,
                TransmissionType.AUTOMATIC, 5, 4, 3, new BigDecimal("6500.00"), "Mumbai",
                "Luxury sports sedan with TwinPower Turbo performance, curved iDrive cockpit, ambient lighting, and dynamic rear-wheel-drive handling.",
                "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car mercC = createCar("Mercedes", "C-Class", 2025, CarCategory.LUXURY, FuelType.DIESEL,
                TransmissionType.AUTOMATIC, 5, 4, 3, new BigDecimal("7200.00"), "Bengaluru",
                "Baby S-Class luxury sedan offering MBUX portrait display, Burmester surround sound, and whisper-quiet cabin refinement.",
                "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car tiagoEv = createCar("Tata", "Tiago EV", 2024, CarCategory.HATCHBACK, FuelType.ELECTRIC,
                TransmissionType.AUTOMATIC, 5, 5, 2, new BigDecimal("1600.00"), "Ahmedabad",
                "Zero-emission electric hatchback with Ziptron technology, silent instant torque, regenerative braking, and connected car features.",
                "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=80",
                CarStatus.AVAILABLE);

        Car mustang = createCar("Ford", "Mustang GT", 2024, CarCategory.SPORTS, FuelType.PETROL,
                TransmissionType.AUTOMATIC, 4, 2, 2, new BigDecimal("9500.00"), "Delhi",
                "Iconic American muscle sports coupe delivering exhilarating grand touring performance, digital instrument cluster, and unmistakable presence.",
                "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1000&q=80",
                CarStatus.MAINTENANCE);

        // 3. Seed Coupons
        createCoupon("WELCOME20", DiscountType.PERCENTAGE, new BigDecimal("20.00"),
                new BigDecimal("2000.00"), LocalDate.now().plusMonths(6), 100, 2);
        createCoupon("FLAT500", DiscountType.FIXED, new BigDecimal("500.00"),
                new BigDecimal("3000.00"), LocalDate.now().plusMonths(6), 50, 1);
        createCoupon("FLAT1000", DiscountType.FIXED, new BigDecimal("1000.00"),
                new BigDecimal("5000.00"), LocalDate.now().plusMonths(6), 50, 1);
        createCoupon("RENT10", DiscountType.PERCENTAGE, new BigDecimal("10.00"),
                new BigDecimal("1500.00"), LocalDate.now().plusMonths(12), 200, 1);

        // 4. Seed Historical & Upcoming Bookings + Payments
        LocalDate now = LocalDate.now();

        // Completed booking 1 (2 months ago - Demo User on Hyundai Creta, reviewed)
        Booking b1 = createSeedBooking(
                "RC-2026-00001", demoUser, creta,
                "Ahmedabad Airport", "Ahmedabad Airport",
                now.minusMonths(2).withDayOfMonth(10), now.minusMonths(2).withDayOfMonth(13), 3,
                "GPS,INSURANCE", "FLAT1000",
                new BigDecimal("7500.00"), new BigDecimal("1100.00"), new BigDecimal("1000.00"),
                new BigDecimal("1368.00"), new BigDecimal("8968.00"),
                BookingStatus.COMPLETED
        );
        createSeedPayment(b1, "TXN-RC-819201", PaymentMethod.UPI, PaymentStatus.SUCCESS,
                now.minusMonths(2).withDayOfMonth(9).atTime(14, 30));

        // Completed booking 2 (1 month ago - Rahul on BMW 3 Series, reviewed)
        Booking b2 = createSeedBooking(
                "RC-2026-00002", rahul, bmw3,
                "Mumbai Bandra", "Mumbai Airport",
                now.minusMonths(1).withDayOfMonth(5), now.minusMonths(1).withDayOfMonth(8), 3,
                "INSURANCE", "WELCOME20",
                new BigDecimal("19500.00"), new BigDecimal("500.00"), new BigDecimal("4000.00"),
                new BigDecimal("2880.00"), new BigDecimal("18880.00"),
                BookingStatus.COMPLETED
        );
        createSeedPayment(b2, "TXN-RC-819202", PaymentMethod.CARD, PaymentStatus.SUCCESS,
                now.minusMonths(1).withDayOfMonth(4).atTime(11, 15));

        // Completed booking 3 (1 month ago - Priya on Toyota Innova, reviewed)
        Booking b3 = createSeedBooking(
                "RC-2026-00003", priya, innova,
                "Mumbai Central", "Pune Wakad",
                now.minusMonths(1).withDayOfMonth(15), now.minusMonths(1).withDayOfMonth(19), 4,
                "GPS,CHILD_SEAT", "FLAT500",
                new BigDecimal("14000.00"), new BigDecimal("1400.00"), new BigDecimal("500.00"),
                new BigDecimal("2682.00"), new BigDecimal("17582.00"),
                BookingStatus.COMPLETED
        );
        createSeedPayment(b3, "TXN-RC-819203", PaymentMethod.UPI, PaymentStatus.SUCCESS,
                now.minusMonths(1).withDayOfMonth(14).atTime(18, 0));

        // Completed booking 4 (2 weeks ago - Demo User on Kia Seltos, unreviewed so user can test submitting a review!)
        Booking b4 = createSeedBooking(
                "RC-2026-00004", demoUser, seltos,
                "Mumbai Airport", "Mumbai Airport",
                now.minusDays(16), now.minusDays(14), 2,
                "GPS", null,
                new BigDecimal("5200.00"), new BigDecimal("400.00"), BigDecimal.ZERO,
                new BigDecimal("1008.00"), new BigDecimal("6608.00"),
                BookingStatus.COMPLETED
        );
        createSeedPayment(b4, "TXN-RC-819204", PaymentMethod.CARD, PaymentStatus.SUCCESS,
                now.minusDays(17).atTime(10, 20));

        // Upcoming Confirmed booking 5 (Demo User on Honda City next week)
        Booking b5 = createSeedBooking(
                "RC-2026-00005", demoUser, city,
                "Ahmedabad SG Highway", "Ahmedabad SG Highway",
                now.plusDays(5), now.plusDays(8), 3,
                "INSURANCE", "RENT10",
                new BigDecimal("6600.00"), new BigDecimal("500.00"), new BigDecimal("710.00"),
                new BigDecimal("1150.20"), new BigDecimal("7540.20"),
                BookingStatus.CONFIRMED
        );
        createSeedPayment(b5, "TXN-RC-819205", PaymentMethod.UPI, PaymentStatus.SUCCESS,
                LocalDateTime.now().minusDays(1));

        // Cancelled booking 6 (Rahul on Maruti Swift)
        Booking b6 = createSeedBooking(
                "RC-2026-00006", rahul, swift,
                "Ahmedabad Railway Station", "Ahmedabad Airport",
                now.plusDays(12), now.plusDays(14), 2,
                null, null,
                new BigDecimal("2800.00"), BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("504.00"), new BigDecimal("3304.00"),
                BookingStatus.CANCELLED
        );
        createSeedPayment(b6, "TXN-RC-819206", PaymentMethod.UPI, PaymentStatus.REFUNDED,
                LocalDateTime.now().minusDays(2));

        // 5. Seed Reviews
        createSeedReview(demoUser, creta, b1, 5,
                "Spotless Hyundai Creta! Pickup in Ahmedabad was super quick, the automatic transmission was effortless in traffic, and pricing was 100% transparent.");
        createSeedReview(rahul, bmw3, b2, 5,
                "Renting the BMW 3 Series through RentCar was a dream experience. Immaculate interior and instant confirmation.");
        createSeedReview(priya, innova, b3, 4,
                "Very comfortable 7-seater Innova for our family trip. Child seat extra was clean and well-installed.");

        // 6. Seed Favorites for Demo User
        Favorite fav1 = new Favorite();
        fav1.setUser(demoUser);
        fav1.setCar(creta);
        favoriteRepository.save(fav1);

        Favorite fav2 = new Favorite();
        fav2.setUser(demoUser);
        fav2.setCar(bmw3);
        favoriteRepository.save(fav2);

        // 7. Seed Notifications for Demo User & Admin
        createSeedNotification(demoUser, "Booking confirmed successfully! Reference: RC-2026-00005 for Honda City.", NotificationType.BOOKING, false);
        createSeedNotification(demoUser, "Payment successful (₹7540.20, Transaction ID: TXN-RC-819205).", NotificationType.PAYMENT, false);
        createSeedNotification(demoUser, "Your rental RC-2026-00004 for Kia Seltos is completed. Share your review!", NotificationType.REVIEW, false);
        createSeedNotification(admin, "System initialized: 11 vehicles and 4 active coupons loaded in RentCar.", NotificationType.SYSTEM, false);

        // 8. Seed Maintenance records
        Maintenance m1 = new Maintenance();
        m1.setCar(mustang);
        m1.setDescription("Scheduled synthetic oil change, brake pad inspection & wheel alignment");
        m1.setMaintenanceDate(now.plusDays(2));
        m1.setCost(new BigDecimal("8500.00"));
        m1.setStatus(MaintenanceStatus.IN_PROGRESS);
        maintenanceRepository.save(m1);

        Maintenance m2 = new Maintenance();
        m2.setCar(creta);
        m2.setDescription("15,000 km periodic service and cabin air filter replacement");
        m2.setMaintenanceDate(now.minusMonths(1));
        m2.setCost(new BigDecimal("4500.00"));
        m2.setStatus(MaintenanceStatus.COMPLETED);
        maintenanceRepository.save(m2);

        log.info("RentCar seed completed successfully.");
    }

    private User createUser(String name, String email, String rawPassword,
                            String phone, String address, String license, Role role) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setPhone(phone);
        u.setAddress(address);
        u.setDrivingLicenseNumber(license);
        u.setRole(role);
        u.setStatus(UserStatus.ACTIVE);
        return userRepository.save(u);
    }

    private Car createCar(String brand, String model, int year, CarCategory category,
                          FuelType fuel, TransmissionType transmission, int seats, int doors,
                          int luggage, BigDecimal price, String location, String description,
                          String imageUrl, CarStatus status) {
        Car c = new Car();
        c.setBrand(brand);
        c.setModel(model);
        c.setYear(year);
        c.setCategory(category);
        c.setFuelType(fuel);
        c.setTransmission(transmission);
        c.setSeats(seats);
        c.setDoors(doors);
        c.setLuggageCapacity(luggage);
        c.setPricePerDay(price);
        c.setLocation(location);
        c.setDescription(description);
        c.setImageUrl(imageUrl);
        c.setStatus(status);
        return carRepository.save(c);
    }

    private void createCoupon(String code, DiscountType type, BigDecimal value,
                              BigDecimal minAmount, LocalDate expiry, int limit, int used) {
        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setDiscountType(type);
        coupon.setDiscountValue(value);
        coupon.setMinimumBookingAmount(minAmount);
        coupon.setExpiryDate(expiry);
        coupon.setUsageLimit(limit);
        coupon.setUsedCount(used);
        coupon.setStatus(CouponStatus.ACTIVE);
        couponRepository.save(coupon);
    }

    private Booking createSeedBooking(String ref, User user, Car car,
                                      String pickupLoc, String dropLoc,
                                      LocalDate pickupDate, LocalDate returnDate, int days,
                                      String extras, String couponCode,
                                      BigDecimal base, BigDecimal extra, BigDecimal discount,
                                      BigDecimal tax, BigDecimal total, BookingStatus status) {
        Booking b = new Booking();
        b.setBookingReference(ref);
        b.setUser(user);
        b.setCar(car);
        b.setPickupLocation(pickupLoc);
        b.setDropLocation(dropLoc);
        b.setPickupDate(pickupDate);
        b.setPickupTime(LocalTime.of(10, 0));
        b.setReturnDate(returnDate);
        b.setReturnTime(LocalTime.of(10, 0));
        b.setNumberOfDays(days);
        b.setSelectedExtras(extras);
        b.setCouponCode(couponCode);
        b.setBaseAmount(base);
        b.setExtraAmount(extra);
        b.setDiscountAmount(discount);
        b.setTaxAmount(tax);
        b.setTotalAmount(total);
        b.setStatus(status);
        return bookingRepository.save(b);
    }

    private void createSeedPayment(Booking booking, String txnId, PaymentMethod method,
                                   PaymentStatus status, LocalDateTime date) {
        Payment p = new Payment();
        p.setBooking(booking);
        p.setTransactionId(txnId);
        p.setAmount(booking.getTotalAmount());
        p.setPaymentMethod(method);
        p.setPaymentStatus(status);
        p.setPaymentDate(date);
        paymentRepository.save(p);
    }

    private void createSeedReview(User user, Car car, Booking booking, int rating, String comment) {
        Review r = new Review();
        r.setUser(user);
        r.setCar(car);
        r.setBooking(booking);
        r.setRating(rating);
        r.setComment(comment);
        reviewRepository.save(r);
    }

    private void createSeedNotification(User user, String msg, NotificationType type, boolean read) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(msg);
        n.setType(type);
        n.setRead(read);
        notificationRepository.save(n);
    }
}
