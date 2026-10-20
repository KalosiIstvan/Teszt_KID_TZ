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
