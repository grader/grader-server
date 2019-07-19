'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Questanswer = mongoose.model('Questanswer'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  questanswer;

/**
 * Questanswer routes tests
 */
describe('Questanswer CRUD tests', function () {

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

    // Save a user to the test db and create new Questanswer
    user.save(function () {
      questanswer = {
        name: 'Questanswer name'
      };

      done();
    });
  });

  it('should be able to save a Questanswer if logged in', function (done) {
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

        // Save a new Questanswer
        agent.post('/api/questanswers')
          .send(questanswer)
          .expect(200)
          .end(function (questanswerSaveErr, questanswerSaveRes) {
            // Handle Questanswer save error
            if (questanswerSaveErr) {
              return done(questanswerSaveErr);
            }

            // Get a list of Questanswers
            agent.get('/api/questanswers')
              .end(function (questanswersGetErr, questanswersGetRes) {
                // Handle Questanswers save error
                if (questanswersGetErr) {
                  return done(questanswersGetErr);
                }

                // Get Questanswers list
                var questanswers = questanswersGetRes.body;

                // Set assertions
                (questanswers[0].user._id).should.equal(userId);
                (questanswers[0].name).should.match('Questanswer name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Questanswer if not logged in', function (done) {
    agent.post('/api/questanswers')
      .send(questanswer)
      .expect(403)
      .end(function (questanswerSaveErr, questanswerSaveRes) {
        // Call the assertion callback
        done(questanswerSaveErr);
      });
  });

  it('should not be able to save an Questanswer if no name is provided', function (done) {
    // Invalidate name field
    questanswer.name = '';

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

        // Save a new Questanswer
        agent.post('/api/questanswers')
          .send(questanswer)
          .expect(400)
          .end(function (questanswerSaveErr, questanswerSaveRes) {
            // Set message assertion
            (questanswerSaveRes.body.message).should.match('Please fill Questanswer name');

            // Handle Questanswer save error
            done(questanswerSaveErr);
          });
      });
  });

  it('should be able to update an Questanswer if signed in', function (done) {
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

        // Save a new Questanswer
        agent.post('/api/questanswers')
          .send(questanswer)
          .expect(200)
          .end(function (questanswerSaveErr, questanswerSaveRes) {
            // Handle Questanswer save error
            if (questanswerSaveErr) {
              return done(questanswerSaveErr);
            }

            // Update Questanswer name
            questanswer.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Questanswer
            agent.put('/api/questanswers/' + questanswerSaveRes.body._id)
              .send(questanswer)
              .expect(200)
              .end(function (questanswerUpdateErr, questanswerUpdateRes) {
                // Handle Questanswer update error
                if (questanswerUpdateErr) {
                  return done(questanswerUpdateErr);
                }

                // Set assertions
                (questanswerUpdateRes.body._id).should.equal(questanswerSaveRes.body._id);
                (questanswerUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Questanswers if not signed in', function (done) {
    // Create new Questanswer model instance
    var questanswerObj = new Questanswer(questanswer);

    // Save the questanswer
    questanswerObj.save(function () {
      // Request Questanswers
      request(app).get('/api/questanswers')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Questanswer if not signed in', function (done) {
    // Create new Questanswer model instance
    var questanswerObj = new Questanswer(questanswer);

    // Save the Questanswer
    questanswerObj.save(function () {
      request(app).get('/api/questanswers/' + questanswerObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', questanswer.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Questanswer with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/questanswers/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Questanswer is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Questanswer which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Questanswer
    request(app).get('/api/questanswers/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Questanswer with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Questanswer if signed in', function (done) {
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

        // Save a new Questanswer
        agent.post('/api/questanswers')
          .send(questanswer)
          .expect(200)
          .end(function (questanswerSaveErr, questanswerSaveRes) {
            // Handle Questanswer save error
            if (questanswerSaveErr) {
              return done(questanswerSaveErr);
            }

            // Delete an existing Questanswer
            agent.delete('/api/questanswers/' + questanswerSaveRes.body._id)
              .send(questanswer)
              .expect(200)
              .end(function (questanswerDeleteErr, questanswerDeleteRes) {
                // Handle questanswer error error
                if (questanswerDeleteErr) {
                  return done(questanswerDeleteErr);
                }

                // Set assertions
                (questanswerDeleteRes.body._id).should.equal(questanswerSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Questanswer if not signed in', function (done) {
    // Set Questanswer user
    questanswer.user = user;

    // Create new Questanswer model instance
    var questanswerObj = new Questanswer(questanswer);

    // Save the Questanswer
    questanswerObj.save(function () {
      // Try deleting Questanswer
      request(app).delete('/api/questanswers/' + questanswerObj._id)
        .expect(403)
        .end(function (questanswerDeleteErr, questanswerDeleteRes) {
          // Set message assertion
          (questanswerDeleteRes.body.message).should.match('User is not authorized');

          // Handle Questanswer error error
          done(questanswerDeleteErr);
        });

    });
  });

  it('should be able to get a single Questanswer that has an orphaned user reference', function (done) {
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

          // Save a new Questanswer
          agent.post('/api/questanswers')
            .send(questanswer)
            .expect(200)
            .end(function (questanswerSaveErr, questanswerSaveRes) {
              // Handle Questanswer save error
              if (questanswerSaveErr) {
                return done(questanswerSaveErr);
              }

              // Set assertions on new Questanswer
              (questanswerSaveRes.body.name).should.equal(questanswer.name);
              should.exist(questanswerSaveRes.body.user);
              should.equal(questanswerSaveRes.body.user._id, orphanId);

              // force the Questanswer to have an orphaned user reference
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

                    // Get the Questanswer
                    agent.get('/api/questanswers/' + questanswerSaveRes.body._id)
                      .expect(200)
                      .end(function (questanswerInfoErr, questanswerInfoRes) {
                        // Handle Questanswer error
                        if (questanswerInfoErr) {
                          return done(questanswerInfoErr);
                        }

                        // Set assertions
                        (questanswerInfoRes.body._id).should.equal(questanswerSaveRes.body._id);
                        (questanswerInfoRes.body.name).should.equal(questanswer.name);
                        should.equal(questanswerInfoRes.body.user, undefined);

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
      Questanswer.remove().exec(done);
    });
  });
});
