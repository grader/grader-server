'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Mixjudge Schema
 */
const MixjudgeSchema = new Schema({
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
