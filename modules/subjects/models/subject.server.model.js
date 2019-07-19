'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Subject Schema
 */
var SubjectSchema = new Schema({
  name: {
    type: String,
    required: 'Please fill Subject name'
  },
  code: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});
SubjectSchema.statics.seed = seed;
mongoose.model('Subject', SubjectSchema);

function seed(doc, options) {
  var Subject = mongoose.model('Subject');

  return new Promise(function (resolve, reject) {

    skipDocument()
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Subject
          .findOne({
            name: doc.name
          })
          .exec(function (err, existing) {
            if (err) {
              return reject(err);
            }

            if (!existing) {
              return resolve(false);
            }

            if (existing && !options.overwrite) {
              return resolve(true);
            }

            // Remove Subject (overwrite)
            existing.remove(function (err) {
              if (err) {
                return reject(err);
              }

              return resolve(false);
            });
          });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve({
            message: chalk.yellow('Database Seeding: Subject\t' + doc.name + ' skipped')
          });
        }

        var subject = new Subject(doc);

        subject.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Subject\t' + subject.name + ' added'
          });
        });
      });
    }
  });
}
