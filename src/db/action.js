const pool = require('./index');


const getActionsForUser = async (userId, type = null, limit = null) => {
  let queryText = `SELECT * from actions where user_id = ${userId}`;
  if (type) {
    queryText += ` and action = '${type}'`;
  }
  queryText += ' order by created desc';
  if (limit) {
    queryText += ` limit ${limit}`;
  }

  const result = await pool().query(queryText);

  return result.rows;
};


const getActionById = async (id) => {
  const result = await pool().query('SELECT * from actions where id = $1', [id]);

  return result.rows[0];
};


const getActionByLink = async (link) => {
  const result = await pool().query('SELECT * from actions where link = $1', [link]);

  return result.rows[0];
};


const removeAction = async (link) => {
  const queryText = 'DELETE from actions where link = $1';
  await pool().query(queryText, [link]);
};


const createNewAction = async ({
  formId,
  formHash,
  userId,
  action,
  link,
  created,
  ip,
  transactionHash,
}) => {
  const values = [formId, formHash, userId, action, link, ip, created, transactionHash];
  const queryText = 'INSERT INTO actions(form_id, form_hash, user_id, action, link, ip, created, bc_transaction_hash) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
  const result = await pool().query(queryText, values);

  return result.rows[0];
};


module.exports = {
  createNewAction,
  getActionByLink,
  getActionsForUser,
  getActionById,
  removeAction,
};
