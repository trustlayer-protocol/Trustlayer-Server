require('dotenv').config();
const {
  createNewAction,
  removeAction,
  getActionsForUser,
  getActionById,
  getActionByLink,
} = require('../../src/db/action');
const { initializePool, closePool } = require('../../src/db');

beforeAll(async () => {
  await initializePool();
});

test('db/createNewActon createsAction', async () => {
  const link = 'D000000000';

  const timestamp = new Date().getTime();
  const action = {
    formId: 2,
    formHash: '629e19b8bc3489e0b5fa284b07a2c727',
    userId: 6,
    action: 'adopt',
    link,
    created: timestamp,
    ip: '127.0.00.00',
    transactionHash: 'soamsdmqii1m1i1i2i2mamsmsjuu2n12nAWDAda',
  };


  const createdAction = await createNewAction(action);

  await removeAction(link);
  expect(createdAction).not.toBeNull();
  expect(createdAction).not.toBeUndefined();
  expect(createdAction).toHaveProperty('form_id', expect.anything());
  expect(createdAction).toHaveProperty('form_hash', expect.anything());
  expect(createdAction).toHaveProperty('user_id', expect.anything());
  expect(createdAction).toHaveProperty('action', expect.anything());
  expect(createdAction).toHaveProperty('bc_transaction_hash', expect.anything());
});


test('db/getActionsForUser returns all actions', async () => {
  const actions = await getActionsForUser(29);

  expect(actions).not.toBeNull();
  expect(actions).not.toBeUndefined();
  expect(actions.length).toBeGreaterThanOrEqual(7);
});


test('db/getActionsForUser returns only adoptions', async () => {
  const actions = await getActionsForUser(29, 'adopt');
  expect(actions.length).toBeGreaterThanOrEqual(5);
});


test('db/getActionsForUser limits properly', async () => {
  const actions = await getActionsForUser(29, null, 1);
  expect(actions.length).toBeGreaterThanOrEqual(1);
});


test('db/getActionByLink returns the right action', async () => {
  const action = await getActionByLink('DDu9FQJL7HD');

  expect(action).not.toBeNull();
  expect(action).not.toBeUndefined();
  expect(action.id).toEqual(204);
});


test('db/getActionbyId returns the right action', async () => {
  const action = await getActionById(204);

  expect(action).not.toBeNull();
  expect(action).not.toBeUndefined();
  expect(action.id).toEqual(204);
});


afterAll(async (done) => {
  await closePool();
  done();
});
