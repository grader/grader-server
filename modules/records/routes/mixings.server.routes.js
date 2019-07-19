'use strict';

/**
 * Module dependencies
 */
var mixingsPolicy = require('../policies/mixings.server.policy'),
  mixings = require('../controllers/mixings.server.controller');

module.exports = function(app) {
  // Mixings Routes
  app.route('/api/mixings').all(mixingsPolicy.isAllowed)
    .get(mixings.list)
    .post(mixings.create);

  app.route('/api/mixings/:mixingId').all(mixingsPolicy.isAllowed)
    .get(mixings.read)
    .put(mixings.update)
    .delete(mixings.delete);

  // Finish by binding the Mixing middleware
  app.param('mixingId', mixings.mixingByID);
};
