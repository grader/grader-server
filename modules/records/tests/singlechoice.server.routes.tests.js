'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Singlechoice = mongoose.model('Singlechoice'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  singlechoice;

/**
 * Singlechoice routes tests
 */
describe('Singlechoice CRUD tests', function () {

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

    // Save a user to the test db and create new Singlechoice
    user.save(function () {
      singlechoice = {
        name: 'Singlechoice name'
      };

      done();
    });
  });

  it('should be able to save a Singlechoice if logged in', function (done) {
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

        // Save a new Singlechoice
        agent.post('/api/singlechoices')
          .send(singlechoice)
          .expect(200)
          .end(function (singlechoiceSaveErr, singlechoiceSaveRes) {
            // Handle Singlechoice save error
            if (singlechoiceSaveErr) {
              return done(singlechoiceSaveErr);
            }

            // Get a list of Singlechoices
            agent.get('/api/singlechoices')
              .end(function (singlechoicesGetErr, singlechoicesGetRes) {
                // Handle Singlechoices save error
                if (singlechoicesGetErr) {
                  return done(singlechoicesGetErr);
                }

                // Get Singlechoices list
                var singlechoices = singlechoicesGetRes.body;

                // Set assertions
                (singlechoices[0].user._id).should.equal(userId);
                (singlechoices[0].name).should.match('Singlechoice name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Singlechoice if not logged in', function (done) {
    agent.post('/api/singlechoices')
      .send(singlechoice)
      .expect(403)
      .end(function (singlechoiceSaveErr, singlechoiceSaveRes) {
        // Call the assertion callback
        done(singlechoiceSaveErr);
      });
  });

  it('should not be able to save an Singlechoice if no name is provided', function (done) {
    // Invalidate name field
    singlechoice.name = '';

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

        // Save a new Singlechoice
        agent.post('/api/singlechoices')
          .send(singlechoice)
          .expect(400)
          .end(function (singlechoiceSaveErr, singlechoiceSaveRes) {
            // Set message assertion
            (singlechoiceSaveRes.body.message).should.match('Please fill Singlechoice name');

            // Handle Singlechoice save error
            done(singlechoiceSaveErr);
          });
      });
  });

  it('should be able to update an Singlechoice if signed in', function (done) {
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

        // Save a new Singlechoice
        agent.post('/api/singlechoices')
          .send(singlechoice)
          .expect(200)
          .end(function (singlechoiceSaveErr, singlechoiceSaveRes) {
            // Handle Singlechoice save error
            if (singlechoiceSaveErr) {
              return done(singlechoiceSaveErr);
            }

            // Update Singlechoice name
            singlechoice.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Singlechoice
            agent.put('/api/singlechoices/' + singlechoiceSaveRes.body._id)
              .send(singlechoice)
              .expect(200)
              .end(function (singlechoiceUpdateErr, singlechoiceUpdateRes) {
                // Handle Singlechoice update error
                if (singlechoiceUpdateErr) {
                  return done(singlechoiceUpdateErr);
                }

                // Set assertions
                (singlechoiceUpdateRes.body._id).should.equal(singlechoiceSaveRes.body._id);
                (singlechoiceUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Singlechoices if not signed in', function (done) {
    // Create new Singlechoice model instance
    var singlechoiceObj = new Singlechoice(singlechoice);

    // Save the singlechoice
    singlechoiceObj.save(function () {
      // Request Singlechoices
      request(app).get('/api/singlechoices')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Singlechoice if not signed in', function (done) {
    // Create new Singlechoice model instance
    var singlechoiceObj = new Singlechoice(singlechoice);

    // Save the Singlechoice
    singlechoiceObj.save(function () {
      request(app).get('/api/singlechoices/' + singlechoiceObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', singlechoice.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Singlechoice with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/singlechoices/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Singlechoice is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Singlechoice which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Singlechoice
    request(app).get('/api/singlechoices/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Singlechoice with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Singlechoice if signed in', function (done) {
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

        // Save a new Singlechoice
        agent.post('/api/singlechoices')
          .send(singlechoice)
          .expect(200)
          .end(function (singlechoiceSaveErr, singlechoiceSaveRes) {
            // Handle Singlechoice save error
            if (singlechoiceSaveErr) {
              return done(singlechoiceSaveErr);
            }

            // Delete an existing Singlechoice
            agent.delete('/api/singlechoices/' + singlechoiceSaveRes.body._id)
              .send(singlechoice)
              .expect(200)
              .end(function (singlechoiceDeleteErr, singlechoiceDeleteRes) {
                // Handle singlechoice error error
                if (singlechoiceDeleteErr) {
                  return done(singlechoiceDeleteErr);
                }

                // Set assertions
                (singlechoiceDeleteRes.body._id).should.equal(singlechoiceSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Singlechoice if not signed in', function (done) {
    // Set Singlechoice user
    singlechoice.user = user;

    // Create new Singlechoice model instance
    var singlechoiceObj = new Singlechoice(singlechoice);

    // Save the Singlechoice
    singlechoiceObj.save(function () {
      // Try deleting Singlechoice
      request(app).delete('/api/singlechoices/' + singlechoiceObj._id)
        .expect(403)
        .end(function (singlechoiceDeleteErr, singlechoiceDeleteRes) {
          // Set message assertion
          (singlechoiceDeleteRes.body.message).should.match('User is not authorized');

          // Handle Singlechoice error error
          done(singlechoiceDeleteErr);
        });

    });
  });

  it('should be able to get a single Singlechoice that has an orphaned user reference', function (done) {
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

          // Save a new Singlechoice
          agent.post('/api/singlechoices')
            .send(singlechoice)
            .expect(200)
            .end(function (singlechoiceSaveErr, singlechoiceSaveRes) {
              // Handle Singlechoice save error
              if (singlechoiceSaveErr) {
                return done(singlechoiceSaveErr);
              }

              // Set assertions on new Singlechoice
              (singlechoiceSaveRes.body.name).should.equal(singlechoice.name);
              should.exist(singlechoiceSaveRes.body.user);
              should.equal(singlechoiceSaveRes.body.user._id, orphanId);

              // force the Singlechoice to have an orphaned user reference
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

                    // Get the Singlechoice
                    agent.get('/api/singlechoices/' + singlechoiceSaveRes.body._id)
                      .expect(200)
                      .end(function (singlechoiceInfoErr, singlechoiceInfoRes) {
                        // Handle Singlechoice error
                        if (singlechoiceInfoErr) {
                          return done(singlechoiceInfoErr);
                        }

                        // Set assertions
                        (singlechoiceInfoRes.body._id).should.equal(singlechoiceSaveRes.body._id);
                        (singlechoiceInfoRes.body.name).should.equal(singlechoice.name);
                        should.equal(singlechoiceInfoRes.body.user, undefined);

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
      Singlechoice.remove().exec(done);
    });
  });
});
