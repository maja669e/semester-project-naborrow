DROP DATABASE IF EXISTS LaaneApp;
CREATE DATABASE LaaneApp;
USE LaaneApp;

-- Opslagstabel: ét postnummer -> én by. Oprettes foer Community,
-- da Community refererer den.
CREATE TABLE PostalCode (
    PostalCode      VARCHAR(10)     NOT NULL,
    City            VARCHAR(100)    NOT NULL,
    PRIMARY KEY (PostalCode)
);

-- AdminUserID er NULL til at starte med grundet cirkulaer afhaengighed:
-- Community -> User -> Address -> Community
-- Vi tilfoejer FK + UNIQUE bagefter med ALTER TABLE
CREATE TABLE Community (
    CommunityID         INT             NOT NULL AUTO_INCREMENT,
    AdminUserID         INT             NULL,
    PostalCode          VARCHAR(10)     NOT NULL,
    CommunityName       VARCHAR(255)    NOT NULL,
    StreetName          VARCHAR(255)    NOT NULL,
    StreetNumberFrom    INT             NOT NULL,
    StreetNumberTo      INT             NOT NULL,
    PRIMARY KEY (CommunityID),
    FOREIGN KEY (PostalCode) REFERENCES PostalCode(PostalCode)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE Address (
    AddressID       INT             NOT NULL AUTO_INCREMENT,
    CommunityID     INT             NOT NULL,
    StreetNumber    VARCHAR(10)     NOT NULL,
    PRIMARY KEY (AddressID),
    FOREIGN KEY (CommunityID) REFERENCES Community(CommunityID)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

-- User: identitet + adresse-tilknytning + medlemskabsstatus.
-- ApprovedByID er en self-FK: den admin der godkendte beboeren.
CREATE TABLE User (
    UserID           INT             NOT NULL AUTO_INCREMENT,
    AddressID        INT             NOT NULL,
    ApprovedByID     INT             NULL,
    FirstName        VARCHAR(100)    NOT NULL,
    LastName         VARCHAR(100)    NOT NULL,
    Username         VARCHAR(100)    NOT NULL,
    Email            VARCHAR(150)    NOT NULL,
    PhoneNumber      VARCHAR(20),
    ApartmentNumber  VARCHAR(20),
    DateOfBirth      DATE            NOT NULL,
    Role             VARCHAR(20)     NOT NULL DEFAULT 'user',
    MembershipStatus VARCHAR(20)     NOT NULL DEFAULT 'pending',
    CreatedAt        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID),
    UNIQUE (Email),
    UNIQUE (Username),
    CONSTRAINT chk_role
        CHECK (Role IN ('user','admin')),
    CONSTRAINT chk_membership_status
        CHECK (MembershipStatus IN ('pending','approved','rejected')),
    FOREIGN KEY (AddressID) REFERENCES Address(AddressID)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (ApprovedByID) REFERENCES User(UserID)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- Tilfoej FK + UNIQUE til Community nu hvor User eksisterer
ALTER TABLE Community
    ADD CONSTRAINT fk_community_admin
    FOREIGN KEY (AdminUserID) REFERENCES User(UserID)
        ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE Community
    ADD CONSTRAINT uq_community_admin UNIQUE (AdminUserID);

CREATE TABLE Login (
    LoginID         INT             NOT NULL AUTO_INCREMENT,
    UserID          INT             NOT NULL,
    PasswordHash    VARCHAR(255)    NOT NULL,
    PRIMARY KEY (LoginID),
    UNIQUE (UserID),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Category (
    CategoryID      INT             NOT NULL AUTO_INCREMENT,
    CategoryName    VARCHAR(100)    NOT NULL,
    PRIMARY KEY (CategoryID)
);

CREATE TABLE Item (
    ItemID              INT             NOT NULL AUTO_INCREMENT,
    UserID              INT             NOT NULL,
    CategoryID          INT             NOT NULL,
    ItemName            VARCHAR(150)    NOT NULL,
    Brand               VARCHAR(150),
    `Condition`         VARCHAR(50)     NOT NULL,
    MaxRentPeriodDays   INT             NOT NULL,
    IsActive            BOOLEAN         NOT NULL DEFAULT TRUE,
    IsDeleted           BOOLEAN         NOT NULL DEFAULT FALSE,
    DeletedAt           DATETIME        NULL,
    CreatedAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ItemID),
    CONSTRAINT chk_max_rent_days CHECK (MaxRentPeriodDays > 0),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE ItemImage (
    ImageID         INT             NOT NULL AUTO_INCREMENT,
    ItemID          INT             NOT NULL,
    ImageURL        LONGTEXT        NOT NULL,
    IsPrimary       BOOLEAN         NOT NULL DEFAULT FALSE,
    PRIMARY KEY (ImageID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE ItemAccessory (
    AccessoryID     INT             NOT NULL AUTO_INCREMENT,
    ItemID          INT             NOT NULL,
    AccessoryName   VARCHAR(150)    NOT NULL,
    PRIMARY KEY (AccessoryID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE RentalRequest (
    RentalRequestID     INT             NOT NULL AUTO_INCREMENT,
    ItemID              INT             NOT NULL,
    RenterUserID        INT             NOT NULL,
    StartDate           DATE            NOT NULL,
    EndDate             DATE            NOT NULL,
    Status              VARCHAR(20)     NOT NULL DEFAULT 'pending',
    MessageToLender     TEXT            NULL,
    SelectedAccessories TEXT            NULL,
    PickupTimes         TEXT            NULL,
    PRIMARY KEY (RentalRequestID),
    CONSTRAINT chk_request_status
        CHECK (Status IN ('pending','approved','rejected','cancelled')),
    CONSTRAINT chk_request_dates
        CHECK (EndDate >= StartDate),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (RenterUserID) REFERENCES User(UserID)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

-- UNIQUE paa RequestID: en anmodning kan blive til hoejst ét laan (1:0..1)
CREATE TABLE Rental (
    RentalID        INT             NOT NULL AUTO_INCREMENT,
    RequestID       INT             NOT NULL,
    Status          VARCHAR(20)     NOT NULL,
    PRIMARY KEY (RentalID),
    UNIQUE (RequestID),
    CONSTRAINT chk_rental_status
        CHECK (Status IN ('active','completed','cancelled')),
    FOREIGN KEY (RequestID) REFERENCES RentalRequest(RentalRequestID)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE Message (
    MessageID       INT             NOT NULL AUTO_INCREMENT,
    SenderUserID    INT             NOT NULL,
    ReceiverUserID  INT             NOT NULL,
    RentalID        INT             NOT NULL,
    MessageText     VARCHAR(1000)   NOT NULL,
    SentAt          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsRead          BOOLEAN         NOT NULL DEFAULT FALSE,
    EditedAt        DATETIME        NULL,
    IsDeleted       BOOLEAN         NOT NULL DEFAULT FALSE,
    DeletedAt       DATETIME        NULL,
    PRIMARY KEY (MessageID),
    FOREIGN KEY (SenderUserID) REFERENCES User(UserID)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (ReceiverUserID) REFERENCES User(UserID)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (RentalID) REFERENCES Rental(RentalID)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE Rating (
    RatingID        INT             NOT NULL AUTO_INCREMENT,
    RentalID        INT             NOT NULL,
    RaterUserID     INT             NOT NULL,
    RatedUserID     INT             NOT NULL,
    RatingScore     INT             NOT NULL,
    PRIMARY KEY (RatingID),
    CONSTRAINT chk_rating_score CHECK (RatingScore BETWEEN 1 AND 5),
    FOREIGN KEY (RentalID) REFERENCES Rental(RentalID)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (RaterUserID) REFERENCES User(UserID)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (RatedUserID) REFERENCES User(UserID)
        ON UPDATE CASCADE ON DELETE NO ACTION
);
