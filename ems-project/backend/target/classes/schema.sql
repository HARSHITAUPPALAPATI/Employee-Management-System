USE emp_db;

CREATE TABLE IF NOT EXISTS roles (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    username         VARCHAR(50)  NOT NULL UNIQUE,
    email            VARCHAR(100) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    failed_attempts  INT          NOT NULL DEFAULT 0,
    account_locked   BOOLEAN      NOT NULL DEFAULT FALSE,
    locked_at        DATETIME     NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at       DATETIME     NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id    BIGINT NOT NULL,
    role_id    BIGINT NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(512) NOT NULL UNIQUE,
    user_id     BIGINT       NOT NULL,
    expiry_date DATETIME     NOT NULL,
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS designations (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    title      VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS departments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    manager_id  BIGINT       NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at  DATETIME     NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id                   BIGINT        AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT        UNIQUE,
    first_name           VARCHAR(100)  NOT NULL,
    last_name            VARCHAR(100)  NOT NULL,
    email                VARCHAR(100)  NOT NULL UNIQUE,
    phone                VARCHAR(20)   NULL,
    date_of_birth        DATE          NULL,
    date_of_joining      DATE          NOT NULL,
    salary               DECIMAL(12,2) NULL,
    department_id        BIGINT        NULL,
    designation_id       BIGINT        NULL,
    reporting_manager_id BIGINT        NULL,
    is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
    employment_status    VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    resignation_date     DATE          NULL,
    notice_period_end_date DATE        NULL,
    created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at           DATETIME      NULL,
    CONSTRAINT fk_emp_user    FOREIGN KEY (user_id)              REFERENCES users(id),
    CONSTRAINT fk_emp_dept    FOREIGN KEY (department_id)        REFERENCES departments(id),
    CONSTRAINT fk_emp_desig   FOREIGN KEY (designation_id)       REFERENCES designations(id),
    CONSTRAINT fk_emp_manager FOREIGN KEY (reporting_manager_id) REFERENCES employees(id)
);

ALTER TABLE departments
    ADD CONSTRAINT fk_dept_manager FOREIGN KEY (manager_id) REFERENCES employees(id);

CREATE TABLE IF NOT EXISTS announcements (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    message     TEXT         NOT NULL,
    created_by  BIGINT       NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ann_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50)  NOT NULL,
    entity_id    BIGINT       NULL,
    performed_by VARCHAR(100) NOT NULL,
    details      TEXT         NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manager_notes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT   NOT NULL,
    manager_id  BIGINT   NOT NULL,
    note        TEXT     NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mn_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_mn_manager  FOREIGN KEY (manager_id)  REFERENCES employees(id)
);

INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_MANAGER'), ('ROLE_EMPLOYEE');

INSERT IGNORE INTO designations (title) VALUES
    ('Software Engineer'), ('Senior Engineer'), ('Team Lead'),
    ('Engineering Manager'), ('HR Executive'), ('HR Manager'), ('Director');

-- Admin user password = Admin@123
INSERT IGNORE INTO users (username, email, password, is_active)
VALUES ('admin', 'admin@emp_db.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        TRUE);

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN';
