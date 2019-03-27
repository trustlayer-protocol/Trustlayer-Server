const pool = require('./index');


const getByLink = async (link) => {
  const result = await pool().query('SELECT * from agreements where link = $1', [link]);

  return result.rows[0];
};

const insertAgreement = async ({
  user1Id,
  user2Id,
  formId,
  formHash,
  created,
  link,
}) => {
  const values = [user1Id, user2Id, formId, formHash, created, link];
  const queryText = 'INSERT INTO agreements(user_1_id, user_2_id, form_id, form_hash, created, link) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
  const result = await pool().query(queryText, values);

  return result.rows[0];
};

module.exports = {
  insertAgreement,
  getByLink,
};
