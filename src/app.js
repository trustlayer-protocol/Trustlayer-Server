require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const modify = require('./rest/modify');
const get = require('./rest/get');
const { initializePool } = require('./db');


const app = express();
app.use(bodyParser.json());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


app.use('/modify', modify);
app.use('/get', get);


app.get('/', (req, res) => {
  res.send('Hello Trustlayer');
});

initializePool();


const resultHandling = (req, res, next) => {
  if (res.locals.result) {
    res.status(200).send({ ok: true, result: res.locals.result });
  } else {
    res.status(204).send({ ok: true });
  }
  next();
};

app.use(resultHandling);


// eslint-disable-next-line no-unused-vars
const errorHandling = (err, req, res, next) => {
  let status = err.status || 500;
  if (err.code === 5) {
    status = 404;
  }
  console.log(err.stack);
  const message = status === 500 ? 'Internal server error' : err.message;
  let stackTrace = null;
  if (process.env && (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production')) {
    stackTrace = err.stack;
  }
  res.status(status).send({
    ok: false,
    error: {
      status,
      message,
      stackTrace,
    },
  });
};

app.use(errorHandling);


const port = 8081;
app.listen(port, () => console.log(`Trustlayer server listening on port: ${port}!`));
