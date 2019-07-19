'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Mixjudge = mongoose.model('Mixjudge'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Mixjudge
 */
exports.create = function(req, res) {
  var mixjudge = new Mixjudge(req.body);
  mixjudge.user = req.user;

  mixjudge.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixjudge);
    }
  });
};

/**
 * Show the current Mixjudge
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var mixjudge = req.mixjudge ? req.mixjudge.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  mixjudge.isCurrentUserOwner = req.user && mixjudge.user && mixjudge.user._id.toString() === req.user._id.toString();

  res.jsonp(mixjudge);
};

/**
 * Update a Mixjudge
 */
exports.update = function(req, res) {
  var mixjudge = req.mixjudge;

  mixjudge = _.extend(mixjudge, req.body);

  mixjudge.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixjudge);
    }
  });
};

/**
 * Delete an Mixjudge
 */
exports.delete = function(req, res) {
  var mixjudge = req.mixjudge;

  mixjudge.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixjudge);
    }
  });
};

/**
 * List of Mixjudges
 */
exports.list = function(req, res) {
  Mixjudge.find().sort('-created').populate('user', 'displayName').exec(function(err, mixjudges) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixjudges);
    }
  });
};

/**
 * Mixjudge middleware
 */
exports.mixjudgeByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Mixjudge is invalid'
    });
  }

  Mixjudge.findById(id).populate('user', 'displayName').exec(function (err, mixjudge) {
    if (err) {
      return next(err);
    } else if (!mixjudge) {
      return res.status(404).send({
        message: 'No Mixjudge with that identifier has been found'
      });
    }
    req.mixjudge = mixjudge;
    next();
  });
};
