require('dotenv').config();

const adopt = require('../../src/actions/adoption');
const { initializePool, closePool } = require('../../src/db');
const {
  getById,
} = require('../../src/db/user');
const {
  removeAction,
} = require('../../src/db/action');
const {
  deleteAgreement,
} = require('../../src/db/agreement');


beforeAll(async () => {
  await initializePool();
  jest.setTimeout(20000);
});


test('adoption with link completes', async () => {
  const user = await getById(29);
  const ip = '127.0.000.000';
  const stateObject = {
    link: 'D9L7jejeGdf',
    form_id: 2,
    ip,
  };

  const result = await adopt(stateObject, user);
  const { adoption, agreement } = result;
  await deleteAgreement(agreement.link);
  await removeAction(adoption.link);

  expect(adoption).toEqual(expect.anything());
  expect(agreement).toEqual(expect.anything());
  expect(adoption).toHaveProperty('link', expect.anything());
  expect(adoption).toHaveProperty('bc_transaction_hash', expect.anything());
  expect(adoption).toHaveProperty('ip', ip);
  expect(agreement).toHaveProperty('link', expect.anything());
  expect(agreement).toHaveProperty('user_1_id', 6);
  expect(agreement).toHaveProperty('user_2_id', 29);
});


test('adoption doesn\'t allow signing your own adoption', async () => {
  const user = await getById(6);
  const stateObject = {
    link: 'D9L7jejeGdf',
    form_id: 2,
    ip: '127.0.000.000',
  };

  let error;
  try {
    await adopt(stateObject, user);
  } catch (e) {
    error = e;
  }
  expect(error).toEqual(expect.anything());
});


afterAll(async (done) => {
  await closePool();
  done();
});
