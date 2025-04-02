const router = require('express').Router();
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const User = require('../models/User.model.js');
const crypto = require('crypto')
const signature = require('../utils/cookie-signature.js');
const SESSION_STORE = require('../sessionStore/index.js')
const { isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/route-guard.js')

// ****** SIGNUP ROUTE: *******

router.get('/signup', isLoggedOut, (req, res) => {

    console.log(req)
    res.render('auth/signup.hbs');
})

router.post('/signup', isLoggedOut, (req, res) => {
    console.log('form data:', req.body);
    const { name, email, password, isAdmin } = req.body;

    const isAdminUser = isAdmin === 'true' ? true : false;

    if (!name || !email || !password, !isAdmin) {
        res.status(400).render('auth/signup', { errorMessage: 'All fields must be filled.' });
        return;
    }

    // check if email is a valid format

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(email)) {
        res.status(400).render('auth/signup', { errorMessage: 'Provide a valid email address.' });
        return;
    }

    // password validation:

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

    if (!passwordRegex.test(password)) {
        res.status(400).render('auth/signup', { errorMessage: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
        return
    }

    // check if email already exist:

    User.findOne({ email })
        .then((user) => {
            if (user) {
                res.status(400).render('auth/signup', { errorMessage: 'Email already exists.Try other email.' });
                return;
            }
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            return User.create({ name, email, password: hash, isAdmin: isAdminUser });
        })
        .then((newUser) => {
            // console.log('new user?', newUser);
            if (!newUser) {
                return;
            }
            res.redirect('/login');
        })
        .catch((err) => console.log('Error creating account:', err));

});



// LOGIN ROUTE

router.get('/login', isLoggedOut, async (req, res) => {
    res.render('auth/login.hbs');
})

router.post('/login', isLoggedOut, async (req, res) => {
    console.log('form data:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).render('auth/login.hbs', { errorMessage: 'Enter both email and password.' });
        return;
    }
    try {
        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).render('auth/login.hbs', { errorMessage: 'Email not registered. Try another email.' });
            return;
        }
        if (bcrypt.compareSync(password, user.password)) {

            // Create session using SESSION_STORE
            const { name, isAdmin } = user;
            const payload = { id: user._id.toString(), name, isAdmin };
            const sessionId = await SESSION_STORE.create_Session(payload);
            const signed = 's:' + signature.sign(sessionId, process.env.SESSION_KEY);
            res.cookie('sessionId', signed, { httpOnly: true, path: '/', maxAge: 3600000 }); // Set cookie
            res.cookie('theme', 'dark', { path: '/' }); // Example for setting a theme cookie

            res.redirect('/userProfile');
        } else {
            res.status(400).render('auth/login.hbs', { errorMessage: 'Incorrect password.' });
        }
    } catch (err) {
        console.log('Error retrieving user:', err);
    }
});

router.get('/userProfile', isLoggedIn, (req, res) => {

    res.render('users/user-profile.hbs', { user: req.session })

})
router.get('/user/admin', isLoggedIn, isAdmin, (req, res) => {
    console.log(req)
    res.render('users/admin/profile.hbs', { user: req.session });
})

router.post('/logout', (req, res) => {
    const sessionCookie = req.cookies.sessionId;
    const sessionId = sessionCookie.split('.')[0].slice(2);
    SESSION_STORE.delete_session(sessionId);
    res.clearCookie('sessionId', { httpOnly: true });
    res.clearCookie('theme');
    res.redirect('/login');
})




module.exports = router;

