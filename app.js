const express       = require('express');
const hbs           = require('express-handlebars');
const path          = require('path');
const mongoose      = require('mongoose');
const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const session       = require('express-session');
const cors          = require('cors');
//const MongoStore    = require('connect-mongo')(session);
const passport      = require('passport');
const flash         = require('connect-flash');
const db_congif     = require('./config/database');

const app = express();

// ES6 Promise
// mongoose.Promise = global.Promise;
// Connect to database
mongoose.connect(db_congif.database, {useNewUrlParser: true});
mongoose.connection.on('connected', ()=>{
    console.log('*****Connected to database.....');
}).on('error', ()=>{
    console.log('###Failed to connect to database...');
});


// define cors
app.use(cors());

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'layout',
    extname: 'hbs'
}));
app.set('view engine', 'hbs');

// Set Static folder
app.use(express.static(path.join(__dirname, 'public')));

// body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cookie-parser
app.use(cookieParser());

// express-session
app.use(session({
    secret: db_congif.secret,
    saveUninitialized: true,
    resave: true,
    //store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// connect-flash
app.use(flash());
// Global Vars for flash messages
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg   = req.flash('error_msg');
    res.locals.error       = req.flash('error');
    res.locals.user        = req.user || null; // set user if there is a session for him
    next();
});



// Routes
app.get('/', (req, res)=>{
    res.render('index');
});

const auth = require('./routes/auth');
app.use('/auth', auth);

// Start the server
app.listen(3000, ()=>{
    console.log('*****Server is running on port 3000.....');
});