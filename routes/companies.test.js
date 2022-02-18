"use strict";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let apple;
let msft;
let appleInvoice;
let msftInvoice;

beforeEach(async function () {
  await db.query(`DELETE FROM companies`);
  const result = await db.query(`
        INSERT INTO companies (code, name, description)
            VALUES('apple', 'APPLE', 'MACBOOK')
            RETURNING code, name
    `);
  apple = result.rows[0];
});

describe("GET /companies", function () {
  test("Gets a list of companies", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [apple],
    });
  });
});
