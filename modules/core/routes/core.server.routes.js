'use strict';

module.exports = function (app) {

  // Define error pages
  app.route('/server-error').get(function (req, res, next) {
    res.json({ status: 'ERROR' });
  });

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(function (req, res, next) {
    res.json({ status: '404' });
  });

  // Define application route
  app.route('/').get(function (req, res, next) {
    res.json({ status: 'UP' });
  });
};
