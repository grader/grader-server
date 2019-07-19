'use strict';

/**
 * Module dependencies
 */
var mixmultichoicesPolicy = require('../policies/mixmultichoices.server.policy'),
  mixmultichoices = require('../controllers/mixmultichoices.server.controller');

module.exports = function(app) {
  // Mixmultichoices Routes
  app.route('/api/mixmultichoices').all(mixmultichoicesPolicy.isAllowed)
    .get(mixmultichoices.list)
    .post(mixmultichoices.create);

  app.route('/api/mixmultichoices/:mixmultichoiceId').all(mixmultichoicesPolicy.isAllowed)
    .get(mixmultichoices.read)
    .put(mixmultichoices.update)
    .delete(mixmultichoices.delete);

  // Finish by binding the Mixmultichoice middleware
  app.param('mixmultichoiceId', mixmultichoices.mixmultichoiceByID);
};
