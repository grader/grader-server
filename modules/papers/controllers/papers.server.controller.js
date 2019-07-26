'use strict';

/**
 * Module dependencies.
 */
const path = require('path'),
  mongoose = require('mongoose'),
  Promise = require('promise'),
  Paper = mongoose.model('Paper'),
  Singlechoice = mongoose.model('Singlechoice'),
  Multichoice = mongoose.model('Multichoice'),
  Questanswer = mongoose.model('Questanswer'),
  Blank = mongoose.model('Blank'),
  Judge = mongoose.model('Judge'),
  Mixing = mongoose.model('Mixing'),

  errorHandler = require(path.resolve('./modules/core/controllers/errors.server.controller')),
  _ = require('lodash');


/**
 * Create a Paper
 */
exports.create = function(req, res) {
  let template = req.body;
  let paper = new Paper();
  paper.title = template.title;
  paper.subject = template.subject;
  paper.user = req.user;

  let paperStructs = template.paperStructs;

  let questions = [];
  let queryPromises = [];

  let subjectId = mongoose.Types.ObjectId(template.subject);
  let query = {subject: subjectId,
    random: {$near: [Math.random().toFixed(2), Math.random().toFixed(2)]}
  };

  for(let index in paperStructs) {
    let questsSet = paperStructs[index];

    let difficulty = parseFloat(questsSet.difficulty);
    query.difficulty = {$gte: difficulty-1, $lte: difficulty+1};
    let tags = questsSet.tags;

    if (tags.length >  0){
      query.tags = {"$all": tags};
    }

    if (questsSet.questType === 'singleChoice'){
      queryPromises.push(Singlechoice.find(query).limit(parseInt(questsSet.number)).exec());
    } else if (questsSet.questType === 'multiChoice'){
      queryPromises.push(Multichoice.find(query).limit(parseInt(questsSet.number)).exec());
    } else if (questsSet.questType === 'blank'){
      queryPromises.push(Blank.find(query).limit(parseInt(questsSet.number)).exec());
    } else if (questsSet.questType === 'judge'){
      queryPromises.push(Judge.find(query).limit(parseInt(questsSet.number)).exec());
    } else if (questsSet.questType === 'questAnswer'){
      queryPromises.push(Questanswer.find(query).limit(parseInt(questsSet.number)).exec());
    } else if (questsSet.questType === 'mixing'){
      queryPromises.push(Mixing.find(query).limit(parseInt(questsSet.number)).exec());
    }
  }

  Promise.all(queryPromises).then(function(values) {
    for(const index in paperStructs) {
      const questsSet = paperStructs[index];
      questsSet.questions = values[index];
      questions.push(questsSet);
    }
    paper.questions = questions;
    paper.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(paper);
      }
    });
  }).catch(function(reason) {
    console.error(reason);
  });
};


/**
 * Show the current Paper
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  let paper = req.paper ? req.paper.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  paper.isCurrentUserOwner = req.user && paper.user && paper.user._id.toString() === req.user._id.toString();

  res.jsonp(paper);
};

/**
 * Update a Paper
 */
exports.update = function(req, res) {
  const paper = req.paper;

  paper = _.extend(paper, req.body);

  paper.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(paper);
    }
  });
};

/**
 * Delete an Paper
 */
exports.delete = function(req, res) {
  const paper = req.paper;

  paper.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(paper);
    }
  });
};

/**
 * List of Papers
 */
exports.list = function(req, res) {
  Paper.find().sort('-created').populate('user', 'displayName').exec(function(err, papers) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(papers);
    }
  });
};

/**
 * Paper middleware
 */
exports.paperByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Paper is invalid'
    });
  }

  Paper.findById(id).populate('user', 'displayName').exec(function (err, paper) {
    if (err) {
      return next(err);
    } else if (!paper) {
      return res.status(404).send({
        message: 'No Paper with that identifier has been found'
      });
    }
    req.paper = paper;
    next();
  });
};
