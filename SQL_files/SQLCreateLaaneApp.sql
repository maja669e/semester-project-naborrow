-- ============================================
-- Låne App Database
-- CREATE TABLES
-- MySQL syntax
-- ============================================

CREATE DATABASE IF NOT EXISTS låneApp;
USE LåneApp;

-- ============================================
-- TABEL: Community
-- ============================================
CREATE TABLE Community (
    CommunityID     INT             NOT NULL AUTO_INCREMENT,
    CommunityName   VARCHAR(255)    NOT NULL,
    StreetAddress   VARCHAR(255)    NOT NULL,
    PostalCode      VARCHAR(10)     NOT NULL,
    City            VARCHAR(100)    NOT NULL,
    PRIMARY KEY (CommunityID)
);

-- ============================================
-- TABEL: User
-- ============================================
CREATE TABLE User (
    UserID          INT             NOT NULL AUTO_INCREMENT,
    CommunityID     INT             NOT NULL,
    FirstName       VARCHAR(100)    NOT NULL,
    LastName        VARCHAR(100)    NOT NULL,
    Username        VARCHAR(100)    NOT NULL,
    Email           VARCHAR(150)    NOT NULL,
    PhoneNumber     VARCHAR(20),
    ApartmentNumber VARCHAR(20)     NOT NULL,
    Password        VARCHAR(255)    NOT NULL,
    DateOfBirth     DATE            NOT NULL,
    PRIMARY KEY (UserID),
    UNIQUE (Email),
    FOREIGN KEY (CommunityID) REFERENCES Community(CommunityID)
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
-- Picture kolonne er fjernet - billeder haandteres via ItemImage
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
    FOREIGN KEY (UserID)     REFERENCES User(UserID),
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID)
);

-- ============================================
-- TABEL: ItemImage
-- IsPrimary = TRUE markerer hovedbilledet
-- ============================================
CREATE TABLE ItemImage (
    ImageID         INT             NOT NULL AUTO_INCREMENT,
    ItemID          INT             NOT NULL,
    ImageURL        VARCHAR(255)    NOT NULL,
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
-- TABEL: Rental
-- ============================================
CREATE TABLE Rental (
    RentalID        INT             NOT NULL AUTO_INCREMENT,
    ItemID          INT             NOT NULL,
    RenterUserID    INT             NOT NULL,
    StartDate       DATE            NOT NULL,
    EndDate         DATE            NOT NULL,
    Status          VARCHAR(50)     NOT NULL DEFAULT 'pending',
    PRIMARY KEY (RentalID),
    FOREIGN KEY (ItemID)        REFERENCES Item(ItemID) ON DELETE CASCADE,
    FOREIGN KEY (RenterUserID)  REFERENCES User(UserID)
);
