const SESSION_STORE = require('../sessionStore/index.js');
SESSION_STORE.init();

const signature = require('../utils/cookie-signature.js');

async function isLoggedIn(req, res, next) {
    try {

        if (!req.cookies.sessionId) {
            return res.redirect('/login');
        }
        const sessionCookie = req.cookies.sessionId;

        if (!/^s:/.test(sessionCookie)) {
            console.log('invalid session cookie format.')
            return res.redirect('/login');
        }

        const signedValue = sessionCookie.slice(2);;
        console.log('signed Value:', signedValue)

        if (!signedValue.includes('.')) {
            console.log('Malformed signed session cookie.');
            return res.redirect('/login');
        }
        const sessionId = signature.unsign(signedValue, process.env.SESSION_KEY);
        console.log('session id:', sessionId)

        if (!sessionId || !SESSION_STORE.isPresent(sessionId)) {
            return res.redirect('/login')
        }

        const user = await SESSION_STORE.get_sessionByID(sessionId);

        if (!user) {
            console.log('Session exists, but user not found. Possible expired session.');
            return res.status(401).redirect('/');
        }

        console.log('User from session:', user);
        req.session = user;
        next();
    } catch (err) {
        console.error('Error in isLoggedIn middleware:', err);
        res.status(500).render('error.hbs')
    }


}

function isLoggedOut(req, res, next) {

    if (req.cookies.sessionId) {
        return res.redirect('/userProfile');
    }
    next();
}

function isAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next()

    }
    res.render('users/admin/403-page.hbs');
}


module.exports = { isLoggedIn, isLoggedOut, isAdmin }