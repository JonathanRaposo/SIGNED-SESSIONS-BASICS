
/**
 * function dependencies
 */

const crypto = require('crypto')
/**
 * Generates a random session id of 24 random bytes.
 * 
 * @returns {String}
 */

module.exports = function () {
    return crypto.randomBytes(24).toString('base64')
        .replace(/\=+$/, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}


