require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const app = express();

app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

app.get("/termekek", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT *
            FROM termekek
            ORDER BY nev ASC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

app.get("/termekek/elerheto", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT *
            FROM termekek
            WHERE elerheto = 1
            ORDER BY nev ASC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

app.get("/termekek/kereses/:szoveg", async (req, res) => {
    try {
        const { szoveg } = req.params;

        const [rows] = await pool.query(`
            SELECT id, nev, ar
            FROM termekek
            WHERE nev LIKE ?
        `, [`%${szoveg}%`]);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

app.get("/kategoriak/statisztika", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                kategoriak.nev AS kategoria,
                COUNT(termekek.id) AS termekek_szama,
                ROUND(AVG(termekek.ar), 0) AS atlagos_ar
            FROM kategoriak
            INNER JOIN termekek
                ON kategoriak.id = termekek.kategoria_id
            GROUP BY kategoriak.id, kategoriak.nev
            ORDER BY kategoriak.nev
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

app.get("/termekek/dragak", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                nev,
                ar,
                keszlet
            FROM termekek
            WHERE ar > 10000
            ORDER BY ar DESC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

/* GET API a termékek olcsóbbak mint 10000 */
app.get("/termekek/olcsok", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                nev,
                ar,
                keszlet
            FROM termekek
            WHERE ar < 10000
            ORDER BY ar DESC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

/* POST API Új termék hozzáadása */

app.post("/termekek", async (req, res) => {
    try {
        const {
            kategoria_id,
            nev,
            ar,
            keszlet,
            elerheto
        } = req.body;

        const [result] = await pool.query(`
            INSERT INTO termekek
            (kategoria_id, nev, ar, keszlet, elerheto)
            VALUES (?, ?, ?, ?, ?)
        `, [
            kategoria_id,
            nev,
            ar,
            keszlet,
            elerheto
        ]);

        res.status(201).json({
            uzenet: "A termék sikeresen létrehozva.",
            ujId: result.insertId
        });

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});
/* POST API új Kategória létrehozása */
app.post("/kategoriak", async (req, res) => {
    try {
        const {
           id,
           nev
        } = req.body;

        const [result] = await pool.query(`
            INSERT INTO kategoriak
            (id, nev)
            VALUES (?, ?)
        `, [
            id,
            nev
        ]);

        res.status(201).json({
            uzenet: "A Kategória sikeresen létrehozva.",
            ujId: result.insertId
        });

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

/* DELETE API Termék törlése azonosító alapján */

app.delete("/termekek/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(`
            DELETE FROM termekek
            WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                hiba: "A termék nem található."
            });
        }

        res.json({
            uzenet: "A termék sikeresen törölve."
        });

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});

/* DELETE API Kategória törlése id alapján */

app.delete("/termekek/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(`
            DELETE FROM kategoriak
            WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                hiba: "A termék nem található."
            });
        }

        res.json({
            uzenet: "A termék sikeresen törölve."
        });

    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});
app.use((req, res) => {
    res.status(404).json({
        hiba: "A végpont nem található."
    });
});

app.listen(process.env.PORT, () => {
    console.log(
        `Szerver fut: http://localhost:${process.env.PORT}`
    );
});
