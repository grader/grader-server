'use strict';

/**
 * Module dependencies.
 */
const path = require('path'),
  mongoose = require('mongoose'),
  Subject = mongoose.model('Subject'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Subject
 */
exports.create = function(req, res) {
  const subject = new Subject(req.body);
  subject.user = req.user;

  subject.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(subject);
    }
  });
};

/**
 * Show the current Subject
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  const subject = req.subject ? req.subject.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  subject.isCurrentUserOwner = req.user && subject.user && subject.user._id.toString() === req.user._id.toString();

  res.jsonp(subject);
};

/**
 * Update a Subject
 */
exports.update = function(req, res) {
  let subject = req.subject;

  subject = _.extend(subject, req.body);

  subject.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(subject);
    }
  });
};

/**
 * Delete an Subject
 */
exports.delete = function(req, res) {
  const subject = req.subject;

  subject.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(subject);
    }
  });
};

/**
 * List of Subjects
 */
exports.list = function(req, res) {

  let options = req.query;
  options.page = options.page ? options.page : 1;
  options.limit = options.limit? options.limit : 10;
  options.sort = '-created';
  Subject.paginate({}, options, function (err, subjects) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(subjects);
  });
};

/**
 * Subject middleware
 */
exports.subjectByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Subject is invalid'
    });
  }

  Subject.findById(id).populate('user', 'displayName').exec(function (err, subject) {
    if (err) {
      return next(err);
    } else if (!subject) {
      return res.status(404).send({
        message: 'No Subject with that identifier has been found'
      });
    }
    req.subject = subject;
    next();
  });
};
