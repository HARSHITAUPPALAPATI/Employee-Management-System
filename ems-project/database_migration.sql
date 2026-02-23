-- ============================================
-- EMS DATABASE - FULL SETUP SCRIPT (emp_dbs)
-- Run this entire script in MySQL Workbench
-- Version 2.0 - includes Tasks feature
-- ============================================

CREATE DATABASE IF NOT EXISTS emp_dbs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE emp_dbs;

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_attempts INT NOT NULL DEFAULT 0,
    account_locked BOOLEAN NOT NULL DEFAULT FALSE,
    locked_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS designations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    manager_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    date_of_birth DATE NULL,
    date_of_joining DATE NOT NULL,
    salary DECIMAL(12,2) NULL,
    department_id BIGINT NULL,
    designation_id BIGINT NULL,
    reporting_manager_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    employment_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    resignation_date DATE NULL,
    notice_period_end_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_emp_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_emp_desig FOREIGN KEY (designation_id) REFERENCES designations(id),
    CONSTRAINT fk_emp_manager FOREIGN KEY (reporting_manager_id) REFERENCES employees(id)
);

ALTER TABLE departments ADD CONSTRAINT fk_dept_manager FOREIGN KEY (manager_id) REFERENCES employees(id);

CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_by BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ann_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NULL,
    performed_by VARCHAR(100) NOT NULL,
    details TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manager_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    manager_id BIGINT NOT NULL,
    note TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mn_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_mn_manager FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- NEW: Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    assigned_to BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    completed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_assignee FOREIGN KEY (assigned_to) REFERENCES employees(id),
    CONSTRAINT fk_task_assigner FOREIGN KEY (assigned_by) REFERENCES employees(id)
);

-- SEED DATA
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_MANAGER'), ('ROLE_EMPLOYEE');

INSERT IGNORE INTO designations (title) VALUES
    ('Software Engineer'), ('Senior Engineer'), ('Team Lead'),
    ('Engineering Manager'), ('HR Executive'), ('HR Manager'), ('Director');

