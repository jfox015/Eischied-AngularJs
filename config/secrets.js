module.exports = {

  environment: 'development',
    
  siteDetails: {
      siteName: "Project Eischied",
      ownerName: "Eischied Admin",
      ownerEmail: "jfox015@gmail.com",
      userActivation: false
  },
  
  db: process.env.MONGODB || 'mongodb://localhost:27017/mydb',
  
  sessionSecret: process.env.SESSION_SECRET || 'c8c0ea1c4a6b199b3429722512fbd17f',
    
  facebook: {
    clientID: process.env.FACEBOOK_ID || '754220301289665',
    clientSecret: process.env.FACEBOOK_SECRET || '41860e58c256a3d7ad8267d3c1939a4a',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  },
  
  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || 'hspassword00'
  },
};