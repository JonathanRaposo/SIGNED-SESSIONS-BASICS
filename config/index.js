
const path = require('path')
const logger = require('morgan');
const express = require('express');

module.exports = (app) => {
    app.use(logger('dev'));
    app.use(express.static(path.join(__dirname, '..', 'static-files')));
    app.use(express.urlencoded({ extended: false }));
    app.set('views', path.join(__dirname, '..', 'views'));
    app.set('view engine', 'hbs');

}