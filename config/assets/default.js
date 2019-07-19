'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  server: {
    gulpConfig: ['gulpfile.js'],
    allJS: ['server.js', 'config/**/*.js', 'modules/**/*.js'],
    models: 'modules/*/models/**/*.js',
    routes: ['modules/!(core)/routes/**/*.js', 'modules/core/routes/**/*.js'],
    sockets: 'modules/*/sockets/**/*.js',
    config: ['modules/*/config/*.js'],
    policies: 'modules/*/policies/*.js'
  }
};
