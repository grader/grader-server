'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Mixquestanswer = mongoose.model('Mixquestanswer'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Mixquestanswer
 */
exports.create = function(req, res) {
  var mixquestanswer = new Mixquestanswer(req.body);
  mixquestanswer.user = req.user;

  mixquestanswer.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixquestanswer);
    }
  });
};

/**
 * Show the current Mixquestanswer
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var mixquestanswer = req.mixquestanswer ? req.mixquestanswer.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  mixquestanswer.isCurrentUserOwner = req.user && mixquestanswer.user && mixquestanswer.user._id.toString() === req.user._id.toString();

  res.jsonp(mixquestanswer);
};

/**
 * Update a Mixquestanswer
 */
exports.update = function(req, res) {
  var mixquestanswer = req.mixquestanswer;

  mixquestanswer = _.extend(mixquestanswer, req.body);

  mixquestanswer.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixquestanswer);
    }
  });
};

/**
 * Delete an Mixquestanswer
 */
exports.delete = function(req, res) {
  var mixquestanswer = req.mixquestanswer;

  mixquestanswer.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixquestanswer);
    }
  });
};

/**
 * List of Mixquestanswers
 */
exports.list = function(req, res) {
  Mixquestanswer.find().sort('-created').populate('user', 'displayName').exec(function(err, mixquestanswers) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(mixquestanswers);
    }
  });
};

/**
 * Mixquestanswer middleware
 */
exports.mixquestanswerByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Mixquestanswer is invalid'
    });
  }

  Mixquestanswer.findById(id).populate('user', 'displayName').exec(function (err, mixquestanswer) {
    if (err) {
      return next(err);
    } else if (!mixquestanswer) {
      return res.status(404).send({
        message: 'No Mixquestanswer with that identifier has been found'
      });
    }
    req.mixquestanswer = mixquestanswer;
    next();
  });
};
