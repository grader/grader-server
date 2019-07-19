'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Tag = mongoose.model('Tag'),
  url = require('url'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Tag
 */
exports.create = function(req, res) {
  var tag = new Tag(req.body);
  tag.user = req.user;

  tag.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tag);
    }
  });
};

/**
 * Show the current Tag
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var tag = req.tag ? req.tag.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  tag.isCurrentUserOwner = req.user && tag.user && tag.user._id.toString() === req.user._id.toString();

  res.jsonp(tag);
};

/**
 * Update a Tag
 */
exports.update = function(req, res) {
  var tag = req.tag;

  tag = _.extend(tag, req.body);

  tag.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tag);
    }
  });
};

/**
 * Delete an Tag
 */
exports.delete = function(req, res) {
  var tag = req.tag;

  tag.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tag);
    }
  });
};

/**
 * List of Tags
 */
exports.list = function(req, res) {
  var queryParams = url.parse(req.url, true).query
  var subjectId = mongoose.Types.ObjectId(queryParams.subjectId);
  var shared = queryParams.shared;

  var query;
  if (subjectId && shared==='true')
    query = {"$or": [{subject: subjectId}, {subject: null}]};
  else if(subjectId)
    query = {subject: subjectId};
  else if(shared==='true')
    query = {subject: null};

  Tag.find(query).sort('-created').populate('user', 'displayName').exec(function(err, tags) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tags);
    }
  });
};

/**
 * Tag middleware
 */
exports.tagByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Tag is invalid'
    });
  }

  Tag.findById(id).populate('user', 'displayName').exec(function (err, tag) {
    if (err) {
      return next(err);
    } else if (!tag) {
      return res.status(404).send({
        message: 'No Tag with that identifier has been found'
      });
    }
    req.tag = tag;
    next();
  });
};
