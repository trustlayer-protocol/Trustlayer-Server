require('dotenv').config();

const getAgreement = require('../../src/actions/get-agreement-pdf');
const { initializePool, closePool } = require('../../src/db');


beforeAll(async () => {
  await initializePool();
  jest.setTimeout(20000);
});


test('get-agreement-pdf returns agreement', async () => {
  const agreementData = await getAgreement('AOWqNouNdX2', 'test@trustbot.io');

  expect(agreementData).toEqual(expect.anything());
});


test('get-agreement-pdf denies invalid emails', async () => {
  let error;
  try {
    await getAgreement('AOWqNouNdX2', 'iskander@trustbot.io');
  } catch (e) {
    error = e;
  }

  expect(error).toEqual(expect.anything());
});


afterAll(async (done) => {
  await closePool();
  done();
});
