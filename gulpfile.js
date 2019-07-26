'use strict';

/**
 * Module dependencies.
 */
const _ = require('lodash'),
  fs = require('fs'),
  defaultAssets = require('./config/assets/default'),
  testAssets = require('./config/assets/test'),
  glob = require('glob'),
  gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  plugins = gulpLoadPlugins(),
  path = require('path'),
  semver = require('semver');

// Local settings
const changedTestFiles = [];

// Set NODE_ENV to 'test'
gulp.task('env:test', function (done) {
  process.env.NODE_ENV = 'test';
  return done();
});

gulp.task('env:dev', function (done) {
  process.env.NODE_ENV = 'development';
  return done();
});

gulp.task('env:prod', function (done) {
  process.env.NODE_ENV = 'production';
  return done();
});

// Nodemon task
gulp.task('nodemon', function (done) {

  // Node.js v7 and newer use different debug argument
  const debugArgument = semver.satisfies(process.versions.node, '>=7.0.0') ? '--inspect' : '--debug';

  return plugins.nodemon({
    script: 'server.js',
    nodeArgs: [debugArgument],
    ext: 'js,html',
    verbose: true,
    watch: _.union(defaultAssets.server.allJS, defaultAssets.server.config)
  })
    .on('start', done);
});

// Nodemon task without verbosity or debugging
gulp.task('nodemon-nodebug', function (done) {
  return plugins.nodemon({
    script: 'server.js',
    ext: 'js,html',
    watch: _.union(defaultAssets.server.allJS, defaultAssets.server.config)
  })
    .on('start', done);
});

// Watch Files For Changes
gulp.task('watch', function () {
  // Start livereload
  plugins.refresh.listen();

  // Add watch rules
  gulp.watch(defaultAssets.server.allJS, gulp.series('eslint')).on('change', plugins.refresh.changed);

  if (process.env.NODE_ENV === 'production') {
    gulp.watch(defaultAssets.server.gulpConfig, gulp.series('eslint'));
  } else {
    gulp.watch(defaultAssets.server.gulpConfig, gulp.series('eslint'));
  }
});

// Watch server test files
gulp.task('watch:server:run-tests', function () {
  // Start livereload
  plugins.refresh.listen();

  // Add Server Test file rules
  gulp.watch([testAssets.tests.server, defaultAssets.server.allJS], gulp.series('test:server')).on('change', function (file) {
    changedTestFiles = [];

    // iterate through server test glob patterns
    _.forEach(testAssets.tests.server, function (pattern) {
      // determine if the changed (watched) file is a server test
      _.forEach(glob.sync(pattern), function (f) {
        const filePath = path.resolve(f);

        if (filePath === path.resolve(file.path)) {
          changedTestFiles.push(f);
          plugins.refresh.changed(f);
        }
      });
    });
  });
});

// ESLint JS linting task
gulp.task('eslint', function () {
  const assets = _.union(
    defaultAssets.server.gulpConfig,
    defaultAssets.server.allJS,
    testAssets.tests.server
  );

  return gulp.src(assets)
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format());
});

// Make sure upload directory exists
gulp.task('makeUploadsDir', function (done) {
  return fs.mkdir('modules/users/profile/uploads', function (err) {
    if (err && err.code !== 'EEXIST') {
      console.error(err);
      return done(err);
    }

    return done();
  });
});

// Mocha tests task
gulp.task('mocha', function (done) {
  const mongooseService = require('./config/lib/mongoose');
  const testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.server;
  let error;

  // Connect mongoose
  mongooseService.connect(function (db) {
    // Load mongoose models
    mongooseService.loadModels();

    gulp.src(testSuites)
      .pipe(plugins.mocha({
        reporter: 'spec',
        timeout: 10000
      }))
      .on('error', function (err) {
        // If an error occurs, save it
        error = err;
      })
      .on('end', function () {
        mongooseService.disconnect(function (err) {
          if (err) {
            console.log('Error disconnecting from database');
            console.log(err);
          }

          return done(error);
        });
      });
  });
});

// Prepare istanbul coverage test
gulp.task('pre-test', function () {

  // Display coverage for all server JavaScript files
  return gulp.src(defaultAssets.server.allJS)
    // Covering files
    .pipe(plugins.istanbul())
    // Force `require` to return covered files
    .pipe(plugins.istanbul.hookRequire());
});

// Run istanbul test and write report
gulp.task('mocha:coverage', gulp.series('pre-test', 'mocha', function () {
  const testSuites = changedTestFiles.length ? changedTestFiles : testAssets.tests.server;

  return gulp.src(testSuites)
    .pipe(plugins.istanbul.writeReports({
      reportOpts: { dir: './coverage/server' }
    }));
}));

// Drops the MongoDB database, used in e2e testing
gulp.task('dropdb', function (done) {
  // Use mongoose configuration
  const mongooseService = require('./config/lib/mongoose');

  mongooseService.connect(function (db) {
    db.dropDatabase(function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log('Successfully dropped db: ', db.databaseName);
      }

      mongooseService.disconnect(done);
    });
  });
});

// Seed Mongo database based on configuration
gulp.task('mongo-seed', function (done) {
  const db = require('./config/lib/mongoose');
  const seed = require('./config/lib/mongo-seed');

  // Open mongoose database connection
  db.connect(function () {
    db.loadModels();

    seed
      .start({
        options: {
          logResults: true
        }
      })
      .then(function () {
        // Disconnect and finish task
        db.disconnect(done);
      })
      .catch(function (err) {
        db.disconnect(function (disconnectError) {
          if (disconnectError) {
            console.log('Error disconnecting from the database, but was preceded by a Mongo Seed error.');
          }

          // Finish task with error
          done(err);
        });
      });
  });

});

gulp.task('test:server',
  gulp.series('env:test', gulp.parallel('makeUploadsDir', 'dropdb'), 'eslint', 'mocha'));

// Run the project tests
gulp.task('test',
  gulp.series('env:test', 'test:server'));

// Watch all server files for changes & run server tests (test:server) task on changes
gulp.task('test:server:watch',
  gulp.series('test:server', 'watch:server:run-tests'));

gulp.task('test:e2e',
  gulp.series('env:test', 'eslint', 'dropdb', 'nodemon'));

gulp.task('test:coverage',
  gulp.series('env:test', gulp.parallel('makeUploadsDir', 'dropdb'), 'eslint', 'mocha:coverage'));

// Run the project in development mode with node debugger enabled
gulp.task('default',
  gulp.series(gulp.parallel('makeUploadsDir'), 'eslint', gulp.parallel('nodemon', 'watch')));

// Run the project in production mode
gulp.task('prod',
  gulp.series(gulp.parallel('makeUploadsDir'), 'env:prod', 'eslint', gulp.parallel('nodemon-nodebug', 'watch')));

// Run Mongo Seed with default environment config
gulp.task('seed',
  gulp.series('env:dev', 'mongo-seed'));

// Run Mongo Seed with production environment config
gulp.task('seed:prod',
  gulp.series('env:prod', 'mongo-seed'));

gulp.task('seed:test',
  gulp.series('env:test', 'mongo-seed'));
