'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Mixing Schema
 */
var MixingSchema = new Schema({
  stem: {
    type: String,
    required: 'Please fill Mixing stem',
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
  subject: {
    type: Schema.ObjectId,
    ref: 'Subject'
  },
  subQuests: {
    type: Array
  },
  tags: {
    type: Array,
    required: 'Please add one tags',
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

mongoose.model('Mixing', MixingSchema);
