# RentCar — Database Documentation (`rentcar_db`)

## Overview

**RentCar** uses **MySQL 8.0+** with **Spring Data JPA / Hibernate** as its persistence layer.

- **Database Name:** `rentcar_db`
- **Character Set:** `utf8mb4`
- **ORM Configuration:** `spring.jpa.hibernate.ddl-auto=update`

When the Spring Boot backend starts:
1. It automatically creates the database `rentcar_db` if it does not already exist (`createDatabaseIfNotExist=true`).
2. Hibernate automatically creates/updates all 9 entity tables with proper primary keys, foreign keys, unique constraints, and indexes.
3. The `DataSeeder` component automatically seeds initial demo data (Admin & User accounts with BCrypt-hashed passwords, 10 realistic Indian/Global cars, coupons, sample bookings, payments, reviews, notifications, and maintenance records) if the database is empty.

---

## Entity-Relationship Summary

```text
User (users)
 ├── 1:N → Booking (bookings)
 ├── 1:N → Review (reviews)
 ├── 1:N → Favorite (favorites)
 └── 1:N → Notification (notifications)

Car (cars)
 ├── 1:N → Booking (bookings)
 ├── 1:N → Review (reviews)
 ├── 1:N → Favorite (favorites)
 └── 1:N → Maintenance (maintenance)

Booking (bookings)
 ├── 1:1 → Payment (payments)
 └── 1:1 → Review (reviews)
```

---

## Tables

| Table | Entity | Description |
| :--- | :--- | :--- |
| `users` | `User` | Customers (`ROLE_USER` / `USER`) and administrators (`ROLE_ADMIN` / `ADMIN`), status (`ACTIVE`, `BLOCKED`), BCrypt password hashes. |
| `cars` | `Car` | Vehicle inventory with category, fuel type, transmission, seats, doors, luggage capacity, price per day, location, and status (`AVAILABLE`, `MAINTENANCE`, `INACTIVE`). |
| `bookings` | `Booking` | Rental reservations with unique reference (`RC-2026-XXXXX`), dates/times, extras, coupon applied, calculated base/extra/discount/tax/total amounts, and status (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`). |
| `payments` | `Payment` | Simulated payment records (`TXN-RC-XXXXXX`) linked 1:1 to bookings with method (`UPI`, `CARD`, `CASH`) and status (`PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`). |
| `reviews` | `Review` | Verified customer ratings (`1–5`) and comments linked to a completed booking (`uk_booking_id` prevents duplicate reviews per booking). |
| `favorites` | `Favorite` | User-saved cars with a composite unique constraint `(user_id, car_id)` to prevent duplicates. |
| `coupons` | `Coupon` | Promotional discount codes (`PERCENTAGE` or `FIXED`) with minimum booking amount, expiry date, usage limit, used count, and status. |
| `notifications` | `Notification` | User notifications for booking confirmations, payments, cancellations, reviews, and reminders. |
| `maintenance` | `Maintenance` | Vehicle maintenance schedules and logs (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`). Active maintenance synchronizes with car bookability. |

---

## Manual Setup (Optional)

If you prefer to create the database manually before starting Spring Boot:

```bash
mysql -u root -p < database/schema.sql
```

Or in the MySQL CLI:

```sql
CREATE DATABASE IF NOT EXISTS rentcar_db;
```
