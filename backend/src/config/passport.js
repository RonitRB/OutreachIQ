const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserProfile = require('../models/UserProfile');

const configurePassport = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        accessType: 'offline',
        prompt: 'consent',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await UserProfile.findOne({ googleId: profile.id });

          if (!user) {
            user = await UserProfile.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              avatar: profile.photos[0]?.value || '',
              googleRefreshToken: refreshToken || undefined,
            });
          } else {
            user.email = profile.emails[0].value;
            user.name = profile.displayName;
            user.avatar = profile.photos[0]?.value || '';
            if (refreshToken) {
              user.googleRefreshToken = refreshToken;
            }
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserProfile.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = configurePassport;
