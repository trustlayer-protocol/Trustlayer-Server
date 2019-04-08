require('dotenv').config();
const { initializePool, closePool } = require('../../src/db');
const {
  getByUserId,
  getByLink,
  getUserEmailsForAgreement,
  insertAgreement,
  deleteAgreement,
} = require('../../src/db/agreement');

beforeAll(async () => {
  await initializePool();
});


test('db/insertAgreement inserts agreement', async () => {
  const agreement = {
    user1Id: 6,
    user2Id: 29,
    formHash: '629e19b8bc3489e0b5fa284b07a2c727',
    created: new Date().getTime(),
    adoption1Id: 214,
    adoption2Id: 215,
    formId: 2,
    link: 'A00000000',
  };

  const newAgreement = await insertAgreement(agreement);
  await deleteAgreement(newAgreement.link);

  expect(newAgreement).not.toBeNull();
  expect(newAgreement).not.toBeUndefined();
  expect(newAgreement.id).toBeGreaterThan(1);
  expect(newAgreement).toHaveProperty('user_1_id', expect.anything());
  expect(newAgreement).toHaveProperty('user_2_id', expect.anything());
  expect(newAgreement).toHaveProperty('form_hash', expect.anything());
  expect(newAgreement).toHaveProperty('created', expect.anything());
  expect(newAgreement).toHaveProperty('adoption_1_id', expect.anything());
  expect(newAgreement).toHaveProperty('adoption_2_id', expect.anything());
  expect(newAgreement).toHaveProperty('link', expect.anything());
});


test('db/getByUserId returns agreements', async () => {
  const agreements = await getByUserId(29);

  expect(agreements).not.toBeNull();
  expect(agreements).not.toBeUndefined();
  expect(agreements.length).toBeGreaterThanOrEqual(1);
});


test('db/getByLink returns agreement', async () => {
  const agreement = await getByLink('AOWqNouNdX2');

  expect(agreement).not.toBeNull();
  expect(agreement).not.toBeUndefined();
  expect(agreement.id).toEqual(178);
});


test('db/getUserEmailsForAgreement returns emails', async () => {
  const userEmails = await getUserEmailsForAgreement('AOWqNouNdX2');
  expect(userEmails).not.toBeNull();
  expect(userEmails).not.toBeUndefined();
  const { email1, email2 } = userEmails;
  expect(email1).not.toBeNull();
  expect(email2).not.toBeNull();
  expect(email1).not.toBeUndefined();
  expect(email2).not.toBeUndefined();
});


afterAll(async (done) => {
  await closePool();
  done();
});
