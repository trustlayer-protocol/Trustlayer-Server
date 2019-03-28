const pool = require('./index');


const getAvatarsOfFormAdopters = async (formId) => {
  const queryText = `select DISTINCT usr.id, usr.avatar_url from users usr, actions action 
  where action.form_id = ${formId} and action.user_id = usr.id and action.action = 'adopt' ORDER BY usr.id`;

  const result = await pool().query(queryText);

  return result.rows;
};


const getAllForms = async () => {
  const result = await pool().query('SELECT * from forms');

  return result.rows;
};


const getFormById = async (id) => {
  const result = await pool().query('SELECT * from forms where id = $1', [id]);

  return result.rows[0];
};


const getFormByHash = async (hash) => {
  const result = await pool().query('SELECT * from forms where hash = $1', [hash]);

  return result.rows[0];
};


const inserForm = async (hash, content) => {
  const values = [hash, content];
  const queryText = 'INSERT INTO forms(hash, content) VALUES($1, $2) RETURNING *';
  const result = await pool().query(queryText, values);

  return result.rows[0];
};


module.exports = {
  inserForm,
  getFormByHash,
  getFormById,
  getAllForms,
  getAvatarsOfFormAdopters,
};
