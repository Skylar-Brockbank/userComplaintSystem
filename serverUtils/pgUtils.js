if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const postgres = require("postgres");

const sql = postgres({
  host: process.env.PG_HOST,
  database: process.env.DB_NAME,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD
});

module.exports=sql;