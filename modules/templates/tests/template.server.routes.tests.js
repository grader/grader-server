'use strict';

const should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Template = mongoose.model('Template'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
const app,
  agent,
  credentials,
  user,
  template;

/**
 * Template routes tests
 */
describe('Template CRUD tests', function () {

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

    // Save a user to the test db and create new Template
    user.save(function () {
      template = {
        name: 'Template name'
      };

      done();
    });
  });

  it('should be able to save a Template if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        const userId = user.id;

        // Save a new Template
        agent.post('/api/templates')
          .send(template)
          .expect(200)
          .end(function (templateSaveErr, templateSaveRes) {
            // Handle Template save error
            if (templateSaveErr) {
              return done(templateSaveErr);
            }

            // Get a list of Templates
            agent.get('/api/templates')
              .end(function (templatesGetErr, templatesGetRes) {
                // Handle Templates save error
                if (templatesGetErr) {
                  return done(templatesGetErr);
                }

                // Get Templates list
                const templates = templatesGetRes.body;

                // Set assertions
                (templates[0].user._id).should.equal(userId);
                (templates[0].name).should.match('Template name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Template if not logged in', function (done) {
    agent.post('/api/templates')
      .send(template)
      .expect(403)
      .end(function (templateSaveErr, templateSaveRes) {
        // Call the assertion callback
        done(templateSaveErr);
      });
  });

  it('should not be able to save an Template if no name is provided', function (done) {
    // Invalidate name field
    template.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        const userId = user.id;

        // Save a new Template
        agent.post('/api/templates')
          .send(template)
          .expect(400)
          .end(function (templateSaveErr, templateSaveRes) {
            // Set message assertion
            (templateSaveRes.body.message).should.match('Please fill Template name');

            // Handle Template save error
            done(templateSaveErr);
          });
      });
  });

  it('should be able to update an Template if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        const userId = user.id;

        // Save a new Template
        agent.post('/api/templates')
          .send(template)
          .expect(200)
          .end(function (templateSaveErr, templateSaveRes) {
            // Handle Template save error
            if (templateSaveErr) {
              return done(templateSaveErr);
            }

            // Update Template name
            template.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Template
            agent.put('/api/templates/' + templateSaveRes.body._id)
              .send(template)
              .expect(200)
              .end(function (templateUpdateErr, templateUpdateRes) {
                // Handle Template update error
                if (templateUpdateErr) {
                  return done(templateUpdateErr);
                }

                // Set assertions
                (templateUpdateRes.body._id).should.equal(templateSaveRes.body._id);
                (templateUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Templates if not signed in', function (done) {
    // Create new Template model instance
    const templateObj = new Template(template);

    // Save the template
    templateObj.save(function () {
      // Request Templates
      request(app).get('/api/templates')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Template if not signed in', function (done) {
    // Create new Template model instance
    const templateObj = new Template(template);

    // Save the Template
    templateObj.save(function () {
      request(app).get('/api/templates/' + templateObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', template.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Template with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/templates/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Template is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Template which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Template
    request(app).get('/api/templates/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Template with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Template if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        const userId = user.id;

        // Save a new Template
        agent.post('/api/templates')
          .send(template)
          .expect(200)
          .end(function (templateSaveErr, templateSaveRes) {
            // Handle Template save error
            if (templateSaveErr) {
              return done(templateSaveErr);
            }

            // Delete an existing Template
            agent.delete('/api/templates/' + templateSaveRes.body._id)
              .send(template)
              .expect(200)
              .end(function (templateDeleteErr, templateDeleteRes) {
                // Handle template error error
                if (templateDeleteErr) {
                  return done(templateDeleteErr);
                }

                // Set assertions
                (templateDeleteRes.body._id).should.equal(templateSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Template if not signed in', function (done) {
    // Set Template user
    template.user = user;

    // Create new Template model instance
    const templateObj = new Template(template);

    // Save the Template
    templateObj.save(function () {
      // Try deleting Template
      request(app).delete('/api/templates/' + templateObj._id)
        .expect(403)
        .end(function (templateDeleteErr, templateDeleteRes) {
          // Set message assertion
          (templateDeleteRes.body.message).should.match('User is not authorized');

          // Handle Template error error
          done(templateDeleteErr);
        });

    });
  });

  it('should be able to get a single Template that has an orphaned user reference', function (done) {
    // Create orphan user creds
    const _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    const _orphan = new User({
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
          const orphanId = orphan._id;

          // Save a new Template
          agent.post('/api/templates')
            .send(template)
            .expect(200)
            .end(function (templateSaveErr, templateSaveRes) {
              // Handle Template save error
              if (templateSaveErr) {
                return done(templateSaveErr);
              }

              // Set assertions on new Template
              (templateSaveRes.body.name).should.equal(template.name);
              should.exist(templateSaveRes.body.user);
              should.equal(templateSaveRes.body.user._id, orphanId);

              // force the Template to have an orphaned user reference
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

                    // Get the Template
                    agent.get('/api/templates/' + templateSaveRes.body._id)
                      .expect(200)
                      .end(function (templateInfoErr, templateInfoRes) {
                        // Handle Template error
                        if (templateInfoErr) {
                          return done(templateInfoErr);
                        }

                        // Set assertions
                        (templateInfoRes.body._id).should.equal(templateSaveRes.body._id);
                        (templateInfoRes.body.name).should.equal(template.name);
                        should.equal(templateInfoRes.body.user, undefined);

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
      Template.remove().exec(done);
    });
  });
});
