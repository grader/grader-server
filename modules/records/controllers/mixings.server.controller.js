'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Mixing = mongoose.model('Mixing'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Mixing
 */
exports.create = function(req, res) {
  var mixing = new Mixing(req.body);
  mixing.user = req.user;

  mixing.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixing);
    }
  });
};

/**
 * Show the current Mixing
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var mixing = req.mixing ? req.mixing.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  mixing.isCurrentUserOwner = req.user && mixing.user && mixing.user._id.toString() === req.user._id.toString();

  res.jsonp(mixing);
};

/**
 * Update a Mixing
 */
exports.update = function(req, res) {
  var mixing = req.mixing;

  mixing = _.extend(mixing, req.body);

  mixing.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixing);
    }
  });
};

/**
 * Delete an Mixing
 */
exports.delete = function(req, res) {
  var mixing = req.mixing;

  mixing.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixing);
    }
  });
};

/**
 * List of Mixings
 */
exports.list = function(req, res) {
  Mixing.find().sort('-created').populate('user', 'displayName').exec(function(err, mixings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixings);
    }
  });
};

/**
 * Mixing middleware
 */
exports.mixingByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Mixing is invalid'
    });
  }

  Mixing.findById(id).populate('user', 'displayName').exec(function (err, mixing) {
    if (err) {
      return next(err);
    } else if (!mixing) {
      return res.status(404).send({
        message: 'No Mixing with that identifier has been found'
      });
    }
    req.mixing = mixing;
    next();
  });
};
