
'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const winston = require('winston');
const router = require('./bookmarksRoute');
const bodyParser = express.json();

const app = express();

const logger = winston.createLogger({
  level:'info',
  format:winston.format.json(),
  transports: [
    new winston.transports.File({filename: 'info.log'})
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format:winston.format.simple()
  }));
}

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use((req, res, next) => {
  const authToken = req.get('Authorization');
  if (!authToken || (authToken.split(' ')[1] !== process.env.API_KEY)) {
    return res.status(401).json({error: 'Unauthorized request'});
  }
  next();
});

app.use(morgan(morganOption));
app.use(bodyParser);
app.use(helmet());
app.use(cors());

app.use(router);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = {error: {message: 'server error'} };
  } else {
    console.error(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;
