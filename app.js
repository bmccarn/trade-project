// Require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const tradeRoutes = require('./routes/tradeRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');

// Create Express app
const app = express();

// Configure app
const port = 3000;
const host = 'localhost';
app.set('view engine', 'ejs');

// Connect to MongoDB and start server
mongoose.connect('mongodb://localhost:27017/tradingApp', { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        app.listen(port, host, () => {
            console.log(`Server is running at http://${host}:${port}`);
        });
    })
    .catch((err) => console.log(err));

// Mount middleware
app.use(session({
    secret: "ajfeirf90aeu9eroejfoefj",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/tradingApp'}),
    cookie: {maxAge: 60*60*1000}
}));
app.use(flash());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

// Set user and flash messages in response locals
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

// Set up routes
app.get('/', (req, res) => res.render('main/index'));
app.use('/trades', tradeRoutes);
app.use('/main', mainRoutes);
app.use('/users', userRoutes);

// Handle 404 errors
app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

// Handle errors
app.use((err, req, res, next) => {
    console.log(err.stack);
    err.status = err.status || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.status);
    res.render('error', { error: err });
});
