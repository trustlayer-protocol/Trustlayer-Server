const ACTION = Object.freeze({
  ADOPT: 'adopt',
  REVOKE: 'revoke',
  PDF: 'get-pdf',
  LOGIN: 'login',
});
const TABLES = Object.freeze({
  ACTIONS: 'actions',
  USERS: 'users',
  FORMS: 'forms',
  AGREEMENTS: 'agreements',
});

module.exports = {
  ACTION,
  TABLES,
};
