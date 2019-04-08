require('dotenv').config();
const { initializePool, closePool } = require('../../src/db');
const {
  getById,
  getByLink,
  getUserByEmail,
  insertUser,
  deleteUser,
} = require('../../src/db/user');

beforeAll(async () => {
  await initializePool();
});


const validateUser = (user) => {
  expect(user).toEqual(expect.anything());
  expect(user).toHaveProperty('email', expect.anything());
  expect(user).toHaveProperty('avatar_url', expect.anything());
  expect(user).toHaveProperty('full_name', expect.anything());
  expect(user).toHaveProperty('id', expect.anything());
};


test('getById returns user', async () => {
  const user = await getById(29);
  validateUser(user);
});


test('getByLink returns user', async () => {
  const user = await getByLink('U1OhoCFpu0c');
  validateUser(user);
});


test('getByEmail returns user', async () => {
  const user = await getUserByEmail('test@trustbot.io');
  validateUser(user);
});


test('insertUser inserts user', async () => {
  const user = {
    email: 'test+1@example.com',
    avatarUrl: 'test',
    link: 'U00000000',
    created: new Date().getTime(),
    fullName: 'Test Test',
  };

  const newUser = await insertUser(user);

  validateUser(newUser);

  await deleteUser(newUser.id);
});


afterAll(async (done) => {
  await closePool();
  done();
});
