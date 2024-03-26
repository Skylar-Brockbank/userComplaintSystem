const sql = require("../serverUtils/pgUtils.js");

async function setup(){
  await sql`
    CREATE table complaints (
      id INT GENERATED ALWAYS AS IDENTITY,
      description TEXT,
      owner TEXT
    );
  `
  await sql`
    CREATE table users (
      id TEXT,
      name TEXT,
      password TEXT
    );
  `
  process.exit(0);
}

setup();
