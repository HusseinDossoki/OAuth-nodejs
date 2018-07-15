const router = require('express').Router();
const passport = require('passport');
const User              = require('../models/user');

// GET Auth page
router.get('/', (req, res)=>{
    res.render('auth');
});

// GET Profile page
router.get('/profile', isLoggedIn, (req, res)=>{
    res.render('profile');
});


// GET logout page
router.get('/logout', (req, res)=>{
    req.logout();
    res.redirect('/');
});


// POST signup 
router.post('/signup', (req, res)=>{
    if(!req.user){
        let newUser = new User();
        newUser.local.username = req.body.username;
        newUser.local.email = req.body.email;
        newUser.local.password = req.body.password;
        User.insertUser(newUser, (err, inserted_user)=>{
            if(err) throw err;
            req.flash('success_msg', 'Registered Sucssfully');
            res.redirect('/auth');
        });
    }else{
        let newUser = req.user;
        newUser.local.username = req.body.username;
        newUser.local.email = req.body.email;
        newUser.local.password = req.body.password;
        User.insertUser(newUser, (err)=>{
            if(err) throw err;
            res.redirect('/auth/profile');
        });
    }
});

// POST login
router.post('/login', passport.authenticate('local-login', {
    failureRedirect: '/auth',
    successRedirect: '/auth/profile',
    failureFlash: true,
}));


// OAuth with Facebook
router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));
router.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/',
    successRedirect: '/auth/profile'
}));


// OAuth with Google
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/',
    successRedirect: '/auth/profile'
}));

// Connect
router.get('/connect/facebook', passport.authorize('facebook', {scope: ['email']}));
router.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));

router.get('/connect/local', (req, res)=>{
    res.render('connect-local');
});

router.post('/connect/local', (req, res)=>{
    let newUser = req.user;
    newUser.local.username  = req.body.username;
    newUser.local.email     = req.body.email;
    newUser.local.password  = req.body.password;
    User.insertUser(newUser, (err)=>{
        if(err) throw err;
        res.redirect('/auth/profile');
    });
});

// unlink
router.get('/unlink/facebook', (req, res)=>{
    let user = req.user;
    user.facebook.token = null;
    user.save((err)=>{
        if(err) throw err;
        res.redirect('/auth/profile');
    });
});

router.get('/unlink/google', (req, res)=>{
    let user = req.user;
    user.google.token = null;
    user.save((err)=>{
        if(err) throw err;
        res.redirect('/auth/profile');
    });
});

router.get('/unlink/local', (req, res)=>{
    let user = req.user;
    user.local.username = null;
    user.local.email = null;
    user.local.password = null;
    user.save((err)=>{
        if(err) throw err;
        res.redirect('/auth/profile');
    });
});

// make sure the user is logged in first 
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    
    res.redirect('/auth');
}

module.exports = router;