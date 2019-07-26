'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Template Schema
 */
const TemplateSchema = new Schema({
  title: {
    type: String,
    required: 'Please fill Template name',
  },
  created: {
    type: Date,
    default: Date.now
  },
  subject: {
    type: Schema.ObjectId,
    ref: 'Subject'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  paperStructs: {
    type: Array
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Template', TemplateSchema);
