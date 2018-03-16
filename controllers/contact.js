var secrets = require('../config/secrets');
var nodemailer = require("nodemailer");
var util = require("util");

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = function(req, res) {
  res.render('contact', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = function(req, res) {
      
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('message', 'Message cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/contact');
  }

  var mailOptions = {
    to: secrets.siteDetails.ownerEmail,
    from: req.body.email,
    subject: 'Contact Form Submission',
    text: req.body.message
  };
  if (secrets.environment === "development") {
        console.log(util.inspect(mailOptions, false, null));
        req.flash('success', { msg: 'Your message has been sent successfully!' });
        res.render('contact', { title: 'contact', sent: true });
  } else {
        var transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: secrets.sendgrid.user,
              pass: secrets.sendgrid.password
            }
          });
        transporter.sendMail(mailOptions, function(err) {
          if (err) {
            req.flash('errors', { msg: err.message });
            return res.redirect('/contact');
          }
          req.flash('success', { msg: 'Email has been sent successfully!' });
          res.redirect('/contact');
        });
    }   
};