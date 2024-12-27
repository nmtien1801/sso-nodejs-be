import express from "express";
import authController from "../controller/authController";
// import { checkUserJwt, checkUserPermission } from "../middleware/jwtAction";
import passport from "passport";
import LocalStrategy from "passport-local";
import IsLogin from "../middleware/isLogin";

const router = express.Router(); // bằng app = express();
/**
 *
 * @param {*} app : express app
 * @returns
 */

const initAuthRoutes = (app) => {
  // middleware
  //   router.all("*", checkUserJwt, checkUserPermission);

  // custom passport  -> sau đó dùng handleLogin ở (server)
  router.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (!user) {
        return res.status(401).json(info.message);
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        // return res.redirect(req.body.serviceURL);
        return res.status(200).json({...user, redirectURL: req.body.serviceURL});
      });
    })(req, res, next);
  });

  router.post("/api/register", authController.handleRegister);
  router.post("/logout", authController.handleLogout);
  router.post("/api/verify-token", authController.check_ssoToken);
  return app.use("", router);
};

export default initAuthRoutes;
