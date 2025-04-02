
/**
 * Parse a cookie header string into an object.
 * 
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Object}
 */


module.exports = function (req) {
    return function (req, res, next) {
        req.cookies = {};
        const rawCookies = req.headers.cookie;
        if (!rawCookies) return next();

        const pairs = rawCookies.split('; ');
        for (let i = 0; i < pairs.length; i++) {
            const [key, value] = pairs[i].split('=');
            req.cookies[key] = decodeURIComponent(value);
        }
        next();
    }


}
