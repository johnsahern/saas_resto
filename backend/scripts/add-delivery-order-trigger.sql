DELIMITER $$

CREATE TRIGGER after_delivery_update
AFTER UPDATE ON deliveries
FOR EACH ROW
BEGIN
  IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
    UPDATE orders SET status = 'delivered' WHERE id = NEW.order_id;
  END IF;
END$$

DELIMITER ; 