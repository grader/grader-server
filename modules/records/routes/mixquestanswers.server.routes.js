'use strict';

/**
 * Module dependencies
 */
var mixquestanswersPolicy = require('../policies/mixquestanswers.server.policy'),
  mixquestanswers = require('../controllers/mixquestanswers.server.controller');

module.exports = function(app) {
  // Mixquestanswers Routes
  app.route('/api/mixquestanswers').all(mixquestanswersPolicy.isAllowed)
    .get(mixquestanswers.list)
    .post(mixquestanswers.create);

  app.route('/api/mixquestanswers/:mixquestanswerId').all(mixquestanswersPolicy.isAllowed)
    .get(mixquestanswers.read)
    .put(mixquestanswers.update)
    .delete(mixquestanswers.delete);

  // Finish by binding the Mixquestanswer middleware
  app.param('mixquestanswerId', mixquestanswers.mixquestanswerByID);
};
