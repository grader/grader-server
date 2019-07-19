'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Mixmultichoice = mongoose.model('Mixmultichoice'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Mixmultichoice
 */
exports.create = function(req, res) {
  var mixmultichoice = new Mixmultichoice(req.body);
  mixmultichoice.user = req.user;

  mixmultichoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixmultichoice);
    }
  });
};

/**
 * Show the current Mixmultichoice
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var mixmultichoice = req.mixmultichoice ? req.mixmultichoice.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  mixmultichoice.isCurrentUserOwner = req.user && mixmultichoice.user && mixmultichoice.user._id.toString() === req.user._id.toString();

  res.jsonp(mixmultichoice);
};

/**
 * Update a Mixmultichoice
 */
exports.update = function(req, res) {
  var mixmultichoice = req.mixmultichoice;

  mixmultichoice = _.extend(mixmultichoice, req.body);

  mixmultichoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixmultichoice);
    }
  });
};

/**
 * Delete an Mixmultichoice
 */
exports.delete = function(req, res) {
  var mixmultichoice = req.mixmultichoice;

  mixmultichoice.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixmultichoice);
    }
  });
};

/**
 * List of Mixmultichoices
 */
exports.list = function(req, res) {
  Mixmultichoice.find().sort('-created').populate('user', 'displayName').exec(function(err, mixmultichoices) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixmultichoices);
    }
  });
};

/**
 * Mixmultichoice middleware
 */
exports.mixmultichoiceByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Mixmultichoice is invalid'
    });
  }

  Mixmultichoice.findById(id).populate('user', 'displayName').exec(function (err, mixmultichoice) {
    if (err) {
      return next(err);
    } else if (!mixmultichoice) {
      return res.status(404).send({
        message: 'No Mixmultichoice with that identifier has been found'
      });
    }
    req.mixmultichoice = mixmultichoice;
    next();
  });
};
