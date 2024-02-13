SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

-- -----------------------------------------------------
-- Table `Flags`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Flags`;
CREATE TABLE `Flags` (
  `flagID` INT NOT NULL AUTO_INCREMENT,
  `flagName` VARCHAR(45) NOT NULL UNIQUE,
  `flagImageURL` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`flagID`)
) ENGINE = InnoDB;

INSERT INTO Flags (flagName, flagImageURL)
VALUES
("India", '/css/Assets/india.png'),
("Ireland", '/css/Assets/ireland.png'), 
("Italy", '/css/Assets/italy.png'),
("Jamaica", '/css/Assets/jamaica.png'),
("Japan", '/css/Assets/japan.png');

-- -----------------------------------------------------
-- Table `Countries`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Countries`;
CREATE TABLE `Countries` (
  `countryID` INT NOT NULL AUTO_INCREMENT,
  `countryName` VARCHAR(200) NOT NULL UNIQUE,
  `Flags_flagID` INT,
  PRIMARY KEY (`countryID`),
  INDEX `fk_Countries_Flags1_idx` (`Flags_flagID` ASC) VISIBLE,
  CONSTRAINT `fk_Countries_Flags1`
    FOREIGN KEY (`Flags_flagID`) REFERENCES `Flags` (`flagID`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB;

INSERT INTO Countries (countryName, Flags_flagID)
VALUES
("India", (SELECT flagID FROM Flags WHERE flagName = "India")),
("Ireland*", (SELECT flagID FROM Flags WHERE flagName = "Ireland")),
("Italy", (SELECT flagID FROM Flags WHERE flagName = "Italy"));

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
