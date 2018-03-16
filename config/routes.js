var passport = require('passport');
var passportConf = require('./passport');

/**
* Controllers (route handlers).
*/
var homeController = require('../controllers/home');
var userController = require('../controllers/user');
var contactController = require('../controllers/contact');
var episodeController = require('../controllers/episodes');
var adminController = require('../controllers/admin');

/**
 * ROUTES
 * 
 * @param Express App app
 * @package config.routes
 */
module.exports = function(app){

    /**-----------------------------------
    / APP ROUTES
    /-----------------------------------*/
    app.get('/', homeController.index);
    // LOGIN
    app.route('/login')
        .get(userController.getLogin)
        .post(userController.postLogin);

    app.get('/logout', userController.logout);

    // SIGNUP
    app.route('/signup')
        .get(userController.getSignup)
        .post(userController.postSignup);

    // USERS (AUTHENTICATED ONLY)
    app.route('/users')
        .all(passportConf.isAuthenticated)
        .get(userController.getUsers);

    // USER TOOLS
    app.get('/forgot', userController.getForgot);
    app.post('/forgot', userController.postForgot);
    app.get('/reset/:token', userController.getReset);
    app.post('/reset/:token', userController.postReset);
    app.get('/activate', userController.getActivate);
    app.get('/activate/:token', userController.getActivate);
    app.post('/activate', userController.postActivate);
    app.get('/account', passportConf.isAuthenticated, userController.getAccount);
    app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
    app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
    app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
    app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

    // CONTACT
    app.get('/contact', contactController.getContact);
    app.post('/contact', contactController.postContact);
    
    //FACE BOOK AUTH
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
      res.redirect(req.session.returnTo || '/');
    });
    app.get('/episodes', episodeController.viewEpisodes);
    
    /*------------------------------------------
    /   RESTful APIs
    /------------------------------------------*/
    app.route('/api/episodes')
            .get(episodeController.getEpisodes)
            .post(episodeController.postEpisodes);
    
    app.route('/api/episode/:id')
            .get(episodeController.getEpisode)
            .put(episodeController.putEpisode);
    
    app.get('/api/episode/delete/:id', episodeController.getDelete);
    
     /*------------------------------------------
    /   ADMINISTRATIVE DASHBOARD
    /------------------------------------------*/
    app.get('/admin/dashboard', passportConf.isAuthenticated, adminController.index);
    
};