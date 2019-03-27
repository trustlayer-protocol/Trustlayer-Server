const pool = require('./index');


const getActionByLink = async (link) => {
  const result = await pool().query('SELECT * from actions where link = $1', [link]);

  return result.rows[0];
};


const createNewAction = async ({
  formId,
  formHash,
  userId,
  action,
  link,
  created,
}) => {
  const values = [formId, formHash, userId, action, link, created];
  const queryText = 'INSERT INTO actions(form_id, form_hash, user_id, action, link, created) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
  const result = await pool().query(queryText, values);

  return result.rows[0];
};


module.exports = {
  createNewAction,
  getActionByLink,
};
