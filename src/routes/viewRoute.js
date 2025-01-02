import express from "express";
import authController from "../controller/authController";
// import { checkUserJwt, checkUserPermission } from "../middleware/jwtAction";
import passport from "passport";
import LocalStrategy from "passport-local";
import IsLogin from "../middleware/isLogin";
require("dotenv").config();

const router = express.Router(); // bằng app = express();
/**
 *
 * @param {*} app : express app
 * @returns
 */

const viewRoutes = (app) => {
  // middleware
  //   router.all("*", checkUserJwt, checkUserPermission);

  // ======================= views =========================
  router.get("/login", IsLogin, (req, res) => {
    const serviceURL = req.query.serviceURL;
    return res.render("login", {redirectURL: serviceURL});
  });

  router.get("/", IsLogin, (req, res) => {
    return res.render("home");
  });  

  router.get("/forgot-password-page", (req, res) => {
    let backUrlLogin = process.env.URL_LOGIN;
    return res.render("forgot-password", {backUrlLogin});
  });  
  
  return app.use("", router);
};

export default viewRoutes;
