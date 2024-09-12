var LocalStrategy   = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
require('./../config/database'); // have global var connection
var authconfig = require('./../config/auth');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var log = require('./log');
var squel = require('squel');

module.exports = function(passport) {
    // used to serialize the user for the session
    passport.serializeUser(function(id, done) {
        done(null, id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM users WHERE user_id = ?",[id], function(err, rows){
            if (err)
                return done(err, null);
            user = {
                id: rows[0].user_id,
                name: rows[0].user_name,
                email: rows[0].user_email,
                country: rows[0].user_country,
            }
            done(null, user);
        });
    });

    // Local register
    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            log.print("IP: " + req.connection.remoteAddress + " is trying register with email " + email, "register");
            // let query = squel.select().from('users').where('user_email = ?', email).toString();
            query = squel.select().from('users').where("user_email = ?", email).toString();
            connection.query(query, function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signUp', { type: 'email', message: 'That email is taken. Try another email.', post: req.body}));
                } else {
                    // if there is no user with that email
                    // create the user
                    var now = new Date();
                    var newUserMysql = {
                        id: crypto.createHash('md5').update(email+now.getTime()).digest('hex'),
                        name: req.body.name.toUpperCase(),
                        email: email,
                        password: bcrypt.hashSync(password, null, null),  // use the generateHash function in our user model
                        country: req.body.country,
                        created_ip: req.connection.remoteAddress,
                        last_ip: req.connection.remoteAddress,
                    };

                    var insertQuery = squel.insert()
                                            .into('users')
                                            .set('user_id', newUserMysql.id)
                                            .set('user_name', newUserMysql.name)
                                            .set('user_email', newUserMysql.email)
                                            .set('user_password', newUserMysql.password)
                                            .set('user_country', newUserMysql.country)
                                            .set('user_created_ip', newUserMysql.created_ip)
                                            .set('user_last_ip', newUserMysql.last_ip)
                                            .toString();

                    connection.query(insertQuery, function(err, rows) {
                        log.print(req.connection.remoteAddress +" Create User ID: "+newUserMysql.id+", EMAIL: " + newUserMysql.email + ", NAME: "+newUserMysql.name, "register")
                        return done(null, newUserMysql.id);
                    });
                }
            });
        })
    );

    // local login
    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            log.print("IP: " + req.connection.remoteAddress + " is trying login with email " + email, "login");
            let query = squel.select().from('users').where('user_email = ?', email).toString();
            connection.query(query, function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginError', { type: 'email', message: 'Couldn\'t find your Account. Create new Account below', post: req.body})); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (rows[0].user_password == '' || !bcrypt.compareSync(password, rows[0].user_password))
                    return done(null, false, req.flash('loginError', { type: 'password', message: 'Wrong password, Please try again', post: req.body})); // create the loginMessage and save it to session as flashdata
                log.print("Local Log in, ID: " + rows[0]['user_id'] + ", IP: " + req.connection.remoteAddress, "login");
                // all is well, return successful user
                return done(null, rows[0]['user_id']);
            });
        })
    );

    // Auth google
    passport.use(
        'google',
        new GoogleStrategy({
            clientID: authconfig.google.clientID,
            clientSecret: authconfig.google.clientSecret,
            callbackURL: authconfig.google.callbackURL,
            scope: ['profile', 'email']
        },
        function(accessToken, refreshToken, profile, done) {
            let query = squel.select().from('users').where('user_email = ?', profile.email).toString();
            connection.query(query, function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    // if there is no user with that google id
                    // create the user
                    var now = new Date();
                    var newUserMysql = {
                        id: crypto.createHash('md5').update(profile.email+now.getTime()).digest('hex'),
                        name: profile.displayName.toUpperCase(),
                        password: bcrypt.hashSync(crypto.randomBytes(8).toString('hex')),
                        email: profile.email,  // use the generateHash function in our user model
                        country: ''
                    };

                    var insertQuery = "INSERT INTO users ( user_id, user_name, user_email, user_password ) values (?,?,?,?)";

                    connection.query(insertQuery,[newUserMysql.id, newUserMysql.name, newUserMysql.email, newUserMysql.password],function(err, rows) {
                        return done(null, newUserMysql.id);
                    });
                } else {
                    return done(null, rows[0]['user_id']);
                }
            });
        })
    );

    // Auth facebook
    passport.use(
        'facebook',
        new FacebookStrategy({
            clientID: authconfig.facebook.clientID,
            clientSecret: authconfig.facebook.clientSecret,
            callbackURL: authconfig.facebook.callbackURL,
            profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        function(accessToken, refreshToken, profile, done) {
            let query = squel.select().from('users').where('user_email = ?', profile.email).toString();
            connection.query(query, function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    // if there is no user with that google id
                    // create the user
                    var now = new Date();
                    var newUserMysql = {
                        id: crypto.createHash('md5').update(profile.emails[0].value+now.getTime()).digest('hex'),
                        name: profile.displayName.toUpperCase(),
                        password: bcrypt.hashSync(crypto.randomBytes(8).toString('hex')),
                        email: profile.emails[0].value,  // use the generateHash function in our user model
                        country: ''
                    };

                    var insertQuery = "INSERT INTO users ( user_id, user_name, user_email, user_password ) values (?,?,?,?)";

                    connection.query(insertQuery,[newUserMysql.id, newUserMysql.name, newUserMysql.email, newUserMysql.password],function(err, rows) {
                        return done(null, newUserMysql.id);
                    });
                } else {
                    return done(null, rows[0]['user_id']);
                }
            });
        }
    ));
};
