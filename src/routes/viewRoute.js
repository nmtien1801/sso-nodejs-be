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
    return res.render("login");
  });

  router.get("/", IsLogin, (req, res) => {
    return res.render("home");
  });

  router.post("/register", authController.handleRegister);
  

  return app.use("", router);
};

export default viewRoutes;
