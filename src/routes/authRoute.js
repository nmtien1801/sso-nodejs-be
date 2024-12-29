import express from "express";
import authController from "../controller/authController";
import { checkUserJwt, checkUserPermission } from "../middleware/jwtAction";
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
  router.all("*", checkUserJwt, checkUserPermission);

  // custom passport  -> sau đó dùng authController.handleLogin ở (server.js)
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
        return res
          .status(200)
          .json({ ...user, redirectURL: req.body.serviceURL });
      });
    })(req, res, next);
  });

  // custom passport google -> sau đó dùng authController.handleLoginWithGoogle ở (server.js)
  router.get(
    "/auth/google",
    (req, res, next) => {
      const redirectUrl = req.query.redirectUrl;
      const state = encodeURIComponent(redirectUrl); // Mã hóa URL để truyền trong state -> state nhận req khi bấm login
      passport.authenticate("google", {
        scope: ["profile", "email"],
        state: state, // Gắn URL vào state
      })(req, res, next);
    }
  );

  router.get(
    "/auth/google/redirect",
    passport.authenticate("google", {
      failureRedirect: "/login",
    }),
    (req, res) => {
      console.log("req.user", req.user);
      const redirectUrl = decodeURIComponent(req.query.state);
      res.redirect(redirectUrl + `/code?ssoToken=${req.user.code}`);
    }
  );

  router.post("/api/register", authController.handleRegister);
  router.post("/api/logout", authController.handleLogout);
  router.post("/api/verify-token", authController.check_ssoToken);
  router.get("/api/account", authController.getUserAccount);

  return app.use("", router);
};

export default initAuthRoutes;
