"use strict";
const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError");
const router = new express.Router();

/* Get list of companies, 
returns {companies: [{code, name}, ...]}
*/
router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name 
          FROM companies
          ORDER BY code`
  );
  const companies = results.rows;
  if (!companies) throw new NotFoundError(`Could not find any companies!`);
  return res.json({ companies });
});

/** Returns company data given company code,
 *  returns as {company: {code, name, description}}
 */
router.get("/:code", async function (req, res, next) {
  const code = req.params.code;

  const companyResults = await db.query(
    `SELECT code, name, description
            FROM companies
            WHERE code = $1
            ORDER BY code`,
    [code]
  );
  const company = companyResults.rows[0];

  if (!company) throw new NotFoundError(`Company ${code} not found`);
  console.log(`company code: ${code}`)

  const invoiceResults = await db.query(
    `SELECT id
    FROM invoices
    WHERE comp_code = $1
    ORDER BY id`,
    [code]
  );

  company.invoices = invoiceResults.rows.map(r => r.id);
  if (!company.invoices) throw new NotFoundError(`Invoice ${id} not found`);

  return res.json({ company });
});

/** Takes JSON like: {code, name, description}
 *  Returns {company: {code, name, description}}
 */
router.post("/", async function (req, res, next) {
// REVIEW: destructuring 
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
});

/**
 * Edit existing company.
   Should return 404 if company cannot be found.
   Needs to be given JSON like: {name, description}
   Returns update company object: {company: {code, name, description}}
 */
router.put("/:code", async function (req, res, next) {
  const code = req.params.code;
//   Destructuring here too
  const name = req.body.name;
  const description = req.body.description;

  const results = await db.query(
    `UPDATE companies 
        SET name = $1, description = $2
        WHERE code = $3
        RETURNING code, name, description`,
    [name, description, code]
  );

  const company = results.rows[0];
  if (!company) throw new NotFoundError(`Not found ${code}`);

  return res.json({ company });
});

/** Deletes company.
    Should return 404 if company cannot be found.
    Returns {status: "deleted"}
 */
router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;

  const results = await db.query(
    `DELETE FROM companies
          WHERE code = $1
            RETURNING $2 
              AS status`,
    [code, "Deleted"]
  );

  const status = results.rows[0];

  if (!status) throw new NotFoundError(`Not found ${code}`);
  return res.json(results.rows[0]);
});

module.exports = router;
