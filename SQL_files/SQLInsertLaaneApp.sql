USE LaaneApp;

-- 1. PostalCode (opslagstabel)
INSERT INTO PostalCode (PostalCode, City)
VALUES ('2300', 'København S');

-- 2. Community (uden City-kolonne, refererer postnummer).
--    To communities deler postnummer 2300 -> by gemmes kun ét sted.
INSERT INTO Community (CommunityName, StreetName, StreetNumberFrom, StreetNumberTo, PostalCode)
VALUES
('Elmevej Kollegium',  'Elmevej',  4,  4,  '2300'),
('Birkevej Kollegium', 'Birkevej', 10, 22, '2300');

-- 3. Address (hører til Elmevej, CommunityID 1)
INSERT INTO Address (CommunityID, StreetNumber)
VALUES (1, '4');

-- 4a. Admin/grundlægger først (UserID 1, ingen godkender)
INSERT INTO User (AddressID, ApprovedByID, FirstName, LastName, Username, Email, PhoneNumber, ApartmentNumber, DateOfBirth, Role, MembershipStatus, CreatedAt)
VALUES
(1, NULL, 'Lars', 'Hansen', 'L. Hansen', 'lars.hansen@mail.dk', '20345678', '2tv', '1998-03-12', 'admin', 'approved', '2025-08-15 09:00:00');

-- 4b. Øvrige beboere, godkendt af Lars (UserID 1)
INSERT INTO User (AddressID, ApprovedByID, FirstName, LastName, Username, Email, PhoneNumber, ApartmentNumber, DateOfBirth, Role, MembershipStatus, CreatedAt)
VALUES
(1, 1, 'Sofie',   'Andersen',    'S. Andersen',    'sofie.andersen@mail.dk', '31456789', '3th', '2001-07-22', 'user', 'approved', '2025-08-20 10:00:00'),
(1, 1, 'Mikkel',  'Christensen', 'M. Christensen', 'mikkel.c@mail.dk',       '40567890', '1tv', '1995-11-05', 'user', 'approved', '2025-08-22 11:00:00'),
(1, 1, 'Emma',    'Pedersen',    'E. Pedersen',    'emma.pedersen@mail.dk',  '51678901', '2th', '2000-04-18', 'user', 'approved', '2025-08-25 12:00:00'),
(1, 1, 'Jonas',   'Nielsen',     'J. Nielsen',     'jonas.nielsen@mail.dk',  '60789012', '1mf', '1997-09-30', 'user', 'approved', '2025-08-28 13:00:00'),
(1, 1, 'Camilla', 'Møller',      'C. Moller',      'camilla.m@mail.dk',      '71890123', '4tv', '2003-01-14', 'user', 'approved', '2025-09-01 14:00:00'),
(1, 1, 'Thomas',  'Kjær',        'T. Kjaer',       'thomas.kjaer@mail.dk',   '82901234', '1th', '1988-06-25', 'user', 'approved', '2025-09-03 15:00:00'),
(1, 1, 'Nadia',   'Poulsen',     'N. Poulsen',     'nadia.p@mail.dk',        '35234567', '3tv', '1990-05-17', 'user', 'approved', '2025-09-05 16:00:00');

-- 5. Sæt Lars (UserID 1) som admin for Elmevej (CommunityID 1)
UPDATE Community SET AdminUserID = 1 WHERE CommunityID = 1;

-- 6. Login (bcrypt hash — original adgangskode: password123)
INSERT INTO Login (UserID, PasswordHash)
VALUES
(1, '$2b$10$B8Sds7QI3ohfWL0YwKd73esBXYgvLwQ1PvmGOg7PzLOvE6fWeiYAi'),
(2, '$2b$10$B8Sds7QI3ohfWL0YwKd73esBXYgvLwQ1PvmGOg7PzLOvE6fWeiYAi'),
(3, '$2b$10$B8Sds7QI3ohfWL0YwKd73esBXYgvLwQ1PvmGOg7PzLOvE6fWeiYAi'),
(4, '$2b$10$B8Sds7QI3ohfWL0YwKd73esBXYgvLwQ1PvmGOg7PzLOvE6fWeiYAi'),
(5, '$2b$10$B8Sds7QI3ohfWL0YwKd73esBXYgvLwQ1PvmGOg7PzLOvE6fWeiYAi'),
(6, '$2b$10$B8Sds7QI3ohfWL0YwKd73esBXYgvLwQ1PvmGOg7PzLOvE6fWeiYAi'),
(7, '$2b$10$B8Sds7QI3ohfWL0YwKd73esBXYgvLwQ1PvmGOg7PzLOvE6fWeiYAi'),
(8, '$2b$10$B8Sds7QI3ohfWL0YwKd73esBXYgvLwQ1PvmGOg7PzLOvE6fWeiYAi');

-- 7. Category
INSERT INTO Category (CategoryName)
VALUES ('Værktøj'), ('Køkkenudstyr'), ('Sport og Fritid'), ('Elektronik'), ('Haveudstyr');

