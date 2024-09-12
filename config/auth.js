var ids = {
  facebook: {
    clientID: String(process.env.FACEBOOK_CLIENT_ID),
    clientSecret: String(process.env.FACEBOOK_CLIENT_SECRET),
    callbackURL: `${String(process.env.APP_URL)}/auth/facebook/callback`
  },
  google: {
    clientID: String(process.env.GOOGLE_CLIENT_ID),
    clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
    callbackURL: `${String(process.env.APP_URL)}/auth/google/callback`,
  }
};

module.exports = ids;