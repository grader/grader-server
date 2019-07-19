'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Multichoice = mongoose.model('Multichoice'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Multichoice
 */
exports.create = function(req, res) {
  var multichoice = new Multichoice(req.body);
  multichoice.user = req.user;

  multichoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(multichoice);
    }
  });
};

/**
 * Show the current Multichoice
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var multichoice = req.multichoice ? req.multichoice.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  multichoice.isCurrentUserOwner = req.user && multichoice.user && multichoice.user._id.toString() === req.user._id.toString();

  res.jsonp(multichoice);
};

/**
 * Update a Multichoice
 */
exports.update = function(req, res) {
  var multichoice = req.multichoice;

  multichoice = _.extend(multichoice, req.body);

  multichoice.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(multichoice);
    }
  });
};

/**
 * Delete an Multichoice
 */
exports.delete = function(req, res) {
  var multichoice = req.multichoice;

  multichoice.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(multichoice);
    }
  });
};

/**
 * List of Multichoices
 */
exports.list = function(req, res) {
  Multichoice.find().sort('-created').populate('user', 'displayName').exec(function(err, multichoices) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(multichoices);
    }
  });
};

/**
 * Multichoice middleware
 */
exports.multichoiceByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Multichoice is invalid'
    });
  }

  Multichoice.findById(id).populate('user', 'displayName').exec(function (err, multichoice) {
    if (err) {
      return next(err);
    } else if (!multichoice) {
      return res.status(404).send({
        message: 'No Multichoice with that identifier has been found'
      });
    }
    req.multichoice = multichoice;
    next();
  });
};
