'use strict';

/**
 * Module dependencies
 */
var mixsinglechoicesPolicy = require('../policies/mixsinglechoices.server.policy'),
  mixsinglechoices = require('../controllers/mixsinglechoices.server.controller');

module.exports = function(app) {
  // Mixsinglechoices Routes
  app.route('/api/mixsinglechoices').all(mixsinglechoicesPolicy.isAllowed)
    .get(mixsinglechoices.list)
    .post(mixsinglechoices.create);

  app.route('/api/mixsinglechoices/:mixsinglechoiceId').all(mixsinglechoicesPolicy.isAllowed)
    .get(mixsinglechoices.read)
    .put(mixsinglechoices.update)
    .delete(mixsinglechoices.delete);

  // Finish by binding the Mixsinglechoice middleware
  app.param('mixsinglechoiceId', mixsinglechoices.mixsinglechoiceByID);
};
