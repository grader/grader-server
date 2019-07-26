'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Mixquestanswer Schema
 */
const MixquestanswerSchema = new Schema({
  stem: {
    type: String,
    required: 'Please fill Singlechoice stem'
  },
  answer: {
    type: String,
    required: true
  },
  analysis: {
    type: String
  }
});

mongoose.model('Mixquestanswer', MixquestanswerSchema);
