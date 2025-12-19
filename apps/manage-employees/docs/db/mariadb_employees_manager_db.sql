SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema employees_manager_db
-- -----------------------------------------------------
CREATE DATABASE IF NOT EXISTS `employees_manager_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `employees_manager_db`;

-- -----------------------------------------------------
-- Table `departments` (sans FK temporairement)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `departments`;

CREATE TABLE IF NOT EXISTS `departments` (
  `id` VARCHAR(36) NOT NULL COMMENT 'UUID format',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL DEFAULT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active',
  `location` VARCHAR(255) NULL DEFAULT NULL,
  `budget` DECIMAL(15,2) NULL DEFAULT NULL,
  `parent_id` VARCHAR(36) NULL DEFAULT NULL,
  `manager_id` VARCHAR(36) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_departments_code` (`code`),
  KEY `idx_departments_parent_id` (`parent_id`),
  KEY `idx_departments_manager_id` (`manager_id`),
  KEY `idx_departments_status` (`status`),
  KEY `idx_departments_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `employees`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `employees`;

CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(36) NOT NULL COMMENT 'UUID format',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` DATETIME(6) NULL DEFAULT NULL,
  `user_id` VARCHAR(255) NULL DEFAULT NULL COMMENT 'External user system reference',
  `employee_code` VARCHAR(50) NOT NULL,
  `first_name` VARCHAR(100) NULL DEFAULT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `phone_number` VARCHAR(20) NULL DEFAULT NULL,
  `hire_date` DATE NULL DEFAULT NULL,
  `birth_date` DATE NULL DEFAULT NULL,
  `position` VARCHAR(100) NOT NULL,
  `salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active', 'on_leave', 'suspended', 'terminated') NOT NULL DEFAULT 'active',
  `address` TEXT NULL DEFAULT NULL,
  `city` VARCHAR(100) NULL DEFAULT NULL,
  `country` VARCHAR(100) NULL DEFAULT NULL,
  `department_id` VARCHAR(36) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_employees_email` (`email`),
  UNIQUE KEY `idx_employees_employee_code` (`employee_code`),
  KEY `idx_employees_user_id` (`user_id`),
  KEY `idx_employees_department_id` (`department_id`),
  KEY `idx_employees_status` (`status`),
  KEY `idx_employees_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_employees_department`
    FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Ajout des Foreign Keys pour departments
-- -----------------------------------------------------
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_departments_parent`
    FOREIGN KEY (`parent_id`)
    REFERENCES `departments` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_departments_manager`
    FOREIGN KEY (`manager_id`)
    REFERENCES `employees` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
