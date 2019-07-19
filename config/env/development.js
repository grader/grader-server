'use strict';

const defaultEnvConfig = require('./default');

module.exports = {
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/node-app-dev',
    options: {},
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    fileLogger: {
      directoryPath: process.cwd(),
      fileName: 'app.log',
      maxsize: 10485760,
      maxFiles: 2,
      json: false
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },

  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/github/callback'
  },

  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  livereload: true,
  seedDB: {
    seed: process.env.MONGO_SEED === 'true',
    options: {
      logResults: process.env.MONGO_SEED_LOG_RESULTS !== 'false'
    },
    // Order of collections in configuration will determine order of seeding.
    // i.e. given these settings, the User seeds will be complete before
    // Article seed is performed.
    collections: [{
      model: 'User',
      docs: [{
        data: {
          username: 'local-admin',
          email: 'admin@localhost.com',
          firstName: 'Admin',
          lastName: 'Local',
          roles: ['admin', 'user']
        }
      }, {
        // Set to true to overwrite this document
        // when it already exists in the collection.
        // If set to false, or missing, the seed operation
        // will skip this document to avoid overwriting it.
        overwrite: true,
        data: {
          username: 'local-user',
          email: 'user@localhost.com',
          firstName: 'User',
          lastName: 'Local',
          roles: ['user']
        }
      }]
    }, {
      model: 'Article',
      options: {
        // Override log results setting at the
        // collection level.
        logResults: true
      },
      skip: {
        // Skip collection when this query returns results.
        // e.g. {}: Only seeds collection when it is empty.
        when: {} // Mongoose qualified query
      },
      docs: [{
        data: {
          title: 'First Article',
          content: 'This is a seeded Article for the development environment'
        }
      }]
    }, {
      model: 'QuestTemplate',
      options: { logResults: true },
      skip: {
        when: {} // Mongoose qualified query
      },
      docs: [{
        data: {
          "isDefault": true,
          "subject": "English",
          "type": "ListenChoose",
          "title": "听力选择",
          "description": "听力选择",
          "questionNumber": 0
        }
      },{
        data: {
          "isDefault": true,
          "subject": "English",
          "type": "BlankReadingChoose",
          "title": "短文选择填空",
          "description": "听力短文选择填空",
          "questionNumber": 10
        }
      }
      ]
    }, {
      model: 'Subject',
      options: { logResults: true },
      skip: {
        when: {} // Mongoose qualified query
      },
      docs: [
        {data: { name: "语文", isDefault: true, subjectCode: "chinese"}},
        {data: { name: "数学", isDefault: true, subjectCode: "mathematics"}},
        {data: { name: "英语", isDefault: true, subjectCode: "english"}},
        {data: { name: "物理", isDefault: true, subjectCode: "physical"}},
        {data: { name: "化学", isDefault: true, subjectCode: "chemistry"}},
        {data: { name: "生物", isDefault: true, subjectCode: "biological"}},
        {data: { name: "地理", isDefault: true, subjectCode: "geography"}},
        {data: { name: "政治", isDefault: true, subjectCode: "political"}},
        {data: { name: "历史", isDefault: true, subjectCode: "history"}},
      ]
    }]
  }
};
