'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Blank = mongoose.model('Blank'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Blank
 */
exports.create = function(req, res) {
  var blank = new Blank(req.body);
  blank.user = req.user;

  blank.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(blank);
    }
  });
};

/**
 * Show the current Blank
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var blank = req.blank ? req.blank.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  blank.isCurrentUserOwner = req.user && blank.user && blank.user._id.toString() === req.user._id.toString();

  res.jsonp(blank);
};

/**
 * Update a Blank
 */
exports.update = function(req, res) {
  var blank = req.blank;

  blank = _.extend(blank, req.body);

  blank.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(blank);
    }
  });
};

/**
 * Delete an Blank
 */
exports.delete = function(req, res) {
  var blank = req.blank;

  blank.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(blank);
    }
  });
};

/**
 * List of Blanks
 */
exports.list = function(req, res) {
  Blank.find().sort('-created').populate('user', 'displayName').exec(function(err, blanks) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(blanks);
    }
  });
};

/**
 * Blank middleware
 */
exports.blankByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Blank is invalid'
    });
  }

  Blank.findById(id).populate('user', 'displayName').exec(function (err, blank) {
    if (err) {
      return next(err);
    } else if (!blank) {
      return res.status(404).send({
        message: 'No Blank with that identifier has been found'
      });
    }
    req.blank = blank;
    next();
  });
};
