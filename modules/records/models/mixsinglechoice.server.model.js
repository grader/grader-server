'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Mixsinglechoice Schema
 */
var MixsinglechoiceSchema = new Schema({
  stem: {
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
  analysis: {
    type: String
  }
});

mongoose.model('Mixsinglechoice', MixsinglechoiceSchema);
