require('dotenv').config();
const md5 = require('md5');
const { initializePool, closePool } = require('../../src/db');
const {
  deleteUser,
} = require('../../src/db/user');
const {
  getFormById,
  deleteForm,
} = require('../../src/db/form');
const {
  removeAction,
  getActionByLink,
} = require('../../src/db/action');
const {
  deleteAgreement,
} = require('../../src/db/agreement');
const {
  checkAndCreateUser,
  checkAndCreateForm,
  createAdoptionByFormId,
  createRevocationByFormId,
  createAdoptionAndAgreementFromLink,
} = require('../../src/utils/generators');


beforeAll(async () => {
  await initializePool();
});


test('checkAndCreateUser creates new user', async () => {
  const user = await checkAndCreateUser('test+1@trustbot.io', {
    avatarUrl: 'testing',
    fullName: 'Testing Testing Testing',
  });

  expect(user).toEqual(expect.anything());
  expect(user).toHaveProperty('avatar_url', 'testing');
  expect(user).toHaveProperty('full_name', 'Testing Testing Testing');

  deleteUser(user.id);
});


test('checkAndCreateUser returns existing user', async () => {
  const user = await checkAndCreateUser('test@trustbot.io', null);

  expect(user).toEqual(expect.anything());
  expect(user).toHaveProperty('avatar_url', expect.anything());
  expect(user).toHaveProperty('full_name', expect.anything());
});


test('checkAndCreateForm creates new form', async () => {
  const content = 'testing content';
  const form = await checkAndCreateForm(content);

  const hash = md5(content);

  expect(form).toEqual(expect.anything());
  expect(form).toHaveProperty('hash', hash);
  expect(form).toHaveProperty('content', content);

  await deleteForm(form.id);
});


test('checkAndCreateForm doesn\'t allow duplicate forms', async () => {
  const existingForm = await getFormById(2);
  const { content } = existingForm;

  let error;
  try {
    await checkAndCreateForm(content);
  } catch (e) {
    error = e;
  }
  expect(error).toEqual(expect.anything());
});


const validateAction = (action, actionValue, testTransactionHash) => {
  expect(action).toEqual(expect.anything());
  expect(action).toHaveProperty('action', actionValue);
  expect(action).toHaveProperty('form_id', 2);
  expect(action).toHaveProperty('user_id', 29);
  expect(action).toHaveProperty('link');
  expect(action).toHaveProperty('bc_transaction_hash', testTransactionHash);
};


test('createAdoptionByFormId creates adoption', async () => {
  const testTransactionHash = 'testingtesting';
  const adoption = await createAdoptionByFormId(29, 2, '127.0.000.000',
    testTransactionHash);

  validateAction(adoption, 'adopt', testTransactionHash);

  await removeAction(adoption.link);
});


test('createRevocationByFormId creates revocation', async () => {
  const testTransactionHash = '0xe7974a93b958e1260a1a106282f5adaf77b8fdaf4b00ec8bf406852d55cd3798';
  const revocation = await createRevocationByFormId(29, 2, '127.0.000.000',
    testTransactionHash);

  validateAction(revocation, 'revoke', testTransactionHash);

  await removeAction(revocation.link);
});


test('createAdoptionAndAgreementFromLink creates adoption and agreement', async () => {
  const testTransactionHash = '0xe7974a93b958e1260a1a106282f5adaf77b8fdaf4b00ec8bf406852d55cd3798';
  const linkAdoption = await getActionByLink('D9L7jejeGdf');
  const result = await createAdoptionAndAgreementFromLink(29, linkAdoption, '127.0.000.000',
    testTransactionHash);

  expect(result).toEqual(expect.anything());
  expect(result).toHaveProperty('agreement', expect.anything());
  expect(result).toHaveProperty('newAdoption', expect.anything());
  expect(result).toHaveProperty('linkAdoption', expect.anything());
  const { agreement, newAdoption } = result;

  validateAction(newAdoption, 'adopt', testTransactionHash);
  expect(agreement).toHaveProperty('form_id', expect.anything());
  expect(agreement).toHaveProperty('form_hash', expect.anything());
  expect(agreement).toHaveProperty('link', expect.anything());
  await removeAction(newAdoption.link);
  await deleteAgreement(agreement.link);
});


afterAll(async (done) => {
  await closePool();
  done();
});
