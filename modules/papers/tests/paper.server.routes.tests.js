'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Paper = mongoose.model('Paper'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  paper;

/**
 * Paper routes tests
 */
describe('Paper CRUD tests', function () {

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

    // Save a user to the test db and create new Paper
    user.save(function () {
      paper = {
        name: 'Paper name'
      };

      done();
    });
  });

  it('should be able to save a Paper if logged in', function (done) {
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

        // Save a new Paper
        agent.post('/api/papers')
          .send(paper)
          .expect(200)
          .end(function (paperSaveErr, paperSaveRes) {
            // Handle Paper save error
            if (paperSaveErr) {
              return done(paperSaveErr);
            }

            // Get a list of Papers
            agent.get('/api/papers')
              .end(function (papersGetErr, papersGetRes) {
                // Handle Papers save error
                if (papersGetErr) {
                  return done(papersGetErr);
                }

                // Get Papers list
                var papers = papersGetRes.body;

                // Set assertions
                (papers[0].user._id).should.equal(userId);
                (papers[0].name).should.match('Paper name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Paper if not logged in', function (done) {
    agent.post('/api/papers')
      .send(paper)
      .expect(403)
      .end(function (paperSaveErr, paperSaveRes) {
        // Call the assertion callback
        done(paperSaveErr);
      });
  });

  it('should not be able to save an Paper if no name is provided', function (done) {
    // Invalidate name field
    paper.name = '';

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

        // Save a new Paper
        agent.post('/api/papers')
          .send(paper)
          .expect(400)
          .end(function (paperSaveErr, paperSaveRes) {
            // Set message assertion
            (paperSaveRes.body.message).should.match('Please fill Paper name');

            // Handle Paper save error
            done(paperSaveErr);
          });
      });
  });

  it('should be able to update an Paper if signed in', function (done) {
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

        // Save a new Paper
        agent.post('/api/papers')
          .send(paper)
          .expect(200)
          .end(function (paperSaveErr, paperSaveRes) {
            // Handle Paper save error
            if (paperSaveErr) {
              return done(paperSaveErr);
            }

            // Update Paper name
            paper.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Paper
            agent.put('/api/papers/' + paperSaveRes.body._id)
              .send(paper)
              .expect(200)
              .end(function (paperUpdateErr, paperUpdateRes) {
                // Handle Paper update error
                if (paperUpdateErr) {
                  return done(paperUpdateErr);
                }

                // Set assertions
                (paperUpdateRes.body._id).should.equal(paperSaveRes.body._id);
                (paperUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Papers if not signed in', function (done) {
    // Create new Paper model instance
    var paperObj = new Paper(paper);

    // Save the paper
    paperObj.save(function () {
      // Request Papers
      request(app).get('/api/papers')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Paper if not signed in', function (done) {
    // Create new Paper model instance
    var paperObj = new Paper(paper);

    // Save the Paper
    paperObj.save(function () {
      request(app).get('/api/papers/' + paperObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', paper.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Paper with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/papers/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Paper is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Paper which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Paper
    request(app).get('/api/papers/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Paper with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Paper if signed in', function (done) {
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

        // Save a new Paper
        agent.post('/api/papers')
          .send(paper)
          .expect(200)
          .end(function (paperSaveErr, paperSaveRes) {
            // Handle Paper save error
            if (paperSaveErr) {
              return done(paperSaveErr);
            }

            // Delete an existing Paper
            agent.delete('/api/papers/' + paperSaveRes.body._id)
              .send(paper)
              .expect(200)
              .end(function (paperDeleteErr, paperDeleteRes) {
                // Handle paper error error
                if (paperDeleteErr) {
                  return done(paperDeleteErr);
                }

                // Set assertions
                (paperDeleteRes.body._id).should.equal(paperSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Paper if not signed in', function (done) {
    // Set Paper user
    paper.user = user;

    // Create new Paper model instance
    var paperObj = new Paper(paper);

    // Save the Paper
    paperObj.save(function () {
      // Try deleting Paper
      request(app).delete('/api/papers/' + paperObj._id)
        .expect(403)
        .end(function (paperDeleteErr, paperDeleteRes) {
          // Set message assertion
          (paperDeleteRes.body.message).should.match('User is not authorized');

          // Handle Paper error error
          done(paperDeleteErr);
        });

    });
  });

  it('should be able to get a single Paper that has an orphaned user reference', function (done) {
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

          // Save a new Paper
          agent.post('/api/papers')
            .send(paper)
            .expect(200)
            .end(function (paperSaveErr, paperSaveRes) {
              // Handle Paper save error
              if (paperSaveErr) {
                return done(paperSaveErr);
              }

              // Set assertions on new Paper
              (paperSaveRes.body.name).should.equal(paper.name);
              should.exist(paperSaveRes.body.user);
              should.equal(paperSaveRes.body.user._id, orphanId);

              // force the Paper to have an orphaned user reference
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

                    // Get the Paper
                    agent.get('/api/papers/' + paperSaveRes.body._id)
                      .expect(200)
                      .end(function (paperInfoErr, paperInfoRes) {
                        // Handle Paper error
                        if (paperInfoErr) {
                          return done(paperInfoErr);
                        }

                        // Set assertions
                        (paperInfoRes.body._id).should.equal(paperSaveRes.body._id);
                        (paperInfoRes.body.name).should.equal(paper.name);
                        should.equal(paperInfoRes.body.user, undefined);

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
      Paper.remove().exec(done);
    });
  });
});
