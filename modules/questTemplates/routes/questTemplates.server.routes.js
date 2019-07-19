'use strict';

/**
 * Module dependencies
 */
var questTemplatesPolicy = require('../policies/questTemplates.server.policy'),
  questTemplates = require('../controllers/questTemplates.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/questTemplates').all(questTemplatesPolicy.isAllowed)
    .get(questTemplates.list)
    .post(questTemplates.create);

  // Single article routes
  app.route('/api/questTemplates/:questTemplateId').all(questTemplatesPolicy.isAllowed)
    .get(questTemplates.read)
    .put(questTemplates.update)
    .delete(questTemplates.delete);

  // Finish by binding the article middleware
  app.param('questTemplateId', questTemplates.questTemplateByID);
};
