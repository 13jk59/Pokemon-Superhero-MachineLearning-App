var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var conv_modelRouter = require('./routes/convModel');
var languageModelRouter = require('./routes/languageModel');
var compression = require('compression');
var helmet = require('helmet');
require('dotenv').config();

var app = express();
app.use(compression());

app.use(
    helmet({
        contentSecurityPolicy: false,
    }),
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// find the static css, html, js files from the client
app.use(express.static(path.join(__dirname, '../client/build')));

// since this is a react app, all the views are handled by the frontend
// so we have our route handlers for the api endpoints our server should provide
// but if the route doesnt match any of the data endpoints, we just send the html file back and
// react will handle the routing for the views from there
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// mount the routers that serve the ml models
app.use('/convModel', conv_modelRouter);
app.use('/languageModel', languageModelRouter);

const port = process.env.PORT || 3002;

if (process.env.NODE_ENV !== 'TEST') {
    app.listen(port);
}

module.exports = app;
