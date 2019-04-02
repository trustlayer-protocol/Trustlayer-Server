const pool = require('./index');


const getUserEmailsForAgreement = async (link) => {
  const queryText = `select usr1.email as email1, usr2.email as email2, ag.id from users usr1,
   users usr2, agreements ag where ag.link = '${link}' and usr1.id = ag.user_1_id and usr2.id = ag.user_2_id`;

  const result = await pool().query(queryText);

  return result.rows[0];
};

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
  adoption1Id,
  adoption2Id,
  link,
}) => {
  const values = [user1Id, user2Id, formId, formHash, adoption1Id, adoption2Id, created, link];
  const queryText = 'INSERT INTO agreements(user_1_id, user_2_id, form_id, form_hash, adoption_1_id, adoption_2_id, created, link) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
  const result = await pool().query(queryText, values);

  return result.rows[0];
};

module.exports = {
  insertAgreement,
  getByLink,
  getUserEmailsForAgreement,
};
