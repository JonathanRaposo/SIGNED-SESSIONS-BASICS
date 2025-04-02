require('dotenv').config();
const express = require('express');
const app = express();
const parseCookies = require('./utils/parseCookies.js')


// connect to database
require('./db/index.js')()

// config middleware
require('./config/index.js')(app);

app.locals.title = 'Powered by J.R';

app.use(parseCookies())
// app.use(parseCookies());



//  routes here
const indexRouter = require('./routes/index.js');
app.use('/', indexRouter);

const authRouter = require('./routes/auth.routes.js');
app.use('/', authRouter);




// error handling middleware
app.use((req, res, next) => {
    res.render('not-found.hbs');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))


