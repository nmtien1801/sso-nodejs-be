import passport from "passport";
import LocalStrategy from "passport-local";

const configPassport = () =>{
    passport.use(new LocalStrategy(
        function(username, password, done) {
          console.log("check control login", username, password);
          // User.findOne({ username: username }, function (err, user) {
          //   if (err) { return done(err); }
          //   if (!user) { return done(null, false); }
          //   if (!user.verifyPassword(password)) { return done(null, false); }
          //   return done(null, user);
          // });
        }
      ));
}

module.exports = {configPassport}