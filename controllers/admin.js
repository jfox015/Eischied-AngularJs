/**
 * ADMIN CONTROLLER
 * Main controller for the admin dashboard area of the site.
 */
/*------------------------------------------------------------------------------
/  
/  ROUTE HANDLERS
/  
------------------------------------------------------------------------------*/
/**
 * Home page
 * @route GET /admin
 */
exports.index = function(req, res) {
  res.render('admin/dashboard', {
    title: 'Dashboard'
  });
};