-- 8. Item
INSERT INTO Item (UserID, CategoryID, ItemName, Brand, `Condition`, MaxRentPeriodDays, IsActive, CreatedAt)
VALUES
(1, 1, 'Boremaskine',         'Bosch',       'God',        7, TRUE,  '2025-09-15 10:00:00'),
(1, 1, 'Hammer',              'Stanley',     'Meget god',  3, TRUE,  '2025-09-15 10:30:00'),
(2, 2, 'Røremaskine',         'KitchenAid',  'God',        5, TRUE,  '2025-09-20 14:00:00'),
(3, 3, 'Badmintonketsjer',    'Yonex',       'Acceptabel', 4, FALSE, '2025-09-25 09:00:00'),
(3, 4, 'Projektor',           'Epson',       'God',        3, TRUE,  '2025-10-01 11:00:00'),
(4, 2, 'Fondueservice',       'Swissmar',    'Meget god',  5, TRUE,  '2025-10-05 13:00:00'),
(5, 5, 'Hækkeklipper',        'Gardena',     'God',        7, TRUE,  '2025-10-12 10:00:00'),
(6, 3, 'Telt 2-personers',    'Nordisk',     'God',        7, FALSE, '2025-10-15 15:00:00'),
(7, 1, 'Stiksav',             'Makita',      'Meget god',  5, TRUE,  '2025-10-20 09:30:00'),
(8, 4, 'Bluetooth Højttaler', 'JBL',         'God',        3, TRUE,  '2025-10-25 12:00:00');

-- 9. ItemImage
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

-- 10. ItemAccessory
INSERT INTO ItemAccessory (ItemID, AccessoryName)
VALUES
(1, 'Bor-sæt'), (1, 'Kuffert'), (3, 'Piskeris'), (3, 'Dejkrog'),
(5, 'HDMI-kabel'), (5, 'Fjernbetjening'), (6, 'Spyd'), (6, 'Brændepasta'),
(8, 'Teltpløkker'), (8, 'Barduner'), (9, 'Savklinger 3 stk');

-- 11. RentalRequest
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

-- 12. Rental
INSERT INTO Rental (RequestID, Status)
VALUES
(1, 'completed'), (2, 'completed'), (3, 'completed'), (4, 'completed'),
(5, 'completed'), (6, 'completed'), (7, 'completed'), (8, 'active');

-- 13. Message
INSERT INTO Message (SenderUserID, ReceiverUserID, RentalID, MessageText, SentAt, IsRead, EditedAt)
VALUES
(1, 2, 1, 'Hej Sofie, boremaskinen er klar til afhentning i dag.',                '2025-10-01 09:00:00', TRUE,  NULL),
(2, 1, 1, 'Perfekt, jeg henter den om en time!',                                  '2025-10-01 09:15:00', TRUE,  '2025-10-01 09:16:00'),
(1, 2, 1, 'Den står ved døren. God fornøjelse!',                                  '2025-10-01 09:20:00', TRUE,  NULL),
(2, 5, 2, 'Hej Jonas, røremaskinen er klar. Husk at tage piskeris med tilbage.',  '2025-10-10 10:00:00', TRUE,  NULL),
(5, 2, 2, 'Tak! Jeg afleverer den fredag.',                                        '2025-10-10 10:30:00', TRUE,  '2025-10-10 10:35:00'),
(3, 4, 3, 'Hej Emma, projektoren er ledig fra i morgen.',                         '2025-10-20 08:00:00', TRUE,  NULL),
(4, 3, 3, 'Super, jeg kommer forbi kl. 17.',                                       '2025-10-20 08:45:00', TRUE,  NULL),
(4, 6, 4, 'Hej Camilla, fondueservicen er klar til afhentning.',                  '2025-11-01 11:00:00', TRUE,  NULL),
(6, 4, 4, 'Fantastisk! Vi glæder os til fondue-aften.',                            '2025-11-01 11:30:00', TRUE,  '2025-11-01 11:32:00'),
(1, 8, 8, 'Hej Nadia, hammeren er klar til afhentning.',                          '2026-03-01 08:00:00', TRUE,  NULL),
(8, 1, 8, 'Tak Lars, jeg henter den i dag!',                                       '2026-03-01 08:30:00', FALSE, NULL);

-- 14. Rating (med RatedUserID — lejer rater ejeren)
-- Rental 1: Item 1 ejet af Lars(1), lejet af Sofie(2)
-- Rental 2: Item 3 ejet af Sofie(2), lejet af Jonas(5)
-- Rental 3: Item 5 ejet af Mikkel(3), lejet af Emma(4)
-- Rental 4: Item 7 ejet af Jonas(5), lejet af Camilla(6)
-- Rental 5: Item 9 ejet af Thomas(7), lejet af Lars(1)
-- Rental 6: Item 10 ejet af Nadia(8), lejet af Mikkel(3)
-- Rental 7: Item 6 ejet af Emma(4), lejet af Thomas(7)
INSERT INTO Rating (RentalID, RaterUserID, RatedUserID, RatingScore)
VALUES
(1, 2, 1, 5),
(2, 5, 2, 4),
(3, 4, 3, 5),
(4, 6, 5, 4),
(5, 1, 7, 3),
(6, 3, 8, 5),
(7, 7, 4, 4);
