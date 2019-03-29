const pool = require('./index');


const getActionsForUser = async (userId, type = null, limit = null) => {
  let queryText = `SELECT * from actions where user_id = ${userId}`;
  if (type) {
    queryText += ` and type = '${type}'`;
  }
  queryText += ' order by created desc';
  if (limit) {
    queryText += ` limit ${limit}`;
  }

  const result = await pool().query(queryText);

  return result.rows;
};


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
  ip,
}) => {
  const values = [formId, formHash, userId, action, link, ip, created];
  const queryText = 'INSERT INTO actions(form_id, form_hash, user_id, action, link, ip, created) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *';
  const result = await pool().query(queryText, values);

  return result.rows[0];
};


module.exports = {
  createNewAction,
  getActionByLink,
  getActionsForUser,
};
