"use strict";

const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");
const router = new express.Router();

router.get("/", async function(req, res){
    const results = await db.query(
        `SELECT id, comp_code
            FROM invoices
            ORDER BY id`
    );
    const invoices = results.rows;
    // if (!invoices) throw new NotFoundError(`Could not find any Invoices!`);
    return res.json({ invoices });
});

router.get("/:id", async function(req, res){
    const id = req.params.id;

    const invoiceResults = await db.query(
        `SELECT id, amt, paid, add_date, paid_date, comp_code
            FROM invoices
            WHERE id = $1
            ORDER BY id`,
        [id]
    );
    const invoice = invoiceResults.rows[0];
    if (!invoice) throw new NotFoundError(`Invoice with ID ${id} not found!`);

    const comp_code = invoice.comp_code;
    const companyResults = await db.query(
        `SELECT code, name, description
            FROM companies
            WHERE code = $1
            ORDER BY code`,
            [comp_code]
    );
    const company = companyResults.rows[0];
    if (!company) throw new NotFoundError(`Company with code ${comp_code} not found!`);

    invoice.company = company;
    delete invoice.comp_code;
    
    return res.json({ invoice });

});

module.exports = router;
