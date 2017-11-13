const localStrategy     = require('passport-local').Strategy;
const facebookStrategy  = require('passport-facebook').Strategy;
const googleStrategy    = require('passport-google-oauth').OAuth2Strategy;
const User              = require('../models/user');
const oauth_config      = require('./oauth');

module.exports = function(passport){

    passport.serializeUser((user, done)=>{
        done(null, user.id);
    });   

    passport.deserializeUser((id, done)=>{
       User.getUserById(id, (err, user)=>{
            if(err) throw err;
            done(null, user);
        });
    });

    // Local strategy for signup
    /*passport.use('local-signup', new localStrategy({
        usernameField: 'username', // 'username' come from form input with name="username"
        emailField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, username, email, password, done)=>{

        process.nextTick(()=>{

            User.getUserByUsername(username, (err, user)=>{
                if(err) throw err;
                if(user){
                    return done(null, false, req.flash('error_msg', 'That username is already taken'));
                }else{

                    if(!req.user){
                        let newUser = new User();
                        newUser.local.username = username;
                        newUser.local.email = email;
                        newUser.local.password = password;
                        User.insertUser(newUser, (err, inserted_user)=>{
                            if(err) throw err;
                            return done(null, false, req.flash('success_msg', 'Registered Sucssfully'));
                        });
                    }else{
                        let newUser = req.user;
                        newUser.local.username = username;
                        newUser.local.email = email;
                        newUser.local.password = password;
                        User.insertUser(newUser, (err)=>{
                            if(err) throw err;
                        });
                    }

                }
            });

        });

    }));*/


    // Local strategy for login
    passport.use('local-login', new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, username, password, done)=>{

        process.nextTick(()=>{

            User.getUserByUsername(username, (err, user)=>{
                if(err) throw err;
                if(!user){
                    return done(null, false, req.flash('error_msg', 'No user found'));
                }else{

                    User.comparePassword(password, user.local.password, (err, isMatch)=>{
                       if(isMatch){
                            return done(null, user);
                       }else{
                            return done(null, false, req.flash('error_msg', 'Password is wrong'));    
                       } 
                    });

                }
            });

        });

    }));


    // Facebook strategy
    passport.use('facebook', new facebookStrategy({
        clientID: oauth_config.facebookAuth.clientID,
        clientSecret: oauth_config.facebookAuth.clientSecret,
        callbackURL: oauth_config.facebookAuth.callbackURL,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done)=>{

        process.nextTick(()=>{

            // if the user not logged in, so he need to authenticate
            if(!req.user){
                User.getUserByFacebookId(profile.id, (err, user)=>{
                    if(err) throw err;
                    
                    if(user){
                        if(!user.facebook.token){
                            user.facebook.token = accessToken;
                            user.facebook.name = profile.displayName;
                            user.save((err)=>{
                                if(err) throw err;
                                return done(null, user);
                            });
                        }
                        
                    }else{
                        console.log(profile);
    
                        let newUser = new User();
                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = accessToken;
                        //newUser.facebook.email = profile.id;
                        newUser.facebook.name = profile.displayName;
    
                        newUser.save((err, user)=>{
                            if(err) throw err;
                            return done(null, user);
                        });
    
                    }
    
                });
            }

            // if the user aleardy logged in, so he need to be authorize or merged
            else{
                let user = req.user;
                user.facebook.id = profile.id;
                user.facebook.token = accessToken;
                //user.facebook.email = profile.id;
                user.facebook.name = profile.displayName;
                user.save((err)=>{
                    if(err) throw err;
                    return done(null, user);
                });
            }

        });

    }));


    // Google strategy
    passport.use('google', new googleStrategy({
        clientID: oauth_config.googleAuth.clientID,
        clientSecret: oauth_config.googleAuth.clientSecret,
        callbackURL: oauth_config.googleAuth.callbackURL,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done)=>{

        process.nextTick(()=>{

            // if the user not logged in, so he need to authenticate
            if(!req.user){
                User.getUserByGoogleId(profile.id, (err, user)=>{
                    if(err) throw err;
                    
                    if(user){
                        if(!user.google.token){
                            user.google.token = accessToken;
                            user.google.name = profile.displayName;
                            user.save((err)=>{
                                if(err) throw err;
                                return done(null, user);
                            });
                        }
                    }else{
    
                        let newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.token = accessToken;
                        newUser.google.email = profile.emails[0].value;
                        newUser.google.name = profile.displayName;
    
                        newUser.save((err, user)=>{
                            if(err) throw err;
                            return done(null, user);
                        });
    
                    }
    
                });
            }

            // if the user aleardy logged in, so he need to be authorize or merged
            else{
                let user = req.user;
                user.google.id = profile.id;
                user.google.token = accessToken;
                user.google.email = profile.emails[0].value;
                user.google.name = profile.displayName;
                user.save((err)=>{
                    if(err) throw err;
                    return done(null, user);
                });                
            }
            

        });

    }));

}