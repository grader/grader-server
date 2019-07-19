'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Singlechoice = mongoose.model('Singlechoice'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Singlechoice
 */
exports.create = function(req, res) {
  var singlechoice = new Singlechoice(req.body);
  singlechoice.user = req.user;

  singlechoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(singlechoice);
    }
  });
};

/**
 * Show the current Singlechoice
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var singlechoice = req.singlechoice ? req.singlechoice.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  singlechoice.isCurrentUserOwner = req.user && singlechoice.user && singlechoice.user._id.toString() === req.user._id.toString();

  res.jsonp(singlechoice);
};

/**
 * Update a Singlechoice
 */
exports.update = function(req, res) {
  var singlechoice = req.singlechoice;

  singlechoice = _.extend(singlechoice, req.body);

  singlechoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(singlechoice);
    }
  });
};

/**
 * Delete an Singlechoice
 */
exports.delete = function(req, res) {
  var singlechoice = req.singlechoice;

  singlechoice.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(singlechoice);
    }
  });
};

/**
 * List of Singlechoices
 */
exports.list = function(req, res) {
  Singlechoice.find().sort('-created').populate('user', 'displayName').exec(function(err, singlechoices) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(singlechoices);
    }
  });
};

/**
 * Singlechoice middleware
 */
exports.singlechoiceByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Singlechoice is invalid'
    });
  }

  Singlechoice.findById(id).populate('user', 'displayName').exec(function (err, singlechoice) {
    if (err) {
      return next(err);
    } else if (!singlechoice) {
      return res.status(404).send({
        message: 'No Singlechoice with that identifier has been found'
      });
    }
    req.singlechoice = singlechoice;
    next();
  });
};
