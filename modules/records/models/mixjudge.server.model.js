'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Mixjudge Schema
 */
var MixjudgeSchema = new Schema({
  stem: {
    type: String,
    required: 'Please fill Judge stem'
  },
  answer: {
    type: String,
    required: true
  },
  analysis: {
    type: String
  }
});

mongoose.model('Mixjudge', MixjudgeSchema);
