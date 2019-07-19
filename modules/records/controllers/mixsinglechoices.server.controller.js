'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Mixsinglechoice = mongoose.model('Mixsinglechoice'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Mixsinglechoice
 */
exports.create = function(req, res) {
  var mixsinglechoice = new Mixsinglechoice(req.body);
  mixsinglechoice.user = req.user;

  mixsinglechoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixsinglechoice);
    }
  });
};

/**
 * Show the current Mixsinglechoice
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var mixsinglechoice = req.mixsinglechoice ? req.mixsinglechoice.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  mixsinglechoice.isCurrentUserOwner = req.user && mixsinglechoice.user && mixsinglechoice.user._id.toString() === req.user._id.toString();

  res.jsonp(mixsinglechoice);
};

/**
 * Update a Mixsinglechoice
 */
exports.update = function(req, res) {
  var mixsinglechoice = req.mixsinglechoice;

  mixsinglechoice = _.extend(mixsinglechoice, req.body);

  mixsinglechoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixsinglechoice);
    }
  });
};

/**
 * Delete an Mixsinglechoice
 */
exports.delete = function(req, res) {
  var mixsinglechoice = req.mixsinglechoice;

  mixsinglechoice.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixsinglechoice);
    }
  });
};

/**
 * List of Mixsinglechoices
 */
exports.list = function(req, res) {
  Mixsinglechoice.find().sort('-created').populate('user', 'displayName').exec(function(err, mixsinglechoices) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixsinglechoices);
    }
  });
};

/**
 * Mixsinglechoice middleware
 */
exports.mixsinglechoiceByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Mixsinglechoice is invalid'
    });
  }

  Mixsinglechoice.findById(id).populate('user', 'displayName').exec(function (err, mixsinglechoice) {
    if (err) {
      return next(err);
    } else if (!mixsinglechoice) {
      return res.status(404).send({
        message: 'No Mixsinglechoice with that identifier has been found'
      });
    }
    req.mixsinglechoice = mixsinglechoice;
    next();
  });
};
