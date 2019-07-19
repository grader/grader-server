'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Mixquestanswer Schema
 */
var MixquestanswerSchema = new Schema({
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
