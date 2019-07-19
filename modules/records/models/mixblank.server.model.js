'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Mixblank Schema
 */
var MixblankSchema = new Schema({
  stem: {
    type: String,
    required: 'Please fill Singlechoice stem'
  },
  blankNumber: {
    type: Number,
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

mongoose.model('Mixblank', MixblankSchema);
