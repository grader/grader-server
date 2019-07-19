'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Subject = mongoose.model('Subject'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  subject;

/**
 * Subject routes tests
 */
describe('Subject CRUD tests', function () {

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

    // Save a user to the test db and create new Subject
    user.save(function () {
      subject = {
        name: 'Subject name'
      };

      done();
    });
  });

  it('should be able to save a Subject if logged in', function (done) {
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

        // Save a new Subject
        agent.post('/api/subjects')
          .send(subject)
          .expect(200)
          .end(function (subjectSaveErr, subjectSaveRes) {
            // Handle Subject save error
            if (subjectSaveErr) {
              return done(subjectSaveErr);
            }

            // Get a list of Subjects
            agent.get('/api/subjects')
              .end(function (subjectsGetErr, subjectsGetRes) {
                // Handle Subjects save error
                if (subjectsGetErr) {
                  return done(subjectsGetErr);
                }

                // Get Subjects list
                var subjects = subjectsGetRes.body;

                // Set assertions
                (subjects[0].user._id).should.equal(userId);
                (subjects[0].name).should.match('Subject name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Subject if not logged in', function (done) {
    agent.post('/api/subjects')
      .send(subject)
      .expect(403)
      .end(function (subjectSaveErr, subjectSaveRes) {
        // Call the assertion callback
        done(subjectSaveErr);
      });
  });

  it('should not be able to save an Subject if no name is provided', function (done) {
    // Invalidate name field
    subject.name = '';

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

        // Save a new Subject
        agent.post('/api/subjects')
          .send(subject)
          .expect(400)
          .end(function (subjectSaveErr, subjectSaveRes) {
            // Set message assertion
            (subjectSaveRes.body.message).should.match('Please fill Subject name');

            // Handle Subject save error
            done(subjectSaveErr);
          });
      });
  });

  it('should be able to update an Subject if signed in', function (done) {
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

        // Save a new Subject
        agent.post('/api/subjects')
          .send(subject)
          .expect(200)
          .end(function (subjectSaveErr, subjectSaveRes) {
            // Handle Subject save error
            if (subjectSaveErr) {
              return done(subjectSaveErr);
            }

            // Update Subject name
            subject.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Subject
            agent.put('/api/subjects/' + subjectSaveRes.body._id)
              .send(subject)
              .expect(200)
              .end(function (subjectUpdateErr, subjectUpdateRes) {
                // Handle Subject update error
                if (subjectUpdateErr) {
                  return done(subjectUpdateErr);
                }

                // Set assertions
                (subjectUpdateRes.body._id).should.equal(subjectSaveRes.body._id);
                (subjectUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Subjects if not signed in', function (done) {
    // Create new Subject model instance
    var subjectObj = new Subject(subject);

    // Save the subject
    subjectObj.save(function () {
      // Request Subjects
      request(app).get('/api/subjects')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Subject if not signed in', function (done) {
    // Create new Subject model instance
    var subjectObj = new Subject(subject);

    // Save the Subject
    subjectObj.save(function () {
      request(app).get('/api/subjects/' + subjectObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', subject.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Subject with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/subjects/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Subject is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Subject which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Subject
    request(app).get('/api/subjects/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Subject with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Subject if signed in', function (done) {
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

        // Save a new Subject
        agent.post('/api/subjects')
          .send(subject)
          .expect(200)
          .end(function (subjectSaveErr, subjectSaveRes) {
            // Handle Subject save error
            if (subjectSaveErr) {
              return done(subjectSaveErr);
            }

            // Delete an existing Subject
            agent.delete('/api/subjects/' + subjectSaveRes.body._id)
              .send(subject)
              .expect(200)
              .end(function (subjectDeleteErr, subjectDeleteRes) {
                // Handle subject error error
                if (subjectDeleteErr) {
                  return done(subjectDeleteErr);
                }

                // Set assertions
                (subjectDeleteRes.body._id).should.equal(subjectSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Subject if not signed in', function (done) {
    // Set Subject user
    subject.user = user;

    // Create new Subject model instance
    var subjectObj = new Subject(subject);

    // Save the Subject
    subjectObj.save(function () {
      // Try deleting Subject
      request(app).delete('/api/subjects/' + subjectObj._id)
        .expect(403)
        .end(function (subjectDeleteErr, subjectDeleteRes) {
          // Set message assertion
          (subjectDeleteRes.body.message).should.match('User is not authorized');

          // Handle Subject error error
          done(subjectDeleteErr);
        });

    });
  });

  it('should be able to get a single Subject that has an orphaned user reference', function (done) {
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

          // Save a new Subject
          agent.post('/api/subjects')
            .send(subject)
            .expect(200)
            .end(function (subjectSaveErr, subjectSaveRes) {
              // Handle Subject save error
              if (subjectSaveErr) {
                return done(subjectSaveErr);
              }

              // Set assertions on new Subject
              (subjectSaveRes.body.name).should.equal(subject.name);
              should.exist(subjectSaveRes.body.user);
              should.equal(subjectSaveRes.body.user._id, orphanId);

              // force the Subject to have an orphaned user reference
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

                    // Get the Subject
                    agent.get('/api/subjects/' + subjectSaveRes.body._id)
                      .expect(200)
                      .end(function (subjectInfoErr, subjectInfoRes) {
                        // Handle Subject error
                        if (subjectInfoErr) {
                          return done(subjectInfoErr);
                        }

                        // Set assertions
                        (subjectInfoRes.body._id).should.equal(subjectSaveRes.body._id);
                        (subjectInfoRes.body.name).should.equal(subject.name);
                        should.equal(subjectInfoRes.body.user, undefined);

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
      Subject.remove().exec(done);
    });
  });
});
