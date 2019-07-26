'use strict';

/**
 * Module dependencies
 */
const subjectsPolicy = require('../policies/subjects.server.policy'),
  subjects = require('../controllers/subjects.server.controller');

module.exports = function(app) {
  // Subjects Routes
  app.route('/api/subjects').all(subjectsPolicy.isAllowed)
    .get(subjects.list)
    .post(subjects.create);

  app.route('/api/subjects/:subjectId').all(subjectsPolicy.isAllowed)
    .get(subjects.read)
    .put(subjects.update)
    .delete(subjects.delete);

  // Finish by binding the Subject middleware
  app.param('subjectId', subjects.subjectByID);
};
