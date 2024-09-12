require('./../config/database'); // have global var connection
var authconfig = require('./../config/auth');
var emailconfig = require('./../config/email');
var gameconfig = require('./../config/game');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var randomstring = require("randomstring");
var async = require('async');
var handlebars = require('handlebars');
var readHTMLFile = require('./../helper/readhtmlfile');
var log = require('./../helper/log');
var squel = require('squel');
let date = require('date-and-time');

module.exports = function(io,passport,rooms,users){
    var express = require('express');
    var router = express.Router();

    /* GET home page. */
    router.get('/', isLoggedIn, function(req, res, next) {
        var room = rooms.assignUser(req.user);
        res.render('index',{user:room[0],room:room[0].roomid,roomstatus:room[1],bid_cost:gameconfig.bid_cost});
    });

    // GET login
    router.get('/login', isNotLoggedIn, function (req, res, next) {
        res.render('login', { loginError: req.flash('loginError') });
    });

    // GET register
    router.get('/register', isNotLoggedIn, function (req, res, next) {
        res.render('register', { signUp: req.flash('signUp') });
    });

    // Logout
    router.get('/logout', isLoggedIn, function(req, res, next) {
        var user = users.user[req.user.id];
        if (typeof(user) == 'undefined') res.redirect('/');
        if (rooms.room[user.roomid].saveGame) res.redirect('/');
        log.print(req.user.name + " logout from the game", '', '', req.user.email);
        users.logout(io, rooms, req.user.id);
        req.logout();
        res.redirect('/');
    });

    // GET forgot password
    router.get('/forgot_password', isNotLoggedIn, function(req, res, next) {
        res.render('forgot_password', { forgotError: req.flash('forgotError') });
    });

    // POST forgot password
    router.post('/forgot_password', isNotLoggedIn, sendForgotPassword);

    // forgot password message
    router.get('/forgot_password_success', function(req, res, next) {
        res.render('forgot_password_success', { message: req.flash('message') });
    });

    // GET forgot password change password
    router.get('/forgot_password/:token', isNotLoggedIn, checkToken, function(user, req, res, next) {
        res.render('forgot_password_confirm', { forgotError: req.flash('forgotError') });
    });

    // POST forgot password change password
    router.post('/forgot_password/:token', isNotLoggedIn, checkToken, function(user, req, res, next) {
        // Validate password & confirm password
        log.print(req.connection.remoteAddress + ':  trying change new password', 'forgot-password', '', req.body.email);
        if (req.body.password != req.body.confirm_password) {
            req.flash('forgotError', { label: 'confirm_password', message: 'Password does not match' });
            res.redirect('/forgot_password/'+req.params.token);
            return;
        }

        // Update Password
        var updateQuery = "UPDATE users SET user_password = ?, user_last_ip = ? , reset_password_token = NULL WHERE user_id = ?";

        connection.query(updateQuery, [bcrypt.hashSync(req.body.password, null, null), req.connection.remoteAddress, user.user_id],function(err, results) {
            if(err)
                return done(err);
            log.print(req.connection.remoteAddress + ':  success change new password', 'forgot-password', '', req.body.email);
            req.flash('message', '<h5>Password successfully changed</h5>');
            res.redirect('/forgot_password_success');
        });
    });

    // POST local login
    router.post('/login', checkUserExist, passport.authenticate('local-login', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }
    ));

    // POST Register from landing page
    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // POST Register
    router.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // Auth google
    router.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    // Auth google callback
    router.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/login' }),
        function(req, res) {
            saveNewIP(req);
            log.print("Google Login, ID: " + req.user + ", IP: " + req.connection.remoteAddress, "login");
            res.redirect('/');
        }
    );

    // Auth Facebook
    router.get('/auth/facebook', passport.authenticate('facebook'));

    // Auth facebook callback
    router.get('/auth/facebook/callback',
        passport.authenticate('facebook', 
            { failureRedirect: '/login' }
        ),
        function (req, res) {
            saveNewIP(req);
            res.redirect('/');
        }
    );

    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()) {
            return next();
        }

        renderLanding(req, res);
    }

    // route middleware to make sure a user is not logged in
    function isNotLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (!req.isAuthenticated()) {
            return next();
        }

        // if they aren't redirect them to the home page
        res.redirect('/');
    }

    // Post Forgot Password
    function sendForgotPassword (req, res, next) {
        log.print(req.connection.remoteAddress + ': request forgot password', 'forgot-password', '', req.body.email);
        async.waterfall([
            function(done) {
                let token = randomstring.generate();
                done(null, token);
            },
            function(token, done) {
                connection.query("SELECT * FROM users WHERE user_email = ?",[req.body.email], function(err, rows) {
                    if (err)
                        return done(err);
                    if (!rows.length) {
                        req.flash('forgotError', { type: 'email', message: 'Couldn\'t find your Account', post: req.body })
                        return res.redirect('/forgot_password');
                    }

                    var updateQuery = "UPDATE users SET reset_password_token = ? WHERE user_id = ?";

                    connection.query(updateQuery, [token, rows[0].user_id],function(err, results) {
                        if(err)
                            return done(err);
                        done(err, rows[0], token);
                    });
                })
            },
            function(user, token, done) {
                let options = {
                    auth: {
                        api_user: emailconfig.sendgrid.user,
                        api_key: emailconfig.sendgrid.pass
                    }
                }
                let mailer = nodemailer.createTransport(sgTransport(options));
                readHTMLFile(__dirname + '/../views/email/forgot_password.html', function(err, html) {
                    var template = handlebars.compile(html);
                    var replacements = {
                        base_url: (req.protocol + '://' + req.get('host')),
                        token: token
                    };
                    var htmlToSend = template(replacements);
                    var mailOptions = {
                        from: {
                            name: 'Simantiz',
                            address: emailconfig.notification_email
                        },
                        to : user.user_email,
                        subject : 'Simantiz - Forgot Password',
                        html : htmlToSend
                    };
                    mailer.sendMail(mailOptions, function (error, response) {
                        if (error) {
                            req.flash('forgotError', { type: 'send', message: 'We have trouble when sending email, Please contact Administrator', post: req.body })
                            res.redirect('/forgot_password');
                        } else {
                            log.print(req.connection.remoteAddress + ': forgot password email sending to ' + req.body.email, 'forgot-password', '', req.body.email);
                            req.flash('message', '<h5>Email recovery has been sent,<br>Please check your email to change your password</h5>');
                            res.redirect('/forgot_password_success');
                        }
                    });
                });
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/forgot_password');
        });
    }

    // Check token forgot password
    function checkToken (req, res, next) {
        connection.query("SELECT * FROM users WHERE reset_password_token = ?",[req.params.token], function(err, rows) {
            if(err)
                return next(err);
            if(!rows.length)
                res.redirect('/');
            next(rows[0]);
        });
    }

    // Update user created ip
    function saveNewIP(req, res, next) {
        let ip = req.connection.remoteAddress;

        connection.query("UPDATE users SET user_created_ip = ? WHERE user_id = ?", [ip, req.user], function (err) {
            if (err)
                return false;
            return true;
        })
    }

    // Update user last ip
    function saveLastIP(req, res, next) {
        let ip = req.connection.remoteAddress;

        connection.query("UPDATE users SET user_last_ip = ? WHERE user_id = ?", [ip, req.user], function (err) {
            if (err)
                return false;
            return true
        })
    } 

    // Update user last ip
    function checkLogin(req, res, next) {
        let ip = req.connection.remoteAddress;

        connection.query("UPDATE users SET user_last_ip = ? WHERE user_id = ?", [ip, req.user], function (err) {
            if (err)
                return false;
            return true
        })
    } 

    // check users exists
    function checkUserExist(req, res, next) {
        if (!users.getDataByEmail(req.body.email)) {
            return next();
        }
        
        req.flash('loginError', { type: 'email', message: 'You already login in another devices (browser)', post: req.body});
        res.redirect('/login');
    }

    function renderLanding (req, res) {
        var now = new Date;

        var getQuery = squel.select({ separator: "\n" })
                            .field('*')
                            .field('gm.tot_clororo_sold', 'sales_unit')
                            .field('gm.tot_price_clororo_sold', 'sales_revenue')
                            .from('game_history gm')
                            .left_join("users", 'usr', "gm.user_id = usr.user_id")
                            .limit(10)
                            .toString();

        connection.query(getQuery, function(err, result){
            // if they aren't redirect them to the home page
            res.render('landing',{ signUp: req.flash('signUp'), top: result });
        })
    }

    return router;
};