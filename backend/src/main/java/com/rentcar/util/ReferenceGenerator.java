package com.rentcar.util;

import java.time.Year;
import java.util.concurrent.ThreadLocalRandom;

public final class ReferenceGenerator {

    private ReferenceGenerator() {
    }

    public static String generateBookingReference(long sequenceHint) {
        int year = Year.now().getValue();
        long suffix = (sequenceHint > 0)
                ? (sequenceHint * 100 + ThreadLocalRandom.current().nextInt(10, 99))
                : ThreadLocalRandom.current().nextInt(10000, 99999);
        return String.format("RC-%d-%05d", year, suffix % 100000);
    }

    public static String generateTransactionId() {
        int randomNum = ThreadLocalRandom.current().nextInt(100000, 999999);
        return "TXN-RC-" + randomNum;
    }
}
