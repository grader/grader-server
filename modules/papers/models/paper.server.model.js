'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Paper Schema
 */
var PaperSchema = new Schema({
  title: {
    type: String,
    required: 'Please fill Paper title',
  },
  subject: {
    type: Schema.ObjectId,
    ref: 'Subject'
  },
  created: {
    type: Date,
    default: Date.now
  },
  questions: {
    type: Array
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Paper', PaperSchema);
