'use strict';

/**
 * Module dependencies
 */
var mixjudgesPolicy = require('../policies/mixjudges.server.policy'),
  mixjudges = require('../controllers/mixjudges.server.controller');

module.exports = function(app) {
  // Mixjudges Routes
  app.route('/api/mixjudges').all(mixjudgesPolicy.isAllowed)
    .get(mixjudges.list)
    .post(mixjudges.create);

  app.route('/api/mixjudges/:mixjudgeId').all(mixjudgesPolicy.isAllowed)
    .get(mixjudges.read)
    .put(mixjudges.update)
    .delete(mixjudges.delete);

  // Finish by binding the Mixjudge middleware
  app.param('mixjudgeId', mixjudges.mixjudgeByID);
};
