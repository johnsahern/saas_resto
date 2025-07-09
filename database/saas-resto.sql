-- =======================================================================
-- 🏪 SAAS RESTO - TOUTES LES 39 TABLES SUPABASE
-- =======================================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS saas_resto;
CREATE DATABASE saas_resto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saas_resto;

-- Table SaaS Users
CREATE TABLE saas_users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table: restaurants
CREATE TABLE restaurants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    logo TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    whatsapp_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

) ENGINE=InnoDB;

-- Table: active_orders
CREATE TABLE active_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(255),
    table_id VARCHAR(36),
    items JSON,
    total_amount INT,
    status VARCHAR(255),
    customer_name VARCHAR(255),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    restaurant_id VARCHAR(36)

) ENGINE=InnoDB;

-- Table: billing_orders
CREATE TABLE billing_orders (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(255),
    customer_name VARCHAR(255),
    table_id VARCHAR(36),
    items JSON,
    total_amount INT,
    served_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    original_order_id VARCHAR(36),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: daily_sales
CREATE TABLE daily_sales (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    sale_date DATE,
    total_revenue DECIMAL(10, 2),
    total_orders INT,
    average_order_value DECIMAL(10, 2),
    customers_served INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: deliveries
CREATE TABLE deliveries (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36),
    delivery_person_id VARCHAR(36),
    status VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    estimated_time TIME,
    actual_delivery_time TIME,
    distance TEXT,
    fee TEXT,
    coordinates TEXT,
    notes TEXT,
    restaurant_id VARCHAR(36)

) ENGINE=InnoDB;

-- Table: delivery_persons
CREATE TABLE delivery_persons (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(20),
    available BOOLEAN DEFAULT FALSE,
    current_location JSON,
    rating DECIMAL(10, 2)
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: delivery_settings (vide mais créée)
CREATE TABLE delivery_settings (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: dish_categories
CREATE TABLE dish_categories (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    display_order INT,
    is_active BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: inventory
CREATE TABLE inventory (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    item_name VARCHAR(255),
    current_stock INT,
    minimum_stock INT,
    unit VARCHAR(255),
    cost_per_unit INT,
    supplier_id VARCHAR(36),
    last_updated DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: loyalty_customers
CREATE TABLE loyalty_customers (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    points INT,
    total_spent INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_visit VARCHAR(255)
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: loyalty_rewards
CREATE TABLE loyalty_rewards (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    points_cost INT,
    valid_until TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: loyalty_transactions (vide mais créée)
CREATE TABLE loyalty_transactions (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: menu_categories
CREATE TABLE menu_categories (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: menu_dishes
CREATE TABLE menu_dishes (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    category VARCHAR(255),
    image_url TEXT,
    is_available BOOLEAN DEFAULT FALSE,
    preparation_time TIME,
    ingredients TEXT,
    allergens TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: menu_items (vide mais créée)
CREATE TABLE menu_items (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: notification_settings
CREATE TABLE notification_settings (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    new_orders BOOLEAN DEFAULT FALSE,
    order_status BOOLEAN DEFAULT FALSE,
    new_reservations BOOLEAN DEFAULT FALSE,
    low_stock BOOLEAN DEFAULT FALSE,
    daily_report BOOLEAN DEFAULT FALSE,
    marketing BOOLEAN DEFAULT FALSE,
    sound_enabled BOOLEAN DEFAULT FALSE
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: opening_hours (vide mais créée)
CREATE TABLE opening_hours (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: order_cancellations (vide mais créée)
CREATE TABLE order_cancellations (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: order_items
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36),
    name VARCHAR(255),
    quantity INT,
    price INT,
    options JSON,
    restaurant_id VARCHAR(36)

) ENGINE=InnoDB;

-- Table: orders
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(255),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    total_amount INT,
    status VARCHAR(255),
    type VARCHAR(50) DEFAULT 'dine-in',
    notes TEXT,
    created_by VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    estimated_delivery_time TIME,
    actual_delivery_time TIME,
    delivery_partner_id VARCHAR(36),
    restaurant_id VARCHAR(36),
    table_id VARCHAR(36),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table: payment_methods (vide mais créée)
CREATE TABLE payment_methods (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: reservations
CREATE TABLE reservations (
    id VARCHAR(36) PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    date DATE,
    time TIME,
    party_size INT,
    status VARCHAR(255),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    restaurant_id VARCHAR(36)

) ENGINE=InnoDB;

-- Table: restaurant_menus
CREATE TABLE restaurant_menus (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price INT,
    category VARCHAR(255),
    is_available BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    restaurant_id VARCHAR(36)

) ENGINE=InnoDB;

-- Table: restaurant_settings
CREATE TABLE restaurant_settings (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    logo TEXT,
    opening_hours JSON,
    social_media JSON,
    delivery_settings JSON,
    payment_methods JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    restaurant_id VARCHAR(36)

) ENGINE=InnoDB;

-- Table: restaurant_tables
CREATE TABLE restaurant_tables (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    table_number INT,
    capacity INT,
    status VARCHAR(255),
    position_x INT,
    position_y INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: restaurant_users (vide mais créée)
CREATE TABLE restaurant_users (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: sales_reports
CREATE TABLE sales_reports (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    report_date DATE,
    total_sales INT,
    total_orders INT,
    average_order_value INT,
    top_selling_items JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: social_media (vide mais créée)
CREATE TABLE social_media (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: staff_attendance
CREATE TABLE staff_attendance (
    id VARCHAR(36) PRIMARY KEY,
    staff_member_id VARCHAR(36),
    attendance_date DATE,
    clock_in_time TIME,
    clock_out_time TIME,
    break_start_time TIME,
    break_end_time TIME,
    status VARCHAR(255),
    total_hours INT,
    overtime_hours TIME,
    notes TEXT,
    approved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    restaurant_id VARCHAR(36)

) ENGINE=InnoDB;

-- Table: staff_leave_requests (vide mais créée)
CREATE TABLE staff_leave_requests (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: staff_members
CREATE TABLE staff_members (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    employee_number VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(255),
    department TEXT,
    hire_date DATE,
    salary INT,
    hourly_rate TEXT,
    status VARCHAR(255),
    shift_type VARCHAR(255),
    emergency_contact_name TEXT,
    emergency_contact_phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: staff_schedules (vide mais créée)
CREATE TABLE staff_schedules (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: stock_additions
CREATE TABLE stock_additions (
    id VARCHAR(36) PRIMARY KEY,
    inventory_id VARCHAR(36),
    date DATE,
    quantity INT,
    notes TEXT,
    created_by TEXT,
    restaurant_id VARCHAR(36)

) ENGINE=InnoDB;

-- Table: stock_alerts (vide mais créée)
CREATE TABLE stock_alerts (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: stock_withdrawals
CREATE TABLE stock_withdrawals (
    id VARCHAR(36) PRIMARY KEY,
    inventory_item_id VARCHAR(36),
    quantity INT,
    withdrawal_date DATE,
    withdrawal_time TIME,
    notes TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    restaurant_id VARCHAR(36)

) ENGINE=InnoDB;

-- Table: suppliers
CREATE TABLE suppliers (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: system_alerts (vide mais créée)
CREATE TABLE system_alerts (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: user_profiles
CREATE TABLE user_profiles (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(255),
    avatar VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login VARCHAR(255)
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table: user_roles (vide mais créée)
CREATE TABLE user_roles (
    restaurant_id VARCHAR(36) NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Données de test
INSERT INTO restaurants (id, name, description, logo, address, phone, email, website, whatsapp_number, created_at) VALUES 
('saas-resto-demo-id', 'SaaS Resto Demo', 'Restaurant avec toutes les fonctionnalités', NULL, 
 '123 Rue Complète, Paris', '+33123456789', 'admin@saas-resto.com', 
 NULL, NULL, NOW());

INSERT INTO saas_users VALUES 
('demo-owner-id', 'admin@saas-resto.com', '$2b$10$DEMO', 'Admin', 'SaaS Resto', '+33123456789', TRUE, NOW());

SET FOREIGN_KEY_CHECKS = 1;
