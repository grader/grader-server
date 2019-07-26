'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Singlechoice Schema
 */
const SinglechoiceSchema = new Schema({
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
  choiceItems: {
    type: Array,
    required: true
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

mongoose.model('Singlechoice', SinglechoiceSchema);
