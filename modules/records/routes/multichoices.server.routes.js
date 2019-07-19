'use strict';

/**
 * Module dependencies
 */
var multichoicesPolicy = require('../policies/multichoices.server.policy'),
  multichoices = require('../controllers/multichoices.server.controller');

module.exports = function(app) {
  // Multichoices Routes
  app.route('/api/multichoices').all(multichoicesPolicy.isAllowed)
    .get(multichoices.list)
    .post(multichoices.create);

  app.route('/api/multichoices/:multichoiceId').all(multichoicesPolicy.isAllowed)
    .get(multichoices.read)
    .put(multichoices.update)
    .delete(multichoices.delete);

  // Finish by binding the Multichoice middleware
  app.param('multichoiceId', multichoices.multichoiceByID);
};
