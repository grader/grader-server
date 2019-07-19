'use strict';

/**
 * Module dependencies
 */
var mixblanksPolicy = require('../policies/mixblanks.server.policy'),
  mixblanks = require('../controllers/mixblanks.server.controller');

module.exports = function(app) {
  // Mixblanks Routes
  app.route('/api/mixblanks').all(mixblanksPolicy.isAllowed)
    .get(mixblanks.list)
    .post(mixblanks.create);

  app.route('/api/mixblanks/:mixblankId').all(mixblanksPolicy.isAllowed)
    .get(mixblanks.read)
    .put(mixblanks.update)
    .delete(mixblanks.delete);

  // Finish by binding the Mixblank middleware
  app.param('mixblankId', mixblanks.mixblankByID);
};
