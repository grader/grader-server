'use strict';

/**
 * Module dependencies.
 */

const path = require('path');
const app = require(path.resolve('./config/lib/app'));

app.init(function () {
  console.log('Initialized test automation');
});
