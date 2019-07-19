'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Blank = mongoose.model('Blank'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  blank;

/**
 * Blank routes tests
 */
describe('Blank CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Blank
    user.save(function () {
      blank = {
        name: 'Blank name'
      };

      done();
    });
  });

  it('should be able to save a Blank if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Blank
        agent.post('/api/blanks')
          .send(blank)
          .expect(200)
          .end(function (blankSaveErr, blankSaveRes) {
            // Handle Blank save error
            if (blankSaveErr) {
              return done(blankSaveErr);
            }

            // Get a list of Blanks
            agent.get('/api/blanks')
              .end(function (blanksGetErr, blanksGetRes) {
                // Handle Blanks save error
                if (blanksGetErr) {
                  return done(blanksGetErr);
                }

                // Get Blanks list
                var blanks = blanksGetRes.body;

                // Set assertions
                (blanks[0].user._id).should.equal(userId);
                (blanks[0].name).should.match('Blank name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Blank if not logged in', function (done) {
    agent.post('/api/blanks')
      .send(blank)
      .expect(403)
      .end(function (blankSaveErr, blankSaveRes) {
        // Call the assertion callback
        done(blankSaveErr);
      });
  });

  it('should not be able to save an Blank if no name is provided', function (done) {
    // Invalidate name field
    blank.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Blank
        agent.post('/api/blanks')
          .send(blank)
          .expect(400)
          .end(function (blankSaveErr, blankSaveRes) {
            // Set message assertion
            (blankSaveRes.body.message).should.match('Please fill Blank name');

            // Handle Blank save error
            done(blankSaveErr);
          });
      });
  });

  it('should be able to update an Blank if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Blank
        agent.post('/api/blanks')
          .send(blank)
          .expect(200)
          .end(function (blankSaveErr, blankSaveRes) {
            // Handle Blank save error
            if (blankSaveErr) {
              return done(blankSaveErr);
            }

            // Update Blank name
            blank.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Blank
            agent.put('/api/blanks/' + blankSaveRes.body._id)
              .send(blank)
              .expect(200)
              .end(function (blankUpdateErr, blankUpdateRes) {
                // Handle Blank update error
                if (blankUpdateErr) {
                  return done(blankUpdateErr);
                }

                // Set assertions
                (blankUpdateRes.body._id).should.equal(blankSaveRes.body._id);
                (blankUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Blanks if not signed in', function (done) {
    // Create new Blank model instance
    var blankObj = new Blank(blank);

    // Save the blank
    blankObj.save(function () {
      // Request Blanks
      request(app).get('/api/blanks')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Blank if not signed in', function (done) {
    // Create new Blank model instance
    var blankObj = new Blank(blank);

    // Save the Blank
    blankObj.save(function () {
      request(app).get('/api/blanks/' + blankObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', blank.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Blank with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/blanks/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Blank is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Blank which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Blank
    request(app).get('/api/blanks/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Blank with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Blank if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Blank
        agent.post('/api/blanks')
          .send(blank)
          .expect(200)
          .end(function (blankSaveErr, blankSaveRes) {
            // Handle Blank save error
            if (blankSaveErr) {
              return done(blankSaveErr);
            }

            // Delete an existing Blank
            agent.delete('/api/blanks/' + blankSaveRes.body._id)
              .send(blank)
              .expect(200)
              .end(function (blankDeleteErr, blankDeleteRes) {
                // Handle blank error error
                if (blankDeleteErr) {
                  return done(blankDeleteErr);
                }

                // Set assertions
                (blankDeleteRes.body._id).should.equal(blankSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Blank if not signed in', function (done) {
    // Set Blank user
    blank.user = user;

    // Create new Blank model instance
    var blankObj = new Blank(blank);

    // Save the Blank
    blankObj.save(function () {
      // Try deleting Blank
      request(app).delete('/api/blanks/' + blankObj._id)
        .expect(403)
        .end(function (blankDeleteErr, blankDeleteRes) {
          // Set message assertion
          (blankDeleteRes.body.message).should.match('User is not authorized');

          // Handle Blank error error
          done(blankDeleteErr);
        });

    });
  });

  it('should be able to get a single Blank that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Blank
          agent.post('/api/blanks')
            .send(blank)
            .expect(200)
            .end(function (blankSaveErr, blankSaveRes) {
              // Handle Blank save error
              if (blankSaveErr) {
                return done(blankSaveErr);
              }

              // Set assertions on new Blank
              (blankSaveRes.body.name).should.equal(blank.name);
              should.exist(blankSaveRes.body.user);
              should.equal(blankSaveRes.body.user._id, orphanId);

              // force the Blank to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Blank
                    agent.get('/api/blanks/' + blankSaveRes.body._id)
                      .expect(200)
                      .end(function (blankInfoErr, blankInfoRes) {
                        // Handle Blank error
                        if (blankInfoErr) {
                          return done(blankInfoErr);
                        }

                        // Set assertions
                        (blankInfoRes.body._id).should.equal(blankSaveRes.body._id);
                        (blankInfoRes.body.name).should.equal(blank.name);
                        should.equal(blankInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Blank.remove().exec(done);
    });
  });
});
