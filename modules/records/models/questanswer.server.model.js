'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Questanswer Schema
 */
var QuestanswerSchema = new Schema({
  stem: {
    type: String,
    required: 'Please fill Questanswer stem'
  },
  difficulty: {
    type: Number,
    default: 4,
    min: 0,
    max: 5
  },
  description: {
    type: String
  },
  answer: {
    type: String,
    required: true
  },
  subject: {
    type: Schema.ObjectId,
    ref: 'Subject'
  },
  analysis: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  random: {
    type: [Number],
    index: '2d',
    default: [Math.random().toFixed(2), Math.random().toFixed(2)]
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Questanswer', QuestanswerSchema);
