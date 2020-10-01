const express = require('express'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),
      cors = require('cors'),
      errorHandler = require('errorhandler');

const apiRouter = require('./api/api');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/api', apiRouter);

app.use(errorHandler());

app.listen(PORT, ()=> {
  console.log(`Listening on port: ${PORT}`)
})

module.exports = app;