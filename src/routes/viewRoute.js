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

  return app.use("", router);
};

export default viewRoutes;
