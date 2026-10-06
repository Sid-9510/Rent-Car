package com.rentcar.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        try {
            DriverManager.setLoginTimeout(4);
            try (Connection ignored = DriverManager.getConnection(dbUrl, dbUsername, dbPassword)) {
                log.info("Connected to MySQL database successfully: {}", dbUrl);
            }
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(dbUrl);
            config.setUsername(dbUsername);
            config.setPassword(dbPassword);
            config.setDriverClassName(driverClassName);
            config.setMaximumPoolSize(10);
            return new HikariDataSource(config);
        } catch (Exception ex) {
            log.warn("Could not connect to MySQL at '{}' with user '{}' ({}). " +
                     "Set DB_USERNAME and DB_PASSWORD environment variables for MySQL. " +
                     "Falling back to persistent MySQL-compatible local SQL database (./data/rentcar_db).",
                     dbUrl, dbUsername, ex.getMessage());
            HikariConfig fallback = new HikariConfig();
            fallback.setJdbcUrl("jdbc:h2:file:./data/rentcar_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;AUTO_SERVER=TRUE");
            fallback.setUsername("sa");
            fallback.setPassword("");
            fallback.setDriverClassName("org.h2.Driver");
            return new HikariDataSource(fallback);
        }
    }
}
