-- ============================================
-- Låne App Database
-- INSERT MOCK DATA
-- MySQL syntax
-- ============================================

USE LaaneApp;

-- ============================================
-- INSERT: Community
-- Elmevej 4 er et enkelt lejlighedskompleks
-- ============================================
INSERT INTO Community (CommunityName, StreetName, StreetNumberFrom, StreetNumberTo, PostalCode, City)
VALUES ('Elmevej Kollegium', 'Elmevej', 4, 4, '2300', 'København S');

-- ============================================
-- INSERT: Address
-- Elmevej 4 er det eneste husnummer i dette community
-- ============================================
INSERT INTO Address (CommunityID, StreetNumber)
VALUES (1, '4');

-- ============================================
-- INSERT: Users
-- Lars Hansen er admin
-- ApartmentNumber er NULL for huse/rækkehuse
-- ============================================
INSERT INTO User (AddressID, FirstName, LastName, Username, Email, PhoneNumber, ApartmentNumber, Password, DateOfBirth, Role)
VALUES
(1, 'Lars',    'Hansen',       'L. Hansen',       'lars.hansen@mail.dk',      '20345678', '2tv',  'password123', '1998-03-12', 'admin'),
(1, 'Sofie',   'Andersen',     'S. Andersen',     'sofie.andersen@mail.dk',   '31456789', '3th',  'password123', '2001-07-22', 'user'),
(1, 'Mikkel',  'Christensen',  'M. Christensen',  'mikkel.c@mail.dk',         '40567890', '1tv',  'password123', '1995-11-05', 'user'),
(1, 'Emma',    'Pedersen',     'E. Pedersen',     'emma.pedersen@mail.dk',    '51678901', '2th',  'password123', '2000-04-18', 'user'),
(1, 'Jonas',   'Nielsen',      'J. Nielsen',      'jonas.nielsen@mail.dk',    '60789012', '1mf',  'password123', '1997-09-30', 'user'),
(1, 'Camilla', 'Møller',       'C. Moller',       'camilla.m@mail.dk',        '71890123', '4tv',  'password123', '2003-01-14', 'user'),
(1, 'Thomas',  'Kjær',         'T. Kjaer',        'thomas.kjaer@mail.dk',     '82901234', '1th',  'password123', '1988-06-25', 'user'),
(1, 'Nadia',   'Poulsen',      'N. Poulsen',      'nadia.p@mail.dk',          '35234567', '3tv',  'password123', '1990-05-17', 'user');

-- ============================================
-- INSERT: Categories
-- ============================================
INSERT INTO Category (CategoryName)
VALUES
('Værktøj'),
('Køkkenudstyr'),
('Sport og Fritid'),
('Elektronik'),
('Haveudstyr');

-- ============================================
-- INSERT: Items
-- Condition er et reserveret ord - bruger backticks
-- ============================================
INSERT INTO Item (UserID, CategoryID, ItemName, Brand, `Condition`, MaxRentPeriodDays, IsActive, CreatedAt)
VALUES
(1, 1, 'Boremaskine',        'Bosch',       'God',        7, TRUE,  '2025-09-15 10:00:00'),
(1, 1, 'Hammer',             'Stanley',     'Meget god',  3, TRUE,  '2025-09-15 10:30:00'),
(2, 2, 'Røremaskine',        'KitchenAid',  'God',        5, TRUE,  '2025-09-20 14:00:00'),
(3, 3, 'Badmintonketsjer',   'Yonex',       'Acceptabel', 4, FALSE, '2025-09-25 09:00:00'),
(3, 4, 'Projektor',          'Epson',       'God',        3, TRUE,  '2025-10-01 11:00:00'),
(4, 2, 'Fondueservice',      'Swissmar',    'Meget god',  5, TRUE,  '2025-10-05 13:00:00'),
(5, 5, 'Hækkeklipper',       'Gardena',     'God',        7, TRUE,  '2025-10-12 10:00:00'),
(6, 3, 'Telt 2-personers',   'Nordisk',     'God',        7, FALSE, '2025-10-15 15:00:00'),
(7, 1, 'Stiksav',            'Makita',      'Meget god',  5, TRUE,  '2025-10-20 09:30:00'),
(8, 4, 'Bluetooth Højttaler','JBL',         'God',        3, TRUE,  '2025-10-25 12:00:00');

