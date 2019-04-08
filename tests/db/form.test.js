require('dotenv').config();

const { initializePool, closePool } = require('../../src/db');
const {
  getAvatarsOfFormAdopters,
  getAllForms,
  getFormByHash,
  getFormById,
  inserForm,
  deleteForm,
} = require('../../src/db/form');


beforeAll(async () => {
  await initializePool();
});


test('inserForm inserts form', async () => {
  const newForm = await inserForm('test hash', 'test content');
  await deleteForm(newForm.id);

  expect(newForm).toEqual(expect.anything());
  expect(newForm).toHaveProperty('hash', expect.anything());
  expect(newForm).toHaveProperty('content', expect.anything());
  expect(newForm).toHaveProperty('id', expect.anything());
});


test('getAvatarsOfFormAdopters returns avatars and names', async () => {
  const avatars = await getAvatarsOfFormAdopters(2);

  expect(avatars).toEqual(expect.anything());
  expect(avatars.length).toBeGreaterThan(0);
  expect(avatars[0]).toHaveProperty('avatar_url', expect.anything());
  expect(avatars[0]).toHaveProperty('full_name', expect.anything());
});

test('getAllForms returns forms', async () => {
  const forms = await getAllForms();

  expect(forms).toEqual(expect.anything());
  expect(forms.length).toBeGreaterThan(0);
  expect(forms[0]).toHaveProperty('content', expect.anything());
  expect(forms[0]).toHaveProperty('hash', expect.anything());
});


test('getFormByHash returns form', async () => {
  const form = await getFormByHash('629e19b8bc3489e0b5fa284b07a2c727');

  expect(form).toEqual(expect.anything());
  expect(form).toHaveProperty('content', expect.anything());
  expect(form).toHaveProperty('hash', expect.anything());
});


test('getFormById returns form', async () => {
  const form = await getFormById(2);

  expect(form).toEqual(expect.anything());
  expect(form).toHaveProperty('content', expect.anything());
  expect(form).toHaveProperty('hash', expect.anything());
});


afterAll(async (done) => {
  await closePool();
  done();
});
