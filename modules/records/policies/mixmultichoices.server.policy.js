'use strict';

/**
 * Module dependencies
 */
let acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Mixmultichoices Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/mixmultichoices',
      permissions: '*'
    }, {
      resources: '/api/mixmultichoices/:mixmultichoiceId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/mixmultichoices',
      permissions: ['get', 'post']
    }, {
      resources: '/api/mixmultichoices/:mixmultichoiceId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/mixmultichoices',
      permissions: ['get']
    }, {
      resources: '/api/mixmultichoices/:mixmultichoiceId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Mixmultichoices Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Mixmultichoice is being processed and the current user created it then allow any manipulation
  if (req.mixmultichoice && req.user && req.mixmultichoice.user && req.mixmultichoice.user.id === req.user.id) {
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
