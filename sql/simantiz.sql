/*
 Navicat MySQL Data Transfer
 
 Source Server         : Lokal
 Source Server Version : 100122
 Source Host           : localhost:3306
 Source Database       : simantiz
 
 Target Server Type    : MYSQL
 Target Server Version : 100122
 File Encoding         : 65001
 
 Date: 2018-05-31 15:39:05
 */
-- Disable foreign key checks to avoid issues when creating tables
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for game_history
-- ----------------------------
DROP TABLE IF EXISTS `game_history`;

CREATE TABLE `game_history` (
  `history_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `room_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `playing_at` date NOT NULL,
  `initial_balance` float(20, 2) DEFAULT '0.00',
  `balance` float(20, 2) DEFAULT '0.00',
  `tot_clororo_sold` bigint(20) DEFAULT '0',
  `tot_price_clororo_sold` float(20, 0) DEFAULT '0',
  `tot_cash_inflow` float DEFAULT '0',
  `buy_warehouse_unit` bigint(20) DEFAULT '0',
  `buy_warehouse_price` float(20, 2) DEFAULT '0.00',
  `buy_warehouse_tot_price` float(20, 2) DEFAULT '0.00',
  `dep_warehouse_price` float(10, 2) DEFAULT '0.00',
  `dep_warehouse_tot_price` float(10, 2) DEFAULT '0.00',
  `buy_handling_equipment_unit` bigint(20) DEFAULT '0',
  `buy_handling_equipment_price` float(20, 2) DEFAULT '0.00',
  `buy_handling_equipment_tot_price` float(20, 2) DEFAULT '0.00',
  `dep_handling_equipment_price` float(10, 2) DEFAULT '0.00',
  `dep_handling_equipment_tot_price` float(10, 2) DEFAULT '0.00',
  `buy_factory_unit` bigint(20) DEFAULT '0',
  `buy_factory_price` float(20, 2) DEFAULT '0.00',
  `buy_factory_tot_price` float(20, 2) DEFAULT '0.00',
  `dep_factory_price` float(10, 2) DEFAULT '0.00',
  `dep_factory_tot_price` float(10, 2) DEFAULT '0.00',
  `buy_big_machine_unit` bigint(20) DEFAULT '0',
  `buy_big_machine_price` float(20, 2) DEFAULT '0.00',
  `buy_big_machine_tot_price` float(20, 2) DEFAULT '0.00',
  `dep_big_machine_price` float(10, 2) DEFAULT '0.00',
  `dep_big_machine_tot_price` float(10, 2) DEFAULT '0.00',
  `buy_small_machine_unit` bigint(20) DEFAULT '0',
  `buy_small_machine_price` float(20, 2) DEFAULT '0.00',
  `buy_small_machine_tot_price` float(20, 2) DEFAULT '0.00',
  `dep_small_machine_price` float(10, 2) DEFAULT '0.00',
  `dep_small_machine_tot_price` float(10, 2) DEFAULT '0.00',
  `buy_worker_unit` bigint(20) DEFAULT '0',
  `buy_worker_price` float(20, 2) DEFAULT '0.00',
  `buy_worker_tot_price` float(20, 2) DEFAULT '0.00',
  `buy_agent_unit` bigint(20) DEFAULT '0',
  `buy_agent_price` float(20, 2) DEFAULT '0.00',
  `buy_agent_tot_price` float(20, 2) DEFAULT '0.00',
  `buy_salesman_unit` bigint(20) DEFAULT '0',
  `buy_salesman_price` float(20, 2) DEFAULT '0.00',
  `buy_salesman_tot_price` float(20, 2) DEFAULT '0.00',
  `buy_prd_packet` bigint(20) DEFAULT '0',
  `buy_prd_price` float(10, 2) DEFAULT '0.00',
  `buy_sip_packet` bigint(20) DEFAULT '0',
  `buy_sip_price` float(10, 2) DEFAULT '0.00',
  `buy_qap_packet` bigint(20) DEFAULT '0',
  `buy_qap_price` float(10, 2) DEFAULT '0.00',
  `buy_edp_packet` bigint(20) DEFAULT '0',
  `buy_edp_price` float(10, 2) DEFAULT '0.00',
  `buy_mrp_packet` bigint(20) DEFAULT '0',
  `buy_mrp_price` float(10, 2) DEFAULT '0.00',
  `buy_pp_packet` bigint(20) DEFAULT '0',
  `buy_pp_price` float(10, 2) DEFAULT '0.00',
  `buy_ssp_packet` bigint(20) DEFAULT '0',
  `buy_ssp_price` float(10, 2) DEFAULT '0.00',
  `buy_raw_material_lot` bigint(20) DEFAULT '0',
  `buy_raw_material_price` float(10, 2) DEFAULT '0.00',
  `buy_raw_material_tot_price` float(10, 2) DEFAULT '0.00',
  `join_bid_total` bigint(20) DEFAULT '0',
  `join_bid_price` float(10, 2) DEFAULT '0.00',
  `join_bid_tot_price` float(10, 2) DEFAULT '0.00',
  `buy_auto_process` bigint(20) DEFAULT '0',
  `buy_auto_process_price` float(10, 2) DEFAULT '0.00',
  `buy_auto_process_tot_price` float(10, 2) DEFAULT '0.00',
  `personal_administration_cost` float(10, 2) DEFAULT '0.00',
  `tot_cash_outflow` float DEFAULT '0',
  `pre_production_lot` bigint(20) DEFAULT '0',
  `pre_production_price` float(10, 2) DEFAULT '0.00',
  `pre_production_tot_price` float(10, 2) DEFAULT '0.00',
  `production_lot` bigint(20) DEFAULT '0',
  `production_price` float(10, 2) DEFAULT '0.00',
  `production_tot_price` float(10, 2) DEFAULT '0.00',
  `post_production_lot` bigint(20) DEFAULT '0',
  `post_production_price` float(10, 2) DEFAULT '0.00',
  `post_production_tot_price` float(10, 2) DEFAULT '0.00',
  `cost_of_goods_sold` float DEFAULT '0',
  `gross_profit` float DEFAULT '0',
  `tot_marketing_expenses` float DEFAULT '0',
  `tot_admin_overhead` float DEFAULT '0',
  `net_profit` float DEFAULT '0',
  `cdm_ratio` float DEFAULT NULL,
  `return_equity` float DEFAULT NULL,
  PRIMARY KEY (`history_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = latin1;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` varchar(255) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `user_country` varchar(255) DEFAULT NULL,
  `user_created_ip` varchar(255) DEFAULT NULL,
  `user_last_ip` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = latin1;

-- Ensure proper delimiter for creating functions
DELIMITER $$

-- ----------------------------
-- Function to calculate CdmRatioPoint
-- ----------------------------
DROP FUNCTION IF EXISTS `getCdmRatioPoint`$$
CREATE FUNCTION `getCdmRatioPoint`(id_user VARCHAR(225), tgl VARCHAR(255)) RETURNS bigint(20)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE num BIGINT DEFAULT 0;
    DECLARE rn INT DEFAULT 0;

    -- Use a cursor to calculate row number
    DECLARE done INT DEFAULT 0;
    DECLARE cur_user_id VARCHAR(255);
    DECLARE cur CURSOR FOR
        SELECT tb.user_id
        FROM game_history tb
        WHERE tb.playing_at = tgl
        GROUP BY tb.user_id
        ORDER BY cdm_ratio DESC;

    -- Handler for when there are no more rows
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    SET rn = 0;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO cur_user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Increment row number
        SET rn = rn + 1;

        -- Check if current user matches the input user ID
        IF cur_user_id = id_user THEN
            SET num = IF(rn > 10, 0, 11 - rn);
            LEAVE read_loop;
        END IF;
    END LOOP;

    CLOSE cur;

    RETURN num;
END$$

-- ----------------------------
-- Function to calculate ReturnInvestPoint
-- ----------------------------
DROP FUNCTION IF EXISTS `getReturnInvestPoint`$$
CREATE FUNCTION `getReturnInvestPoint`(id_user VARCHAR(225), tgl VARCHAR(255)) RETURNS bigint(20)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE num BIGINT DEFAULT 0;
    DECLARE rn INT DEFAULT 0;

    -- Use a cursor to calculate row number
    DECLARE done INT DEFAULT 0;
    DECLARE cur_user_id VARCHAR(255);
    DECLARE cur CURSOR FOR
        SELECT tb.user_id
        FROM game_history tb
        WHERE tb.playing_at = tgl
        GROUP BY tb.user_id
        ORDER BY return_equity DESC;

    -- Handler for when there are no more rows
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    SET rn = 0;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO cur_user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Increment row number
        SET rn = rn + 1;

        -- Check if current user matches the input user ID
        IF cur_user_id = id_user THEN
            SET num = IF(rn > 10, 0, 11 - rn);
            LEAVE read_loop;
        END IF;
    END LOOP;

    CLOSE cur;

    RETURN num;
END$$

-- ----------------------------
-- Function to calculate SalesRevenuePoint
-- ----------------------------
DROP FUNCTION IF EXISTS `getSalesRevenuePoint`$$
CREATE FUNCTION `getSalesRevenuePoint`(id_user VARCHAR(225), tgl VARCHAR(255)) RETURNS bigint(20)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE num BIGINT DEFAULT 0;
    DECLARE rn INT DEFAULT 0;

    -- Use a cursor to calculate row number
    DECLARE done INT DEFAULT 0;
    DECLARE cur_user_id VARCHAR(255);
    DECLARE cur CURSOR FOR
        SELECT tb.user_id
        FROM game_history tb
        WHERE tb.playing_at = tgl
        GROUP BY tb.user_id
        ORDER BY tot_price_clororo_sold DESC;

    -- Handler for when there are no more rows
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    SET rn = 0;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO cur_user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Increment row number
        SET rn = rn + 1;

        -- Check if current user matches the input user ID
        IF cur_user_id = id_user THEN
            SET num = IF(rn > 10, 0, 11 - rn);
            LEAVE read_loop;
        END IF;
    END LOOP;

    CLOSE cur;

    RETURN num;
END$$

-- ----------------------------
-- Function to calculate SalesUnitPoint
-- ----------------------------
DROP FUNCTION IF EXISTS `getSalesUnitPoint`$$
CREATE FUNCTION `getSalesUnitPoint`(id_user VARCHAR(225), tgl VARCHAR(255)) RETURNS bigint(20)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE num BIGINT DEFAULT 0;
    DECLARE rn INT DEFAULT 0;

    -- Use a cursor to calculate row number
    DECLARE done INT DEFAULT 0;
    DECLARE cur_user_id VARCHAR(255);
    DECLARE cur CURSOR FOR
        SELECT tb.user_id
        FROM game_history tb
        WHERE tb.playing_at = tgl
        GROUP BY tb.user_id
        ORDER BY tot_clororo_sold DESC;

    -- Handler for when there are no more rows
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    SET rn = 0;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO cur_user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Increment row number
        SET rn = rn + 1;

        -- Check if current user matches the input user ID
        IF cur_user_id = id_user THEN
            SET num = IF(rn > 10, 0, 11 - rn);
            LEAVE read_loop;
        END IF;
    END LOOP;

    CLOSE cur;

    RETURN num;
END$$

-- Restore the default delimiter
DELIMITER ;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;