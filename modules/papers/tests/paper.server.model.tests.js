'use strict';

/**
 * Module dependencies.
 */
const should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Paper = mongoose.model('Paper');

/**
 * Globals
 */
const user,
  paper;

/**
 * Unit tests
 */
describe('Paper Model Unit Tests:', function() {
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
      paper = new Paper({
        name: 'Paper Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return paper.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      paper.name = '';

      return paper.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Paper.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
