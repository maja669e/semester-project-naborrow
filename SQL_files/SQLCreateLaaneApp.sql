-- ============================================
-- Låne App Database
-- CREATE TABLES
-- MySQL syntax
-- ============================================

CREATE DATABASE IF NOT EXISTS LaaneApp;
USE LaaneApp;

-- ============================================
-- TABEL: Community
-- Et fællesskab dækker et husnummerinterval på én vej
-- ============================================
CREATE TABLE Community (
    CommunityID         INT             NOT NULL AUTO_INCREMENT,
    CommunityName       VARCHAR(255)    NOT NULL,
    StreetName          VARCHAR(255)    NOT NULL,
    StreetNumberFrom    INT             NOT NULL,
    StreetNumberTo      INT             NOT NULL,
    PostalCode          VARCHAR(10)     NOT NULL,
    City                VARCHAR(100)    NOT NULL,
    PRIMARY KEY (CommunityID)
);

-- ============================================
-- TABEL: Address
-- Et community kan have flere husnumre
-- ============================================
CREATE TABLE Address (
    AddressID       INT             NOT NULL AUTO_INCREMENT,
    CommunityID     INT             NOT NULL,
    StreetNumber    VARCHAR(10)     NOT NULL,
    PRIMARY KEY (AddressID),
    FOREIGN KEY (CommunityID) REFERENCES Community(CommunityID)
);

-- ============================================
-- TABEL: User
-- ApartmentNumber er NULL for huse og rækkehuse
-- Role: 'user' (default) eller 'admin'
-- ============================================
CREATE TABLE User (
    UserID          INT             NOT NULL AUTO_INCREMENT,
    AddressID       INT             NOT NULL,
    FirstName       VARCHAR(100)    NOT NULL,
    LastName        VARCHAR(100)    NOT NULL,
    Username        VARCHAR(100)    NOT NULL,
    Email           VARCHAR(150)    NOT NULL,
    PhoneNumber     VARCHAR(20),
    ApartmentNumber VARCHAR(20),
    Password        VARCHAR(255)    NOT NULL,
    DateOfBirth     DATE            NOT NULL,
    Role            VARCHAR(20)     NOT NULL DEFAULT 'user',
    PRIMARY KEY (UserID),
    UNIQUE (Email),
    FOREIGN KEY (AddressID) REFERENCES Address(AddressID)
);

-- ============================================
-- TABEL: Category
-- ============================================
CREATE TABLE Category (
    CategoryID      INT             NOT NULL AUTO_INCREMENT,
    CategoryName    VARCHAR(100)    NOT NULL,
    PRIMARY KEY (CategoryID)
);

-- ============================================
-- TABEL: Item
-- Condition er et reserveret ord i MySQL - bruger backticks
-- Billeder håndteres via ItemImage tabellen
-- ============================================
CREATE TABLE Item (
    ItemID              INT             NOT NULL AUTO_INCREMENT,
    UserID              INT             NOT NULL,
    CategoryID          INT             NOT NULL,
    ItemName            VARCHAR(150)    NOT NULL,
    Brand               VARCHAR(150),
    `Condition`         VARCHAR(50)     NOT NULL,
    MaxRentPeriodDays   INT             NOT NULL,
    IsActive            BOOLEAN         NOT NULL DEFAULT TRUE,
    CreatedAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ItemID),
    FOREIGN KEY (UserID)        REFERENCES User(UserID),
    FOREIGN KEY (CategoryID)    REFERENCES Category(CategoryID)
);

-- ============================================
-- TABEL: ItemImage
-- IsPrimary = TRUE markerer hovedbilledet
-- ============================================
CREATE TABLE ItemImage (
    ImageID         INT             NOT NULL AUTO_INCREMENT,
    ItemID          INT             NOT NULL,
    ImageURL        LONGTEXT	    NOT NULL,
    IsPrimary       BOOLEAN         NOT NULL DEFAULT FALSE,
    PRIMARY KEY (ImageID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID) ON DELETE CASCADE
);

-- ============================================
-- TABEL: ItemAccessory
-- ============================================
CREATE TABLE ItemAccessory (
    AccessoryID     INT             NOT NULL AUTO_INCREMENT,
    ItemID          INT             NOT NULL,
    AccessoryName   VARCHAR(150)    NOT NULL,
    PRIMARY KEY (AccessoryID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID) ON DELETE CASCADE
);

-- ============================================
-- TABEL: RentalRequest
-- En bruger sender en låneanmodning på en genstand
-- ============================================
CREATE TABLE RentalRequest (
    RentalRequestID INT             NOT NULL AUTO_INCREMENT,
    ItemID          INT             NOT NULL,
    RenterUserID    INT             NOT NULL,
    StartDate       DATE            NOT NULL,
    EndDate         DATE            NOT NULL,
    Status          VARCHAR(50)     NOT NULL DEFAULT 'pending',
    PRIMARY KEY (RentalRequestID),
    FOREIGN KEY (ItemID)        REFERENCES Item(ItemID) ON DELETE CASCADE,
    FOREIGN KEY (RenterUserID)  REFERENCES User(UserID)
);

-- ============================================
-- TABEL: Rental
-- Oprettes når en RentalRequest godkendes
-- ============================================
CREATE TABLE Rental (
    RentalID        INT             NOT NULL AUTO_INCREMENT,
    RequestID       INT             NOT NULL,
    Status          VARCHAR(50)     NOT NULL,
    PRIMARY KEY (RentalID),
    FOREIGN KEY (RequestID) REFERENCES RentalRequest(RentalRequestID)
);

-- ============================================
-- TABEL: Message
-- Beskeder tilknyttet et aktivt lån
-- ============================================
CREATE TABLE Message (
    MessageID       INT             NOT NULL AUTO_INCREMENT,
    SenderUserID    INT             NOT NULL,
    ReceiverUserID  INT             NOT NULL,
    RentalID        INT             NOT NULL,
    MessageText     VARCHAR(1000)   NOT NULL,
    SentAt          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsRead          BOOLEAN         NOT NULL DEFAULT FALSE,
    EditedAt        DATETIME        NULL,
    PRIMARY KEY (MessageID),
    FOREIGN KEY (SenderUserID)      REFERENCES User(UserID),
    FOREIGN KEY (ReceiverUserID)    REFERENCES User(UserID),
    FOREIGN KEY (RentalID)          REFERENCES Rental(RentalID)
);

-- ============================================
-- TABEL: Rating
-- En bruger kan give en bedømmelse efter et afsluttet lån
-- ============================================
CREATE TABLE Rating (
    RatingID        INT             NOT NULL AUTO_INCREMENT,
    RentalID        INT             NOT NULL,
    RaterUserID     INT             NOT NULL,
    Rating          INT             NOT NULL,
    PRIMARY KEY (RatingID),
    FOREIGN KEY (RentalID)      REFERENCES Rental(RentalID),
    FOREIGN KEY (RaterUserID)   REFERENCES User(UserID)
);
