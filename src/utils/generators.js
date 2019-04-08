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
} = require('../db/action');
const {
  insertAgreement,
} = require('../db/agreement');
const pool = require('../db/');
const {
  ResourceNotFound,
  InvalidArgumentError,
} = require('../utils/errors');
const {
  ACTION,
  TABLES,
} = require('../utils/enums');
const {
  checkTransactions,
} = require('../blockchain/transactions');


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


const createAction = async (userId, action, formId, ip, transactionHash) => {
  const form = await getFormById(formId);

  if (!form) throw new ResourceNotFound(`form with id: ${formId} not found`);
  const { hash } = form;

  const link = await generateUniqueLink(TABLES.ACTIONS, 'D');
  const data = {
    userId,
    action,
    formHash: hash,
    formId,
    link,
    ip,
    transactionHash,
    created: new Date().getTime(),
  };

  const newAction = await createNewAction(data);

  return newAction;
};


const createAdoptionByFormId = async (userId, formId, ip, transactionHash) => {
  const adoption = await createAction(userId, ACTION.ADOPT, formId, ip, transactionHash);

  return adoption;
};


const createRevocationByFormId = async (userId, formId, ip, transactionHash) => {
  const revocation = await createAction(userId, ACTION.REVOKE, formId, ip, transactionHash);

  return revocation;
};


const createAgreement = async (user1Id, user2Id, formId, formHash, adoption1Id, adoption2Id) => {
  const link = await generateUniqueLink(TABLES.AGREEMENTS, 'A');

  const agreement = {
    user1Id,
    user2Id,
    formId,
    formHash,
    link,
    adoption1Id,
    adoption2Id,
    created: new Date().getTime(),
  };

  return insertAgreement(agreement);
};


const createAdoptionAndAgreementFromLink = async (userId, linkAdoption, ip, transactionHash) => {
  const {
    id: linkAdoptionId,
    form_id: formId,
    user_id: adoptionUserId,
    form_hash: formHash,
    bc_transaction_hash: linkAdoptionTxHash,
  } = linkAdoption;

  const newAdoption = await createAdoptionByFormId(userId, formId, ip, transactionHash);
  const {
    id: newAdptionId,
    bc_transaction_hash: newAdoptionTxHash,
  } = newAdoption;

  const validTransactions = await checkTransactions(linkAdoptionTxHash, newAdoptionTxHash);
  if (!validTransactions) throw new InvalidArgumentError('Looks like the form you\'re trying to adopt is not the same form that the other user adopted. Please try again or contact support@trustbot.io for help.');
  const newAgreement = await createAgreement(
    adoptionUserId,
    userId,
    formId,
    formHash,
    linkAdoptionId,
    newAdptionId,
  );


  return {
    linkAdoption,
    newAdoption,
    agreement: newAgreement,
  };
};


const checkAndCreateUser = async (email, profile) => {
  const user = await getUserByEmail(email);
  if (user) return user;

  const {
    firstName,
    lastName,
    avatarUrl,
    fullName,
  } = profile;

  let name;
  if (fullName) {
    name = fullName;
  } else if (firstName || lastName) {
    name = `${firstName || ''} ${lastName || ''}`.trim();
  }

  const link = await generateUniqueLink(TABLES.USERS, 'U');
  const data = {
    email,
    avatarUrl,
    fullName: name,
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
  createRevocationByFormId,
  createAdoptionAndAgreementFromLink,
};
