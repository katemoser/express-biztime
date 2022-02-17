"use strict";
const express = require("express");
const db = require("../db");
const router = new express.Router();


router.get('/', async function (req, res, next) {
    const results = await db.query(
        `SELECT code, name 
          FROM companies`
    );
    const companies = results.rows;
    return res.json({ companies });
})

router.get('/:code', async function (req, res, next) {
    const code = req.params.code;

    const results = await db.query(
        `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
        [code]
    );
    const company = results.rows;
    return res.json({ company });
})

router.post('/', async function (req, res, next) {
    // const {company} = req.body;

    const code = req.body.code;
    const name = req.body.name;
    const description = req.body.description;


    const result = await db.query(
        `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
        [code, name, description]
    );

    const company = result.rows;
    return res.json({ company });
})

module.exports = router;