'use strict';

/**
 * Module dependencies
 */
var singlechoicesPolicy = require('../policies/singlechoices.server.policy'),
  singlechoices = require('../controllers/singlechoices.server.controller');

module.exports = function(app) {
  // Singlechoices Routes
  app.route('/api/singlechoices').all(singlechoicesPolicy.isAllowed)
    .get(singlechoices.list)
    .post(singlechoices.create);

  app.route('/api/singlechoices/:singlechoiceId').all(singlechoicesPolicy.isAllowed)
    .get(singlechoices.read)
    .put(singlechoices.update)
    .delete(singlechoices.delete);

  // Finish by binding the Singlechoice middleware
  app.param('singlechoiceId', singlechoices.singlechoiceByID);
};
