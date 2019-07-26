'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  chalk = require('chalk');

/**
 * QuestTemplate Schema
 */
const QuestTemplateSchema = new Schema({
  isDefault : {
    type: Boolean,
    default: true,
  },
  subject: {
    type: String,
    default: '',
    trim: true,
    required: 'subject cannot be blank'
  },
  type: {
    type: String,
    default: '',
    trim: true,
    required: 'type cannot be blank'
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'title cannot be blank'
  },
  description: {
    type: String,
    default: ''
  },
  questionNumber: {
    type: Number
  },
  userId: {
    type: String
  }
});

QuestTemplateSchema.statics.seed = seed;

mongoose.model('QuestTemplate', QuestTemplateSchema);

/**
* Seeds the User collection with document (Article)
* and provided options.
*/
function seed(doc, options) {
  const QuestTemplate = mongoose.model('QuestTemplate');

  return new Promise(function (resolve, reject) {

    skipDocument()
      .then(findAdminUser)
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function findAdminUser(skip) {
      const User = mongoose.model('User');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        User
          .findOne({
            roles: { $in: ['admin'] }
          })
          .exec(function (err, admin) {
            if (err) {
              return reject(err);
            }

            doc.user = admin;

            return resolve();
          });
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        QuestTemplate
          .findOne({
            title: doc.title
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

            // Remove QuestTemplate (overwrite)

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
            message: chalk.yellow('Database Seeding: Article\t' + doc.title + ' skipped')
          });
        }

        const questTemplate = new QuestTemplate(doc);

        questTemplate.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Article\t' + questTemplate.title + ' added'
          });
        });
      });
    }
  });
}
