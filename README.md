# RentCar — Full-Stack Car Rental Management System

> **“Rent. Drive. Explore.”**

**RentCar** is a complete, modern, responsive **Full-Stack Car Rental Management System** built with **React.js (Vite + Bootstrap 5)** on the frontend, **Java Spring Boot 3 (Spring Security + JWT + Spring Data JPA / Hibernate)** on the backend, and **MySQL (`rentcar_db`)** as the relational database.

---

## 1. Project Description

RentCar provides a real-world self-drive car rental experience for both customers (`ROLE_USER`) and platform administrators (`ROLE_ADMIN`). It features real-time date-overlap availability checking, server-side dynamic price calculation with optional extras, coupon validation, simulated payment processing, printable GST invoices, verified customer reviews, vehicle maintenance scheduling, and revenue analytics.

---

## 2. Features

### Customer (`ROLE_USER`)
- **Secure Authentication:** Registration (`ROLE_USER`), JWT Login, Profile management, and BCrypt password change.
- **Browse, Search & Filter Fleet:** Search by Pickup/Drop-off location and dates; filter by Category (`SUV`, `SEDAN`, `HATCHBACK`, `LUXURY`, `SPORTS`), Fuel Type (`PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID`), Transmission (`AUTOMATIC`, `MANUAL`), Seats, Price range, and Availability; sort by Price (`Low → High`, `High → Low`), Rating, or Newest.
- **Real-Time Availability Engine:** Backend date-overlap verification prevents double bookings and blocks inactive or under-maintenance cars.
- **Dynamic Booking & Price Calculation:** Select optional extras (`GPS`, `Child Seat`, `Additional Driver`, `Insurance`), apply promotional coupons (`WELCOME20`, `FLAT500`, `FLAT1000`, `RENT10`), and view server-calculated 18% GST and totals.
- **Simulated Payment Gateway:** Pay via `UPI`, `CARD`, or `CASH` to generate a unique transaction ID (`TXN-RC-XXXXXX`) and booking reference (`RC-2026-XXXXX`).
- **Booking History, Cancellation & Printable Invoices:** View `Upcoming`, `Completed`, and `Cancelled` bookings; cancel eligible future bookings (automatically marking paid transactions as `REFUNDED`); view/print official RentCar GST invoices.
- **Favorites, Verified Reviews & Notifications:** Save favorite cars (`♡`), submit 1–5 star reviews for completed rentals, and receive real-time booking/payment notifications (`🔔`).

### Administrator (`ROLE_ADMIN`)
- **Analytics Dashboard:** 8 KPI cards (`Total Users`, `Total Cars`, `Available Cars`, `Maintenance Cars`, `Total Bookings`, `Active Bookings`, `Completed Bookings`, `Total Revenue`) and 4 charts (`Monthly Revenue`, `Monthly Bookings`, `Booking Status`, `Most Rented Cars`).
- **Fleet Management:** Add, edit, view, or safely deactivate/delete cars (cars with historical bookings are marked `INACTIVE` rather than permanently deleted).
- **User Management:** View customer profiles and block/unblock users (with protection against blocking the last active administrator).
- **Booking & Payment Management:** Filter bookings by status, customer, or date; mark rentals as `COMPLETED` or `CANCELLED`; audit payment transactions (`SUCCESS`, `FAILED`, `REFUNDED`).
- **Coupon, Maintenance & Review Management:** Create/edit coupons, schedule/complete vehicle maintenance (automatically locking cars under maintenance from booking), and moderate customer reviews.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, JavaScript (ES6+), Vite, React Router v6, Axios, HTML5, CSS3, Bootstrap 5, Bootstrap Icons |
| **Backend** | Java 17+, Spring Boot 3.4, Spring Web (REST API), Spring Data JPA, Hibernate, Spring Security, JJWT (JWT), Bean Validation, BCrypt |
| **Database** | MySQL 8.0+ (`rentcar_db`) |
| **Build Tools** | Maven (`pom.xml`), npm (`package.json`) |

---

## 4. Architecture

```text
React Frontend (http://localhost:5173)
        ↕  REST API (JSON + Bearer JWT)
Spring Boot Controller Layer (com.rentcar.controller)
        ↓
Spring Boot Service Layer (com.rentcar.service)
        ↓
Spring Data JPA Repository Layer (com.rentcar.repository)
        ↓
JPA / Hibernate Entities (com.rentcar.entity)
        ↓
MySQL Database (rentcar_db)
```

---

## 5. Database (`rentcar_db`)

Nine core relational entities managed via JPA/Hibernate:
1. `User` (`users`)
2. `Car` (`cars`)
3. `Booking` (`bookings`)
4. `Payment` (`payments`)
5. `Review` (`reviews`)
6. `Favorite` (`favorites`)
7. `Coupon` (`coupons`)
8. `Notification` (`notifications`)
9. `Maintenance` (`maintenance`)

See [`database/README.md`](./database/README.md) and [`database/schema.sql`](./database/schema.sql) for complete schema details.

---

## 6. Project Structure

