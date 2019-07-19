'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Questanswer = mongoose.model('Questanswer'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Questanswer
 */
exports.create = function(req, res) {
  var questanswer = new Questanswer(req.body);
  questanswer.user = req.user;

  questanswer.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(questanswer);
    }
  });
};

/**
 * Show the current Questanswer
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var questanswer = req.questanswer ? req.questanswer.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  questanswer.isCurrentUserOwner = req.user && questanswer.user && questanswer.user._id.toString() === req.user._id.toString();

  res.jsonp(questanswer);
};

/**
 * Update a Questanswer
 */
exports.update = function(req, res) {
  var questanswer = req.questanswer;

  questanswer = _.extend(questanswer, req.body);

  questanswer.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(questanswer);
    }
  });
};

/**
 * Delete an Questanswer
 */
exports.delete = function(req, res) {
  var questanswer = req.questanswer;

  questanswer.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(questanswer);
    }
  });
};

/**
 * List of Questanswers
 */
exports.list = function(req, res) {
  Questanswer.find().sort('-created').populate('user', 'displayName').exec(function(err, questanswers) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(questanswers);
    }
  });
};

/**
 * Questanswer middleware
 */
exports.questanswerByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Questanswer is invalid'
    });
  }

  Questanswer.findById(id).populate('user', 'displayName').exec(function (err, questanswer) {
    if (err) {
      return next(err);
    } else if (!questanswer) {
      return res.status(404).send({
        message: 'No Questanswer with that identifier has been found'
      });
    }
    req.questanswer = questanswer;
    next();
  });
};
