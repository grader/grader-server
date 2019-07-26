'use strict';

/**
 * Module dependencies
 */
let acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Singlechoices Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/singlechoices',
      permissions: '*'
    }, {
      resources: '/api/singlechoices/:singlechoiceId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/singlechoices',
      permissions: ['get', 'post']
    }, {
      resources: '/api/singlechoices/:singlechoiceId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/singlechoices',
      permissions: ['get']
    }, {
      resources: '/api/singlechoices/:singlechoiceId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Singlechoices Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Singlechoice is being processed and the current user created it then allow any manipulation
  if (req.singlechoice && req.user && req.singlechoice.user && req.singlechoice.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
