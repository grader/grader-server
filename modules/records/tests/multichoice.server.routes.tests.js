'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Multichoice = mongoose.model('Multichoice'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  multichoice;

/**
 * Multichoice routes tests
 */
describe('Multichoice CRUD tests', function () {

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

    // Save a user to the test db and create new Multichoice
    user.save(function () {
      multichoice = {
        name: 'Multichoice name'
      };

      done();
    });
  });

  it('should be able to save a Multichoice if logged in', function (done) {
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

        // Save a new Multichoice
        agent.post('/api/multichoices')
          .send(multichoice)
          .expect(200)
          .end(function (multichoiceSaveErr, multichoiceSaveRes) {
            // Handle Multichoice save error
            if (multichoiceSaveErr) {
              return done(multichoiceSaveErr);
            }

            // Get a list of Multichoices
            agent.get('/api/multichoices')
              .end(function (multichoicesGetErr, multichoicesGetRes) {
                // Handle Multichoices save error
                if (multichoicesGetErr) {
                  return done(multichoicesGetErr);
                }

                // Get Multichoices list
                var multichoices = multichoicesGetRes.body;

                // Set assertions
                (multichoices[0].user._id).should.equal(userId);
                (multichoices[0].name).should.match('Multichoice name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Multichoice if not logged in', function (done) {
    agent.post('/api/multichoices')
      .send(multichoice)
      .expect(403)
      .end(function (multichoiceSaveErr, multichoiceSaveRes) {
        // Call the assertion callback
        done(multichoiceSaveErr);
      });
  });

  it('should not be able to save an Multichoice if no name is provided', function (done) {
    // Invalidate name field
    multichoice.name = '';

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

        // Save a new Multichoice
        agent.post('/api/multichoices')
          .send(multichoice)
          .expect(400)
          .end(function (multichoiceSaveErr, multichoiceSaveRes) {
            // Set message assertion
            (multichoiceSaveRes.body.message).should.match('Please fill Multichoice name');

            // Handle Multichoice save error
            done(multichoiceSaveErr);
          });
      });
  });

  it('should be able to update an Multichoice if signed in', function (done) {
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

        // Save a new Multichoice
        agent.post('/api/multichoices')
          .send(multichoice)
          .expect(200)
          .end(function (multichoiceSaveErr, multichoiceSaveRes) {
            // Handle Multichoice save error
            if (multichoiceSaveErr) {
              return done(multichoiceSaveErr);
            }

            // Update Multichoice name
            multichoice.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Multichoice
            agent.put('/api/multichoices/' + multichoiceSaveRes.body._id)
              .send(multichoice)
              .expect(200)
              .end(function (multichoiceUpdateErr, multichoiceUpdateRes) {
                // Handle Multichoice update error
                if (multichoiceUpdateErr) {
                  return done(multichoiceUpdateErr);
                }

                // Set assertions
                (multichoiceUpdateRes.body._id).should.equal(multichoiceSaveRes.body._id);
                (multichoiceUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Multichoices if not signed in', function (done) {
    // Create new Multichoice model instance
    var multichoiceObj = new Multichoice(multichoice);

    // Save the multichoice
    multichoiceObj.save(function () {
      // Request Multichoices
      request(app).get('/api/multichoices')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Multichoice if not signed in', function (done) {
    // Create new Multichoice model instance
    var multichoiceObj = new Multichoice(multichoice);

    // Save the Multichoice
    multichoiceObj.save(function () {
      request(app).get('/api/multichoices/' + multichoiceObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', multichoice.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Multichoice with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/multichoices/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Multichoice is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Multichoice which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Multichoice
    request(app).get('/api/multichoices/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Multichoice with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Multichoice if signed in', function (done) {
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

        // Save a new Multichoice
        agent.post('/api/multichoices')
          .send(multichoice)
          .expect(200)
          .end(function (multichoiceSaveErr, multichoiceSaveRes) {
            // Handle Multichoice save error
            if (multichoiceSaveErr) {
              return done(multichoiceSaveErr);
            }

            // Delete an existing Multichoice
            agent.delete('/api/multichoices/' + multichoiceSaveRes.body._id)
              .send(multichoice)
              .expect(200)
              .end(function (multichoiceDeleteErr, multichoiceDeleteRes) {
                // Handle multichoice error error
                if (multichoiceDeleteErr) {
                  return done(multichoiceDeleteErr);
                }

                // Set assertions
                (multichoiceDeleteRes.body._id).should.equal(multichoiceSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Multichoice if not signed in', function (done) {
    // Set Multichoice user
    multichoice.user = user;

    // Create new Multichoice model instance
    var multichoiceObj = new Multichoice(multichoice);

    // Save the Multichoice
    multichoiceObj.save(function () {
      // Try deleting Multichoice
      request(app).delete('/api/multichoices/' + multichoiceObj._id)
        .expect(403)
        .end(function (multichoiceDeleteErr, multichoiceDeleteRes) {
          // Set message assertion
          (multichoiceDeleteRes.body.message).should.match('User is not authorized');

          // Handle Multichoice error error
          done(multichoiceDeleteErr);
        });

    });
  });

  it('should be able to get a single Multichoice that has an orphaned user reference', function (done) {
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

          // Save a new Multichoice
          agent.post('/api/multichoices')
            .send(multichoice)
            .expect(200)
            .end(function (multichoiceSaveErr, multichoiceSaveRes) {
              // Handle Multichoice save error
              if (multichoiceSaveErr) {
                return done(multichoiceSaveErr);
              }

              // Set assertions on new Multichoice
              (multichoiceSaveRes.body.name).should.equal(multichoice.name);
              should.exist(multichoiceSaveRes.body.user);
              should.equal(multichoiceSaveRes.body.user._id, orphanId);

              // force the Multichoice to have an orphaned user reference
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

                    // Get the Multichoice
                    agent.get('/api/multichoices/' + multichoiceSaveRes.body._id)
                      .expect(200)
                      .end(function (multichoiceInfoErr, multichoiceInfoRes) {
                        // Handle Multichoice error
                        if (multichoiceInfoErr) {
                          return done(multichoiceInfoErr);
                        }

                        // Set assertions
                        (multichoiceInfoRes.body._id).should.equal(multichoiceSaveRes.body._id);
                        (multichoiceInfoRes.body.name).should.equal(multichoice.name);
                        should.equal(multichoiceInfoRes.body.user, undefined);

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
      Multichoice.remove().exec(done);
    });
  });
});
