const { Pool } = require('pg');

let pool = null;

const initializePool = () => {
  if (!pool) {
    pool = new Pool();
  }
};


const closePool = async () => {
  await pool.end();
};


const getPool = () => pool;

module.exports = getPool;
module.exports.initializePool = initializePool;
module.exports.closePool = closePool;
