"use strict";

const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const router = new express.Router();

/**Return info on invoices: like {invoices: [{id, comp_code}, ...]} */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
            FROM invoices
            ORDER BY id`
  );
  const invoices = results.rows;
  if (!invoices) throw new NotFoundError(`Could not find any Invoices!`);
  return res.json({ invoices });
});

/** Returns obj on given invoice.
If invoice cannot be found, returns 404.
Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */
router.get("/:id", async function (req, res) {
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
  if (!company)
    throw new NotFoundError(`Company with code ${comp_code} not found!`);

  invoice.company = company;
  delete invoice.comp_code;

  return res.json({ invoice });
});

/** Adds an invoice.
    Needs to be passed in JSON body of: {comp_code, amt}
    Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} 
*/
router.post("/", async function (req, res) {
  const { comp_code, amt } = req.body;
  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
            VALUES($1,$2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );
  const invoice = results.rows[0];
  if (!invoice) throw new BadRequestError(`Unable to add invoice!`);
  return res.json({ invoice });
});

/**
 *  Updates an invoice.
    If invoice cannot be found, returns a 404.
    Needs to be passed in a JSON body of {amt}
    Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
*/
router.put("/:id", async function (req, res) {
  const { amt } = req.body;
  const id = req.params.id;
  const results = await db.query(
    `UPDATE invoices
            SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, id]
  );
  const invoice = results.rows[0];
  if (!invoice) throw new NotFoundError(`Invoice with ID ${id} not found!`);
  return res.json({ invoice });
});

module.exports = router;