-- Password for all users is Admin@123
INSERT IGNORE INTO users (username, email, password, is_active) VALUES
    ('admin',    'admin@emp_db.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE),
    ('manager1', 'manager1@emp_db.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE),
    ('emp1',     'emp1@emp_db.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE),
    ('emp2',     'emp2@emp_db.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE),
    ('emp3',     'emp3@emp_db.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', TRUE);

INSERT IGNORE INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.username='admin'    AND r.name='ROLE_ADMIN';
INSERT IGNORE INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.username='manager1' AND r.name='ROLE_MANAGER';
INSERT IGNORE INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.username='emp1'     AND r.name='ROLE_EMPLOYEE';
INSERT IGNORE INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.username='emp2'     AND r.name='ROLE_EMPLOYEE';
INSERT IGNORE INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.username='emp3'     AND r.name='ROLE_EMPLOYEE';

INSERT IGNORE INTO departments (name, description, is_active) VALUES
    ('Engineering', 'Software development team', TRUE),
    ('Human Resources', 'HR and recruitment team', TRUE),
    ('Management', 'Senior management team', TRUE);

DELIMITER $$
DROP PROCEDURE IF EXISTS seed_employees$$
CREATE PROCEDURE seed_employees()
BEGIN
    DECLARE v_user_admin BIGINT; DECLARE v_user_manager1 BIGINT;
    DECLARE v_user_emp1 BIGINT; DECLARE v_user_emp2 BIGINT; DECLARE v_user_emp3 BIGINT;
    DECLARE v_dept_eng BIGINT; DECLARE v_dept_hr BIGINT; DECLARE v_dept_mgmt BIGINT;
    DECLARE v_desig_dir BIGINT; DECLARE v_desig_engmgr BIGINT; DECLARE v_desig_swe BIGINT;
    DECLARE v_desig_senior BIGINT; DECLARE v_desig_hrexec BIGINT;
    DECLARE v_emp_admin BIGINT; DECLARE v_emp_manager1 BIGINT; DECLARE v_emp_emp3 BIGINT;

    SELECT id INTO v_user_admin FROM users WHERE username='admin';
    SELECT id INTO v_user_manager1 FROM users WHERE username='manager1';
    SELECT id INTO v_user_emp1 FROM users WHERE username='emp1';
    SELECT id INTO v_user_emp2 FROM users WHERE username='emp2';
    SELECT id INTO v_user_emp3 FROM users WHERE username='emp3';
    SELECT id INTO v_dept_eng FROM departments WHERE name='Engineering';
    SELECT id INTO v_dept_hr FROM departments WHERE name='Human Resources';
    SELECT id INTO v_dept_mgmt FROM departments WHERE name='Management';
    SELECT id INTO v_desig_dir FROM designations WHERE title='Director';
    SELECT id INTO v_desig_engmgr FROM designations WHERE title='Engineering Manager';
    SELECT id INTO v_desig_swe FROM designations WHERE title='Software Engineer';
    SELECT id INTO v_desig_senior FROM designations WHERE title='Senior Engineer';
    SELECT id INTO v_desig_hrexec FROM designations WHERE title='HR Executive';

    INSERT IGNORE INTO employees (user_id,first_name,last_name,email,phone,date_of_birth,date_of_joining,salary,department_id,designation_id,reporting_manager_id,is_active,employment_status)
    VALUES (v_user_admin,'Admin','User','admin@emp_db.com','9000000001','1985-01-15','2020-01-01',150000.00,v_dept_mgmt,v_desig_dir,NULL,TRUE,'ACTIVE');
    SELECT id INTO v_emp_admin FROM employees WHERE email='admin@emp_db.com';

    INSERT IGNORE INTO employees (user_id,first_name,last_name,email,phone,date_of_birth,date_of_joining,salary,department_id,designation_id,reporting_manager_id,is_active,employment_status)
    VALUES (v_user_manager1,'John','Manager','manager1@emp_db.com','9000000002','1988-05-20','2021-03-15',120000.00,v_dept_eng,v_desig_engmgr,v_emp_admin,TRUE,'ACTIVE');
    SELECT id INTO v_emp_manager1 FROM employees WHERE email='manager1@emp_db.com';

    INSERT IGNORE INTO employees (user_id,first_name,last_name,email,phone,date_of_birth,date_of_joining,salary,department_id,designation_id,reporting_manager_id,is_active,employment_status)
    VALUES (v_user_emp1,'Alice','Smith','emp1@emp_db.com','9000000003','1995-07-10','2022-06-01',80000.00,v_dept_eng,v_desig_swe,v_emp_manager1,TRUE,'ACTIVE');

    INSERT IGNORE INTO employees (user_id,first_name,last_name,email,phone,date_of_birth,date_of_joining,salary,department_id,designation_id,reporting_manager_id,is_active,employment_status)
    VALUES (v_user_emp2,'Bob','Jones','emp2@emp_db.com','9000000004','1993-11-25','2022-08-01',85000.00,v_dept_eng,v_desig_senior,v_emp_manager1,TRUE,'ACTIVE');

    INSERT IGNORE INTO employees (user_id,first_name,last_name,email,phone,date_of_birth,date_of_joining,salary,department_id,designation_id,reporting_manager_id,is_active,employment_status)
    VALUES (v_user_emp3,'Carol','Williams','emp3@emp_db.com','9000000005','1990-03-18','2021-11-01',75000.00,v_dept_hr,v_desig_hrexec,v_emp_admin,TRUE,'ACTIVE');
    SELECT id INTO v_emp_emp3 FROM employees WHERE email='emp3@emp_db.com';

    UPDATE departments SET manager_id=v_emp_manager1 WHERE name='Engineering';
    UPDATE departments SET manager_id=v_emp_emp3 WHERE name='Human Resources';
    UPDATE departments SET manager_id=v_emp_admin WHERE name='Management';
END$$
DELIMITER ;

CALL seed_employees();
DROP PROCEDURE IF EXISTS seed_employees;

-- Reset all passwords to Admin@123
UPDATE users SET password='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    failed_attempts=0, account_locked=FALSE, locked_at=NULL;

-- ============================================
-- DONE. All users password: Admin@123
-- ============================================
