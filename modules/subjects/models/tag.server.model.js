'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Tag Schema
 */
const TagSchema = new Schema({
  name: {
    type: String,
    required: 'Please fill Tag name',
    trim: true
  },
  subject: {
    type: Schema.ObjectId,
    ref: 'Subject'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Tag', TagSchema);
