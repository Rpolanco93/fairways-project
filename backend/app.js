const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
//check to see which environment we are using
const { environment } = require('./config');
const isProduction = environment === 'production';

const app = express();
//connect the morgan midddleware for logging info about req and res
app.use(morgan('dev'))
//Add the cookie-parser middleware for parsing cookies
app.use(cookieParser());
// pasing json bodies from request with contect type of app json
app.use(express.json());

//import routes
const routes = require('./routes');

//Security Middleware
if (!isProduction) {
    //enable cors only in dev
    app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
    helmet.crossOriginResourcePolicy({
        policy: 'cross-origin'
    })
);

// Set the _csrf token and create req.csrfToken method
app.use(
    csurf({
        cookie: {
            secure: isProduction,
            sameSite: isProduction && "Lax",
            httpOnly: true
        }
    })
);

app.use(routes);

module.exports = app;