```text
RentCar/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── components/
│       ├── pages/
│       │   └── admin/
│       ├── services/
│       ├── context/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── pom.xml
│   ├── .env.example
│   └── src/
│       └── main/
│           ├── java/com/rentcar/
│           │   ├── config/
│           │   ├── controller/
│           │   ├── dto/
│           │   ├── entity/
│           │   ├── exception/
│           │   ├── repository/
│           │   ├── security/
│           │   ├── service/
│           │   └── util/
│           └── resources/
│               └── application.properties
│
├── database/
│   ├── schema.sql
│   └── README.md
│
├── .env.example
└── README.md
```

---

## 7. Requirements

- **Java:** JDK 17 or higher
- **Maven:** Apache Maven 3.8+
- **Node.js:** v18+ and npm
- **MySQL:** MySQL Server 8.0+

---

## 8. Installation & Setup

### Step 1: MySQL Setup

Create the database in MySQL (or let Spring Boot create it automatically via `createDatabaseIfNotExist=true`):

```sql
CREATE DATABASE IF NOT EXISTS rentcar_db;
```

### Step 2: Environment Variables

Configure your MySQL credentials as environment variables (see `.env.example`):

**Windows PowerShell:**
```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="RentCarSuperSecretKeyForJwtAuthentication2026SecureTokenGenerationKey"
```

**Linux / macOS:**
```bash
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
export JWT_SECRET=RentCarSuperSecretKeyForJwtAuthentication2026SecureTokenGenerationKey
```

### Step 3: Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

- **Backend API URL:** `http://localhost:8080`

### Step 4: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Application URL:** `http://localhost:5173`

---

## 9. API Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new customer (`ROLE_USER`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT + profile |
| `GET` | `/api/cars` | Public | Search, filter, and sort available cars |
| `GET` | `/api/cars/{id}` | Public | Get car details and availability |
| `GET` | `/api/cars/{carId}/reviews` | Public | Get verified customer reviews for a car |
| `POST` | `/api/cars/{carId}/reviews` | User | Submit a review for a completed booking |
| `POST` | `/api/bookings/calculate-price` | Auth | Calculate dynamic price, extras, coupon & GST |
| `POST` | `/api/bookings` | User | Create a new car rental booking |
| `GET` | `/api/bookings/my` | User | List current customer's bookings |
| `GET` | `/api/bookings/{id}` | Auth | Get booking & invoice details |
| `PUT` | `/api/bookings/{id}/cancel` | Auth | Cancel an eligible future booking |
| `POST` | `/api/payments` | User | Process simulated payment (`UPI`, `CARD`, `CASH`) |
| `GET` | `/api/favorites` | User | Get saved favorite cars |
| `POST` | `/api/favorites/{carId}` | User | Add car to favorites |
| `DELETE` | `/api/favorites/{carId}` | User | Remove car from favorites |
| `GET` | `/api/notifications` | Auth | List user notifications |
| `PUT` | `/api/notifications/{id}/read` | Auth | Mark notification as read |
| `GET` | `/api/admin/dashboard` | Admin | Get dashboard KPIs and revenue analytics |
| `POST/PUT/DELETE` | `/api/admin/cars/**` | Admin | Manage fleet inventory |
| `GET/PUT` | `/api/admin/users/**` | Admin | View and block/unblock users |
| `GET/PUT` | `/api/admin/bookings/**` | Admin | Manage all customer bookings |
| `GET` | `/api/admin/payments` | Admin | Audit all payment records |
| `GET/POST/PUT/DELETE` | `/api/admin/coupons/**` | Admin | Manage promotional coupons |
| `GET/POST/PATCH` | `/api/admin/maintenance/**` | Admin | Schedule and complete vehicle maintenance |
| `GET/DELETE` | `/api/admin/reviews/**` | Admin | Moderate customer reviews |

---

## 10. Demo Credentials (Development / Testing Only)

> **Note:** These accounts are automatically seeded on first launch with BCrypt-hashed passwords for college project demonstration and viva evaluation only.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin (`ROLE_ADMIN`)** | `admin@rentcar.com` | `Admin@123` |
| **Customer (`ROLE_USER`)** | `user@rentcar.com` | `User@123` |

### Sample Promo Coupons
- `WELCOME20` — 20% OFF (Min booking ₹2,000)
- `FLAT1000` — ₹1,000 OFF (Min booking ₹5,000)
- `FLAT500` — ₹500 OFF (Min booking ₹3,000)
- `RENT10` — 10% OFF (Min booking ₹1,500)

---

## 11. Screenshots Section

- **Home Page & Search Hero:** `http://localhost:5173/`
- **Fleet Listing & Multi-Filter Panel:** `http://localhost:5173/cars`
- **Dynamic Booking & Simulated Payment:** `http://localhost:5173/booking/1`
- **Printable GST Invoice:** `http://localhost:5173/bookings/1`
- **Admin Analytics Dashboard:** `http://localhost:5173/admin/dashboard`

---

## 12. Future Enhancements

- Integration with live Razorpay / Stripe payment webhooks
- Automated email & SMS booking reminders via SMTP / Twilio
- GPS live vehicle telemetry tracking and keyless unlock
- Multi-city one-way drop-off dynamic surge pricing

---

## 13. Authors

- **Project:** RentCar — Full-Stack Car Rental Management System (MCA Semester 3 Project)
