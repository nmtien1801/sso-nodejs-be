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

  // ======================= views =========================
  // router.get("/login", IsLogin, (req, res) => {
  //   return res.render("login");
  // });

  // router.get("/", IsLogin, (req, res) => {
  //   return res.render("home");
  // });

  router.post(
    "/api/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
    })
  ); // -> sau đó dùng handleLogin ở (server)
  router.post("/logout", authController.handleLogout);

  return app.use("", router);
};

export default initAuthRoutes;
