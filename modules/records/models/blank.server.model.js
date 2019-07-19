'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Blank Schema
 */
var BlankSchema = new Schema({
  stem: {
    type: String,
    required: 'Please fill Singlechoice stem'
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
  blankNumber: {
    type: Number,
    required: true
  },
  answer: {
    type: Array,
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

mongoose.model('Blank', BlankSchema);
