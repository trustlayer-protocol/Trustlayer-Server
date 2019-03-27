const pool = require('./index');


const getUserByEmail = async (email) => {
  const result = await pool().query('SELECT * from users where email = $1', [email]);

  return result.rows[0];
};


const getByLink = async (link) => {
  const result = await pool().query('SELECT * from users where link = $1', [link]);

  return result.rows[0];
};


const insertUser = async ({
  email,
  avatarUrl,
  link,
  created,
}) => {
  const values = [email, avatarUrl, link, created];
  const queryText = 'INSERT INTO users(email, avatar_url, link, created) VALUES($1, $2, $3, $4) RETURNING *';
  const result = await pool().query(queryText, values);

  return result.rows[0];
};


module.exports = {
  insertUser,
  getUserByEmail,
  getByLink,
};
