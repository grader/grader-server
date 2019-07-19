'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Multichoice = mongoose.model('Multichoice');

/**
 * Globals
 */
var user,
  multichoice;

/**
 * Unit tests
 */
describe('Multichoice Model Unit Tests:', function() {
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
      multichoice = new Multichoice({
        name: 'Multichoice Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return multichoice.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      multichoice.name = '';

      return multichoice.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Multichoice.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
