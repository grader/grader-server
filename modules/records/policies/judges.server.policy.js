'use strict';

/**
 * Module dependencies
 */
let acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Judges Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/judges',
      permissions: '*'
    }, {
      resources: '/api/judges/:judgeId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/judges',
      permissions: ['get', 'post']
    }, {
      resources: '/api/judges/:judgeId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/judges',
      permissions: ['get']
    }, {
      resources: '/api/judges/:judgeId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Judges Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Judge is being processed and the current user created it then allow any manipulation
  if (req.judge && req.user && req.judge.user && req.judge.user.id === req.user.id) {
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
