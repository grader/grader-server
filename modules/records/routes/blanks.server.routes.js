'use strict';

/**
 * Module dependencies
 */
const blanksPolicy = require('../policies/blanks.server.policy'),
  blanks = require('../controllers/blanks.server.controller');

module.exports = function(app) {
  // Blanks Routes
  app.route('/api/blanks').all(blanksPolicy.isAllowed)
    .get(blanks.list)
    .post(blanks.create);

  app.route('/api/blanks/:blankId').all(blanksPolicy.isAllowed)
    .get(blanks.read)
    .put(blanks.update)
    .delete(blanks.delete);

  // Finish by binding the Blank middleware
  app.param('blankId', blanks.blankByID);
};
