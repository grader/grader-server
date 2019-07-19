'use strict';

/**
 * Module dependencies
 */
var papersPolicy = require('../policies/papers.server.policy'),
  papers = require('../controllers/papers.server.controller');

module.exports = function(app) {
  // Papers Routes
  app.route('/api/papers').all(papersPolicy.isAllowed)
    .get(papers.list)
    .post(papers.create);

  app.route('/api/papers/:paperId').all(papersPolicy.isAllowed)
    .get(papers.read)
    .put(papers.update)
    .delete(papers.delete);

  // Finish by binding the Paper middleware
  app.param('paperId', papers.paperByID);
};