-- ============================================
-- INSERT: ItemImage
-- IsPrimary = TRUE markerer hovedbilledet
-- ============================================
INSERT INTO ItemImage (ItemID, ImageURL, IsPrimary)
VALUES
(1,  'images/boremaskine_1.jpg',   TRUE),
(1,  'images/boremaskine_2.jpg',   FALSE),
(2,  'images/hammer_1.jpg',        TRUE),
(3,  'images/roeremaskine_1.jpg',  TRUE),
(4,  'images/ketsjer_1.jpg',       TRUE),
(5,  'images/projektor_1.jpg',     TRUE),
(6,  'images/fondue_1.jpg',        TRUE),
(7,  'images/haekkeklipper_1.jpg', TRUE),
(8,  'images/telt_1.jpg',          TRUE),
(9,  'images/stiksav_1.jpg',       TRUE),
(10, 'images/hojttaler_1.jpg',     TRUE);

-- ============================================
-- INSERT: ItemAccessory
-- ============================================
INSERT INTO ItemAccessory (ItemID, AccessoryName)
VALUES
(1,  'Bor-sæt'),
(1,  'Kuffert'),
(3,  'Piskeris'),
(3,  'Dejkrog'),
(5,  'HDMI-kabel'),
(5,  'Fjernbetjening'),
(6,  'Spyd'),
(6,  'Brændepasta'),
(8,  'Teltpløkker'),
(8,  'Barduner'),
(9,  'Savklinger 3 stk');

-- ============================================
-- INSERT: RentalRequest
-- RenterUserID er altid forskellig fra Item.UserID
-- En bruger kan ikke låne sin egen genstand
-- ============================================
INSERT INTO RentalRequest (ItemID, RenterUserID, StartDate, EndDate, Status)
VALUES
(1,  2, '2025-10-01', '2025-10-05', 'approved'),
(3,  5, '2025-10-10', '2025-10-13', 'approved'),
(5,  4, '2025-10-20', '2025-10-22', 'approved'),
(7,  6, '2025-11-01', '2025-11-05', 'approved'),
(9,  1, '2025-11-10', '2025-11-14', 'approved'),
(10, 3, '2025-11-15', '2025-11-17', 'approved'),
(6,  7, '2026-02-14', '2026-02-18', 'approved'),
(2,  8, '2026-03-01', '2026-03-03', 'approved');

-- ============================================
-- INSERT: Rental
-- Oprettes når en RentalRequest godkendes
-- ============================================
INSERT INTO Rental (RequestID, Status)
VALUES
(1, 'completed'),
(2, 'completed'),
(3, 'completed'),
(4, 'completed'),
(5, 'completed'),
(6, 'completed'),
(7, 'completed'),
(8, 'active');

-- ============================================
-- INSERT: Message
-- ============================================
-- EditedAt er NULL hvis beskeden ikke er redigeret
INSERT INTO Message (SenderUserID, ReceiverUserID, RentalID, MessageText, SentAt, IsRead, EditedAt)
VALUES
(1, 2, 1, 'Hej Sofie, boremaskinen er klar til afhentning i dag.',           '2025-10-01 09:00:00', TRUE,  NULL),
(2, 1, 1, 'Perfekt, jeg henter den om en time!',                             '2025-10-01 09:15:00', TRUE,  '2025-10-01 09:16:00'),
(1, 2, 1, 'Den står ved døren. God fornøjelse!',                             '2025-10-01 09:20:00', TRUE,  NULL),
(2, 5, 2, 'Hej Jonas, røremaskinen er klar. Husk at tage piskeris med tilbage.', '2025-10-10 10:00:00', TRUE, NULL),
(5, 2, 2, 'Tak! Jeg afleverer den fredag.',                                  '2025-10-10 10:30:00', TRUE,  '2025-10-10 10:35:00'),
(3, 4, 3, 'Hej Emma, projektoren er ledig fra i morgen.',                    '2025-10-20 08:00:00', TRUE,  NULL),
(4, 3, 3, 'Super, jeg kommer forbi kl. 17.',                                 '2025-10-20 08:45:00', TRUE,  NULL),
(4, 6, 4, 'Hej Camilla, fondueservicen er klar til afhentning.',             '2025-11-01 11:00:00', TRUE,  NULL),
(6, 4, 4, 'Fantastisk! Vi glæder os til fondue-aften.',                      '2025-11-01 11:30:00', TRUE,  '2025-11-01 11:32:00'),
(1, 8, 8, 'Hej Nadia, hammeren er klar til afhentning.',                     '2026-03-01 08:00:00', TRUE,  NULL),
(8, 1, 8, 'Tak Lars, jeg henter den i dag!',                                 '2026-03-01 08:30:00', FALSE, NULL);

-- ============================================
-- INSERT: Rating
-- ============================================
INSERT INTO Rating (RentalID, RaterUserID, Rating)
VALUES
(1, 2, 5),
(2, 5, 4),
(3, 4, 5),
(4, 6, 4),
(5, 1, 3),
(6, 3, 5),
(7, 7, 4);
