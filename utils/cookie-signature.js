/**
 * Module dependencies
 */

const crypto = require('crypto');





/**
 * Signs the cookie with Hmac
 * 
 * @param {String} val
 * @param {String} secret
 * @returns {String}
 */

exports.sign = function (val, secret) {
    if ('string' !== typeof val) throw new TypeError("Value string must be provided");
    if ('string' !== typeof secret) throw new TypeError("Secret string must be provided");

    const hash = crypto.createHmac('sha256', secret)
        .update(val)
        .digest('base64')
        .replace(/\=+$/, '');

    return val + '.' + hash
}

/**
 * Unsign the cookie an returns `original value` or false
 *
 * @param {String} signedValue
 * @param {String} secret
 * @returns {String} 
 */

exports.unsign = function (signedValue, secret) {
    if ('string' !== typeof signedValue) throw new TypeError("Value string must be provided");
    if ('string' !== typeof secret) throw new TypeError("Secret string must be provided");

    const str = signedValue.slice(0, signedValue.lastIndexOf('.'));
    const mac = exports.sign(str, secret)
    return sha1(mac) === sha1(signedValue) ? str : false;
}

function sha1(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
}
