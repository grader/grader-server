'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Judge = mongoose.model('Judge'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  judge;

/**
 * Judge routes tests
 */
describe('Judge CRUD tests', function () {

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

    // Save a user to the test db and create new Judge
    user.save(function () {
      judge = {
        name: 'Judge name'
      };

      done();
    });
  });

  it('should be able to save a Judge if logged in', function (done) {
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

        // Save a new Judge
        agent.post('/api/judges')
          .send(judge)
          .expect(200)
          .end(function (judgeSaveErr, judgeSaveRes) {
            // Handle Judge save error
            if (judgeSaveErr) {
              return done(judgeSaveErr);
            }

            // Get a list of Judges
            agent.get('/api/judges')
              .end(function (judgesGetErr, judgesGetRes) {
                // Handle Judges save error
                if (judgesGetErr) {
                  return done(judgesGetErr);
                }

                // Get Judges list
                var judges = judgesGetRes.body;

                // Set assertions
                (judges[0].user._id).should.equal(userId);
                (judges[0].name).should.match('Judge name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Judge if not logged in', function (done) {
    agent.post('/api/judges')
      .send(judge)
      .expect(403)
      .end(function (judgeSaveErr, judgeSaveRes) {
        // Call the assertion callback
        done(judgeSaveErr);
      });
  });

  it('should not be able to save an Judge if no name is provided', function (done) {
    // Invalidate name field
    judge.name = '';

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

        // Save a new Judge
        agent.post('/api/judges')
          .send(judge)
          .expect(400)
          .end(function (judgeSaveErr, judgeSaveRes) {
            // Set message assertion
            (judgeSaveRes.body.message).should.match('Please fill Judge name');

            // Handle Judge save error
            done(judgeSaveErr);
          });
      });
  });

  it('should be able to update an Judge if signed in', function (done) {
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

        // Save a new Judge
        agent.post('/api/judges')
          .send(judge)
          .expect(200)
          .end(function (judgeSaveErr, judgeSaveRes) {
            // Handle Judge save error
            if (judgeSaveErr) {
              return done(judgeSaveErr);
            }

            // Update Judge name
            judge.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Judge
            agent.put('/api/judges/' + judgeSaveRes.body._id)
              .send(judge)
              .expect(200)
              .end(function (judgeUpdateErr, judgeUpdateRes) {
                // Handle Judge update error
                if (judgeUpdateErr) {
                  return done(judgeUpdateErr);
                }

                // Set assertions
                (judgeUpdateRes.body._id).should.equal(judgeSaveRes.body._id);
                (judgeUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Judges if not signed in', function (done) {
    // Create new Judge model instance
    var judgeObj = new Judge(judge);

    // Save the judge
    judgeObj.save(function () {
      // Request Judges
      request(app).get('/api/judges')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Judge if not signed in', function (done) {
    // Create new Judge model instance
    var judgeObj = new Judge(judge);

    // Save the Judge
    judgeObj.save(function () {
      request(app).get('/api/judges/' + judgeObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', judge.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Judge with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/judges/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Judge is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Judge which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Judge
    request(app).get('/api/judges/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Judge with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Judge if signed in', function (done) {
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

        // Save a new Judge
        agent.post('/api/judges')
          .send(judge)
          .expect(200)
          .end(function (judgeSaveErr, judgeSaveRes) {
            // Handle Judge save error
            if (judgeSaveErr) {
              return done(judgeSaveErr);
            }

            // Delete an existing Judge
            agent.delete('/api/judges/' + judgeSaveRes.body._id)
              .send(judge)
              .expect(200)
              .end(function (judgeDeleteErr, judgeDeleteRes) {
                // Handle judge error error
                if (judgeDeleteErr) {
                  return done(judgeDeleteErr);
                }

                // Set assertions
                (judgeDeleteRes.body._id).should.equal(judgeSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Judge if not signed in', function (done) {
    // Set Judge user
    judge.user = user;

    // Create new Judge model instance
    var judgeObj = new Judge(judge);

    // Save the Judge
    judgeObj.save(function () {
      // Try deleting Judge
      request(app).delete('/api/judges/' + judgeObj._id)
        .expect(403)
        .end(function (judgeDeleteErr, judgeDeleteRes) {
          // Set message assertion
          (judgeDeleteRes.body.message).should.match('User is not authorized');

          // Handle Judge error error
          done(judgeDeleteErr);
        });

    });
  });

  it('should be able to get a single Judge that has an orphaned user reference', function (done) {
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

          // Save a new Judge
          agent.post('/api/judges')
            .send(judge)
            .expect(200)
            .end(function (judgeSaveErr, judgeSaveRes) {
              // Handle Judge save error
              if (judgeSaveErr) {
                return done(judgeSaveErr);
              }

              // Set assertions on new Judge
              (judgeSaveRes.body.name).should.equal(judge.name);
              should.exist(judgeSaveRes.body.user);
              should.equal(judgeSaveRes.body.user._id, orphanId);

              // force the Judge to have an orphaned user reference
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

                    // Get the Judge
                    agent.get('/api/judges/' + judgeSaveRes.body._id)
                      .expect(200)
                      .end(function (judgeInfoErr, judgeInfoRes) {
                        // Handle Judge error
                        if (judgeInfoErr) {
                          return done(judgeInfoErr);
                        }

                        // Set assertions
                        (judgeInfoRes.body._id).should.equal(judgeSaveRes.body._id);
                        (judgeInfoRes.body.name).should.equal(judge.name);
                        should.equal(judgeInfoRes.body.user, undefined);

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
      Judge.remove().exec(done);
    });
  });
});
