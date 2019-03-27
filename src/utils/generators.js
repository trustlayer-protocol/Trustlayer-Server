
const nanoid = require('nanoid');
const md5 = require('md5');
const {
  insertUser,
  getUserByEmail,
} = require('../db/user');
const {
  getFormByHash,
  getFormById,
  inserForm,
} = require('../db/form');
const {
  createNewAction,
  getActionByLink,
} = require('../db/action');
const pool = require('../db/');
const {
  ResourceNotFound,
} = require('../utils/errors');
const {
  ACTION,
  TABLES,
} = require('../utils/enums');


const generateUniqueLink = async (table, prepend) => {
  const { rows } = await pool().query(`select link from ${table}`);
  let link;
  let duplicateRows;
  do {
    link = `${prepend}${nanoid(10)}`;

    // eslint-disable-next-line no-loop-func
    duplicateRows = rows.filter(row => row.link === link);
  } while (duplicateRows.length > 0);

  return link;
};


const createAction = async (userId, action, formId) => {
  const form = await getFormById(formId);

  if (!form) throw new ResourceNotFound(`form with id: ${formId} not found`);
  const { hash } = form;

  const link = await generateUniqueLink(TABLES.ACTIONS, 'H');
  const data = {
    userId,
    action,
    formHash: hash,
    formId,
    link,
    created: new Date().getTime(),
  };

  const newAction = await createNewAction(data);

  return newAction;
};


const createAdoptionByFormId = async (userId, formId) => {
  const adoption = await createAction(userId, ACTION.ADOPT, formId);

  return adoption;
};


const createAdoptionByLink = async (userId, link) => {
  const linkAdoption = await getActionByLink(link);
  if (!linkAdoption) throw new ResourceNotFound(`adoption with link: '${link}' not found`);

  const { form_id: formId } = linkAdoption;
  const adoption = await createAdoptionByFormId(userId, formId);

  return adoption;
};


const checkAndCreateUser = async (email, avatarUrl) => {
  const user = await getUserByEmail(email);
  if (user) return user;

  const link = generateUniqueLink(TABLES.USERS, 'U');
  const data = {
    email,
    avatarUrl,
    link,
    created: new Date().getTime(),
  };


  const newUser = await insertUser(data);

  return newUser;
};


const checkAndCreateForm = async (content) => {
  const hash = md5(content);
  const form = await getFormByHash(hash);
  if (form) throw new Error(`form with hash: ${hash} already exists.`);

  const newForm = await inserForm(hash, content);

  return newForm;
};


module.exports = {
  checkAndCreateUser,
  checkAndCreateForm,
  createAdoptionByFormId,
  createAdoptionByLink,
};
