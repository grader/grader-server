'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Mixmultichoice Schema
 */
const MixmultichoiceSchema = new Schema({
  stem: {
    type: String
  },
  choiceItems: {
    type: Array,
    required: true
  },
  answer: {
    type: Array,
    required: true
  },
  analysis: {
    type: String
  }
});

mongoose.model('Mixmultichoice', MixmultichoiceSchema);
