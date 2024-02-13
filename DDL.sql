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
("Irish Flag", '/public/css/Assets/ireland.png'), 
("Italian Flag", '/public/css/Assets/italy.png');

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
("Ireland", (SELECT flagID FROM Flags WHERE flagName = "Irish Flag")),
("Italy", (SELECT flagID FROM Flags WHERE flagName = "Italian Flag"));

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
