const pool = require('./index');


const getUserByEmail = async (email) => {
  const result = await pool().query('SELECT * from users where email = $1', [email]);

  return result.rows[0];
};


const getByLink = async (link) => {
  const result = await pool().query('SELECT * from users where link = $1', [link]);

  return result.rows[0];
};


const getById = async (id) => {
  const result = await pool().query('SELECT * from users where id = $1', [id]);

  return result.rows[0];
};


const insertUser = async ({
  email,
  avatarUrl,
  link,
  created,
  fullName,
}) => {
  const values = [email, avatarUrl, link, fullName, created];
  const queryText = 'INSERT INTO users(email, avatar_url, link, full_name, created) VALUES($1, $2, $3, $4, $5) RETURNING *';
  const result = await pool().query(queryText, values);

  return result.rows[0];
};


const deleteUser = async (id) => {
  const queryText = 'DELETE from users where id = $1';
  await pool().query(queryText, [id]);
};


module.exports = {
  insertUser,
  getUserByEmail,
  getByLink,
  getById,
  deleteUser,
};
