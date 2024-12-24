import express from "express";
import authController from "../controller/authController";
// import { checkUserJwt, checkUserPermission } from "../middleware/jwtAction";
import passport from "passport";
import LocalStrategy from "passport-local";

const router = express.Router(); // bằng app = express();
/**
 *
 * @param {*} app : express app
 * @returns
 */

const initAuthRoutes = (app) => {
  // middleware
  //   router.all("*", checkUserJwt, checkUserPermission);

  // views
  router.get("/loginPage", (req, res) => {
    return res.render("login");
  });

  router.get("/", (req, res) => {
    return res.render("home");
  });

  //rest api - dùng web sử dụng các method (CRUD)
  //GET(R), POST (C), PUT (U), DELETE (D)
  router.post("/register", authController.handleRegister);
  router.post(
    "/login",
    // authController.handleLogin,
    passport.authenticate("local", {
      successRedirect: "/api/v1/",
      failureRedirect: "/api/v1/loginPage",
    })
  );
  router.post("/logout", authController.handleLogout);

  return app.use("/api/v1", router);
};

export default initAuthRoutes;
