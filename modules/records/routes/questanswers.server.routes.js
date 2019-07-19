'use strict';

/**
 * Module dependencies
 */
var questanswersPolicy = require('../policies/questanswers.server.policy'),
  questanswers = require('../controllers/questanswers.server.controller');

module.exports = function(app) {
  // Questanswers Routes
  app.route('/api/questanswers').all(questanswersPolicy.isAllowed)
    .get(questanswers.list)
    .post(questanswers.create);

  app.route('/api/questanswers/:questanswerId').all(questanswersPolicy.isAllowed)
    .get(questanswers.read)
    .put(questanswers.update)
    .delete(questanswers.delete);

  // Finish by binding the Questanswer middleware
  app.param('questanswerId', questanswers.questanswerByID);
};
