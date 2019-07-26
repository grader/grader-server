'use strict';

/**
 * Module dependencies
 */
const path = require('path'),
  mongoose = require('mongoose'),
  QuestTemplate = mongoose.model('QuestTemplate'),
  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller'));

/**
 * Create an article
 */
exports.create = function (req, res) {
  const questTemplate = new QuestTemplate(req.body);
  questTemplate.userId = req.user._id;

  questTemplate.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(questTemplate);
    }
  });
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  const questTemplate = req.questTemplate ? req.questTemplate.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  questTemplate.isCurrentUserOwner = !!(req.user && questTemplate.userId === req.user._id.toString());

  res.json(questTemplate);
};

/**
 * Update an questTemplate
 */
exports.update = function (req, res) {
  const questTemplate = req.questTemplate;

  questTemplate.isDefault = req.body.isDefault;
  questTemplate.type = req.body.type;
  questTemplate.subject = req.body.subject;
  questTemplate.title = req.body.title;
  questTemplate.discription = req.body.discription;
  questTemplate.questionNumber = req.body.questionNumber;

  questTemplate.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(questTemplate);
    }
  });
};

/**
 * Delete an questTemplate
 */
exports.delete = function (req, res) {
  const questTemplate = req.questTemplate;

  questTemplate.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(questTemplate);
    }
  });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
  QuestTemplate.find().exec(function (err, questTemplates) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(questTemplates);
    }
  });
};

/**
 * QuestTemplate middleware
 */
exports.questTemplateByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'QuestTemplate is invalid'
    });
  }

  QuestTemplate.findById(id).populate('user', 'displayName').exec(function (err, questTemplates) {
    if (err) {
      return next(err);
    } else if (!questTemplates) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.questTemplates = questTemplates;
    next();
  });
};
