-- Create restaurant_managers table
CREATE TABLE IF NOT EXISTS restaurant_managers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    restaurant_id VARCHAR(36),
    restaurant_code VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Create index for faster lookups
CREATE INDEX idx_restaurant_managers_user ON restaurant_managers(user_id);
CREATE INDEX idx_restaurant_managers_restaurant ON restaurant_managers(restaurant_id);
CREATE INDEX idx_restaurant_managers_code ON restaurant_managers(restaurant_code);

-- Create trigger for updating timestamp
CREATE TRIGGER update_restaurant_managers_updated_at
    BEFORE UPDATE ON restaurant_managers
    FOR EACH ROW
    SET NEW.updated_at = CURRENT_TIMESTAMP;

-- Create trigger for inserting UUID
DELIMITER //
CREATE TRIGGER before_insert_restaurant_managers
    BEFORE INSERT ON restaurant_managers
    FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END//
DELIMITER ; 