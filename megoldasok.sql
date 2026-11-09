-- =====================================
-- TERMEKEK TÁBLA
-- =====================================

-- INSERT
INSERT INTO termekek
(kategoria_id, nev, ar, keszlet, elerheto)
VALUES
(2, 'Tűzőgép fém', 2890, 35, 1);

-- UPDATE
UPDATE termekek
SET ar = 74900,
    keszlet = 5
WHERE id = 9;

-- DELETE
DELETE FROM termekek
WHERE id = 6;


-- =====================================
-- KATEGORIAK TÁBLA
-- =====================================

-- INSERT
INSERT INTO kategoriak (nev)
VALUES ('Sporteszköz');

-- UPDATE
UPDATE kategoriak
SET nev = 'Irodai kellék'
WHERE id = 2;

-- DELETE
DELETE FROM kategoriak
WHERE id = 3;
