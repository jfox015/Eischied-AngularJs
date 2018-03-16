/*
 * Module Dependancies
 */
var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var secrets = require('../config/secrets');
var util = require("util");

/**
 *  USER CONTROLLER.
 *  
 *  Handles user related functionality like login/logout, signup, account access and password management.
 *  
 *  @version 1.0
 *  @author Jeff Fox
 *  @package app.controllers.users
 */

/**
 * GET /users
 * Returns a list of current users
 * @param {type} req
 * @param {type} res
 */
exports.getUsers = function(req, res) {
  User.find(function(err, users) {
      if (err) {
        req.flash('errors', err);
        return res.redirect('/');
      }
      res.render('account/users', {
        title: 'Users', userList: users
      });
  });
};

/**
 * GET /login
 * Displays the login page
 * @param {type} req
 * @param {type} res
 */
exports.getLogin = function(req, res) {
  //if (req.user) return res.redirect('/');
  if (req.user) return res.redirect('/');
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 * @param {type} req
 * @param {type} res
 * @param {type} next
 */
exports.postLogin = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  
  var errors = req.validationErrors();
  
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }
  
  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * GET /signup
 * Signup page.
 * @param {type} req
 * @param {type} res
 * @returns {unresolved}
 */
exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }
  async.waterfall([
      function(done) {
          if(secrets.siteDetails.userActivation) {
            crypto.randomBytes(8, function(err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
        } else {
            done(null, null);
        }
      }, 
      function(token, done) {
          var active = false,
              expires = Date.now() + ((60*60*24*7)*1000); // 1 week
          if (token === null) {
              active = true;
              token = '';
              expires = null;
          }
          var user = new User({
            email: req.body.email,
            password: req.body.password,
            profile: {
                name: req.body.name || '' 
            },
            active: active,
            activationToken: token,
            activationExpires: expires
          });

          User.findOne({ email: req.body.email }, function(err, existingUser) {
            if (existingUser) {
              req.flash('errors', { msg: 'Account with that email address already exists.' });
              return res.redirect('/signup');
            }
            user.save(function(err) {
              if (err) return next(err);
              if (user.active) {
                req.logIn(user, function(err) {
                  if (err) return next(err);
                  done(err, token, user);
                });
              } else {
                done(err, token, user);
              }
            });
          });
      },
      function(token, user, done) {
          var message = 'Hello,\n\n';
          message += 'This is a confirmation that your account at  ' + secrets.siteDetails.siteName + ' has been created.<p>\n';
          if (!user.active) {
            message += 'To activate you account go to the <a href="' + req.protocol + '://'+ req.get('host') + '/activate/'+ user.activationToken+'">Activation page</a><p>\n\n';
          }
           message += 'Welcome and enjoy using the site';
          var mailOptions = {
            to: user.email,
            from: secrets.siteDetails.ownerEmail,
            subject: 'Your ' + secrets.siteDetails.siteName + ' Account Created!',
            text: message
          };
          if (secrets.environment === "development") {
                console.log(util.inspect(mailOptions, false, null));
                req.flash('success', { msg: 'Account created successfully! Check your email for further instructions.' });
                res.redirect('/');
          } else {
            var transporter = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                  user: secrets.sendgrid.user,
                  pass: secrets.sendgrid.password
                }
              });

              transporter.sendMail(mailOptions, function(err) {
                req.flash('success', { msg: 'Account created successfully! Check your email for further instructions.' });
                done(err);
              });
          }
      }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};

/**
 * GET /logout
 * Log out.
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Profile information updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) return next(err);
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = function(req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });

    user.save(function(err) {
      if (err) return next(err);
      req.flash('info', { msg: provider + ' account has been unlinked.' });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ resetPasswordToken: req.params.token })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function(err, user) {
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) return next(err);
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      if (secrets.environment === "development") {
            console.log(util.inspect(mailOptions, false, null));
            req.flash('success', { msg: 'Success! Your password has been changed.' });
            done(null);
      } else {
        var transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: secrets.sendgrid.user,
              pass: secrets.sendgrid.password
            }
          });

          transporter.sendMail(mailOptions, function(err) {
            req.flash('success', { msg: 'Success! Your password has been changed.' });
            done(err);
          });
      }
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = function(req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'No account with that email address exists.' });
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
        var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        if (secrets.environment === "development") {
              console.log(util.inspect(mailOptions, false, null));
              req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
              done('done');
        } else {
            var transporter = nodemailer.createTransport({
              service: 'SendGrid',
              auth: {
                user: secrets.sendgrid.user,
                pass: secrets.sendgrid.password
              }
            });

            transporter.sendMail(mailOptions, function(err) {
              req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
              done(err, 'done');
            });
        }
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};

/**
 * GET /activate/:token
 * Activate Account page.
 */
exports.getActivate = function(req, res) {
  if (req.isAuthenticated()) {
    req.flash('You\'re account is already active');
    return res.redirect('/');
  }
  if (req.params.token) {
      exports.activateUser(req.params.token, req, res);
  } else {
      res.render('account/activate', {
        title: 'Account Activation'
      });
  }
};

/**
 * POST /activate/:token
 * Process the Account Activation request.
 */
exports.postActivate = function(req, res, next) {
  req.assert('activationCode', 'An activation Code is required and must be at least 8 characters long.').notEmpty().len(8);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.render('/activate');
  }
  exports.activateUser(req.body.activationCode, req, res, next);
  
};
/**
 * 
 * @param {type} activationCode
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {undefined}
 */
exports.activateUser = function(activationCode, req, res, next) {
    async.waterfall([
        function(done) {
          User
            .findOne({ activationToken: activationCode })
            .where('activationExpires').gt(Date.now())
            .exec(function(err, user) {
              if (!user) {
                req.flash('errors', { msg: 'Sorry, your activation code is invalid or has expired.' });
                return res.render('/activate');
              }

              user.active = true;
              user.activationToken = undefined;
              user.activationExpires = undefined;

              user.save(function(err) {
                if (err) return next(err);
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            });
        },
        function(user, done) {
          var mailOptions = {
            to: user.email,
            from: secrets.siteDetails.ownerEmail,
            subject: 'Your '+ secrets.siteDetails.siteName + ' account has been activated!',
            text: 'Hello,\n\n' +
              'This is a confirmation that your '+ secrets.siteDetails.siteName + ' account has just been activated.\n'
          };
          if (secrets.environment === "development") {
              console.log(util.inspect(mailOptions, false, null));
              req.flash('success', { msg: 'Success! Your account has been activated.' });
              done(null);
          } else {
              var transporter = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                  user: secrets.sendgrid.user,
                  pass: secrets.sendgrid.password
                }
              });
              transporter.sendMail(mailOptions, function(err) {
                req.flash('success', { msg: 'Success! Your account has been activated.' });
                done(err);
          });
          }
        }
      ], function(err) {
        if (err) return next(err);
        res.redirect('/');
  });
};