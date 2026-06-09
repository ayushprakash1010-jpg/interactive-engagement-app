'use strict';

const { randomUUID } = require('node:crypto');

/**
 * Artillery processor helpers for the Socket.IO load test.
 * Assigns each virtual user a unique anonymous participant id so the server
 * counts them as distinct participants (mirroring real client behavior).
 */
module.exports = {
  newAnonId(context, _events, done) {
    context.vars.anonId = randomUUID();
    return done();
  },
};
