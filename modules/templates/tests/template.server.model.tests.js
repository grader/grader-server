'use strict';

/**
 * Module dependencies.
 */
const should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Template = mongoose.model('Template');

/**
 * Globals
 */
const user,
  template;

/**
 * Unit tests
 */
describe('Template Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      template = new Template({
        name: 'Template Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return template.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      template.name = '';

      return template.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Template.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
