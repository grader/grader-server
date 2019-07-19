'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Mixblank = mongoose.model('Mixblank'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Mixblank
 */
exports.create = function(req, res) {
  var mixblank = new Mixblank(req.body);
  mixblank.user = req.user;

  mixblank.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixblank);
    }
  });
};

/**
 * Show the current Mixblank
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var mixblank = req.mixblank ? req.mixblank.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  mixblank.isCurrentUserOwner = req.user && mixblank.user && mixblank.user._id.toString() === req.user._id.toString();

  res.jsonp(mixblank);
};

/**
 * Update a Mixblank
 */
exports.update = function(req, res) {
  var mixblank = req.mixblank;

  mixblank = _.extend(mixblank, req.body);

  mixblank.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixblank);
    }
  });
};

/**
 * Delete an Mixblank
 */
exports.delete = function(req, res) {
  var mixblank = req.mixblank;

  mixblank.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixblank);
    }
  });
};

/**
 * List of Mixblanks
 */
exports.list = function(req, res) {
  Mixblank.find().sort('-created').populate('user', 'displayName').exec(function(err, mixblanks) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixblanks);
    }
  });
};

/**
 * Mixblank middleware
 */
exports.mixblankByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Mixblank is invalid'
    });
  }

  Mixblank.findById(id).populate('user', 'displayName').exec(function (err, mixblank) {
    if (err) {
      return next(err);
    } else if (!mixblank) {
      return res.status(404).send({
        message: 'No Mixblank with that identifier has been found'
      });
    }
    req.mixblank = mixblank;
    next();
  });
};
