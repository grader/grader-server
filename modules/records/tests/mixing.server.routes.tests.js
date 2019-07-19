'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Mixing = mongoose.model('Mixing'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  mixing;

/**
 * Mixing routes tests
 */
describe('Mixing CRUD tests', function () {

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

    // Save a user to the test db and create new Mixing
    user.save(function () {
      mixing = {
        name: 'Mixing name'
      };

      done();
    });
  });

  it('should be able to save a Mixing if logged in', function (done) {
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

        // Save a new Mixing
        agent.post('/api/mixings')
          .send(mixing)
          .expect(200)
          .end(function (mixingSaveErr, mixingSaveRes) {
            // Handle Mixing save error
            if (mixingSaveErr) {
              return done(mixingSaveErr);
            }

            // Get a list of Mixings
            agent.get('/api/mixings')
              .end(function (mixingsGetErr, mixingsGetRes) {
                // Handle Mixings save error
                if (mixingsGetErr) {
                  return done(mixingsGetErr);
                }

                // Get Mixings list
                var mixings = mixingsGetRes.body;

                // Set assertions
                (mixings[0].user._id).should.equal(userId);
                (mixings[0].name).should.match('Mixing name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Mixing if not logged in', function (done) {
    agent.post('/api/mixings')
      .send(mixing)
      .expect(403)
      .end(function (mixingSaveErr, mixingSaveRes) {
        // Call the assertion callback
        done(mixingSaveErr);
      });
  });

  it('should not be able to save an Mixing if no name is provided', function (done) {
    // Invalidate name field
    mixing.name = '';

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

        // Save a new Mixing
        agent.post('/api/mixings')
          .send(mixing)
          .expect(400)
          .end(function (mixingSaveErr, mixingSaveRes) {
            // Set message assertion
            (mixingSaveRes.body.message).should.match('Please fill Mixing name');

            // Handle Mixing save error
            done(mixingSaveErr);
          });
      });
  });

  it('should be able to update an Mixing if signed in', function (done) {
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

        // Save a new Mixing
        agent.post('/api/mixings')
          .send(mixing)
          .expect(200)
          .end(function (mixingSaveErr, mixingSaveRes) {
            // Handle Mixing save error
            if (mixingSaveErr) {
              return done(mixingSaveErr);
            }

            // Update Mixing name
            mixing.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Mixing
            agent.put('/api/mixings/' + mixingSaveRes.body._id)
              .send(mixing)
              .expect(200)
              .end(function (mixingUpdateErr, mixingUpdateRes) {
                // Handle Mixing update error
                if (mixingUpdateErr) {
                  return done(mixingUpdateErr);
                }

                // Set assertions
                (mixingUpdateRes.body._id).should.equal(mixingSaveRes.body._id);
                (mixingUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Mixings if not signed in', function (done) {
    // Create new Mixing model instance
    var mixingObj = new Mixing(mixing);

    // Save the mixing
    mixingObj.save(function () {
      // Request Mixings
      request(app).get('/api/mixings')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Mixing if not signed in', function (done) {
    // Create new Mixing model instance
    var mixingObj = new Mixing(mixing);

    // Save the Mixing
    mixingObj.save(function () {
      request(app).get('/api/mixings/' + mixingObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', mixing.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Mixing with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/mixings/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Mixing is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Mixing which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Mixing
    request(app).get('/api/mixings/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Mixing with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Mixing if signed in', function (done) {
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

        // Save a new Mixing
        agent.post('/api/mixings')
          .send(mixing)
          .expect(200)
          .end(function (mixingSaveErr, mixingSaveRes) {
            // Handle Mixing save error
            if (mixingSaveErr) {
              return done(mixingSaveErr);
            }

            // Delete an existing Mixing
            agent.delete('/api/mixings/' + mixingSaveRes.body._id)
              .send(mixing)
              .expect(200)
              .end(function (mixingDeleteErr, mixingDeleteRes) {
                // Handle mixing error error
                if (mixingDeleteErr) {
                  return done(mixingDeleteErr);
                }

                // Set assertions
                (mixingDeleteRes.body._id).should.equal(mixingSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Mixing if not signed in', function (done) {
    // Set Mixing user
    mixing.user = user;

    // Create new Mixing model instance
    var mixingObj = new Mixing(mixing);

    // Save the Mixing
    mixingObj.save(function () {
      // Try deleting Mixing
      request(app).delete('/api/mixings/' + mixingObj._id)
        .expect(403)
        .end(function (mixingDeleteErr, mixingDeleteRes) {
          // Set message assertion
          (mixingDeleteRes.body.message).should.match('User is not authorized');

          // Handle Mixing error error
          done(mixingDeleteErr);
        });

    });
  });

  it('should be able to get a single Mixing that has an orphaned user reference', function (done) {
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

          // Save a new Mixing
          agent.post('/api/mixings')
            .send(mixing)
            .expect(200)
            .end(function (mixingSaveErr, mixingSaveRes) {
              // Handle Mixing save error
              if (mixingSaveErr) {
                return done(mixingSaveErr);
              }

              // Set assertions on new Mixing
              (mixingSaveRes.body.name).should.equal(mixing.name);
              should.exist(mixingSaveRes.body.user);
              should.equal(mixingSaveRes.body.user._id, orphanId);

              // force the Mixing to have an orphaned user reference
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

                    // Get the Mixing
                    agent.get('/api/mixings/' + mixingSaveRes.body._id)
                      .expect(200)
                      .end(function (mixingInfoErr, mixingInfoRes) {
                        // Handle Mixing error
                        if (mixingInfoErr) {
                          return done(mixingInfoErr);
                        }

                        // Set assertions
                        (mixingInfoRes.body._id).should.equal(mixingSaveRes.body._id);
                        (mixingInfoRes.body.name).should.equal(mixing.name);
                        should.equal(mixingInfoRes.body.user, undefined);

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
      Mixing.remove().exec(done);
    });
  });
});
