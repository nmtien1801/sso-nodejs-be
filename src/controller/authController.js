import authService from "../service/authService";
import passport from "passport";
import LocalStrategy from "passport-local";
import flash from "connect-flash";
import { v4 as uuidv4 } from "uuid";
import { createJwt, refreshToken } from "../middleware/jwtAction";
import "dotenv/config";
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
import emailService from "../service/emailService";

const handleRegister = async (req, res) => {
  try {
    let formData = req.body.formData;
    if (!formData.email || !formData.phone || !formData.password) {
      res.status(200).json({
        EM: "Missing require parameters", //error message
        EC: 1, //error code
        DT: "", // data
      });
    }
    if (formData.password && formData.password.length < 4) {
      res.status(200).json({
        EM: "your password must more than 3 letters", //error message
        EC: 1, //error code
        DT: "", // data
      });
    }

    // service: create user
    let data = await authService.registerNewUser(formData);

    return res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT, // data
    });
  } catch (error) {
    return res.status(500).json({
      EM: "error from sever", //error message
      EC: -1, //error code
      DT: "", // data
    });
  }
};

// config passport local
const handleLogin = async () => {
  try {
    passport.use(
      new LocalStrategy({}, async function (username, password, done) {
        let rawData = {
          username: username,
          password: password,
        };
        let data = await authService.handleUserLogin(rawData);
        if (data && +data.EC === 0) {
          return done(null, data.DT);
        } else {
          return done(null, false, { message: data.EM });
        }
      })
    );
  } catch (error) {
    console.log("err control login: ", error);
  }
};

// logout
const handleLogout = async (req, res) => {
  try {
    let cookies = req.cookies;
    // xóa tại page home.ejs BE
    if (cookies && cookies["connect.sid"]) {
      req.session.destroy((err) => {
        if (err)
          return res.status(500).json({
            EM: "Failed to destroy session",
            EC: -1,
          });
      });
      res.clearCookie("connect.sid");

      return res.redirect("/login"); // Chuyển hướng đến trang đăng nhập BE
    }

    // xóa tại page FE
    if (cookies && cookies.access_Token) {
      // clear cookie
      res.clearCookie("access_Token");
      res.clearCookie("refresh_Token");
      return res.status(200).json({
        EM: "ok",
        EC: 0,
        DT: "", // data
      });
    } else {
      return res.status(401).json({
        EM: "you are not authenticated", //error message
        EC: 2, //error code
        DT: "", // data
      });
    }
  } catch (error) {
    console.log("err control logout: ", error);
    return res.status(500).json({
      EM: "error from sever", //error message
      EC: -1, //error code
      DT: "", // data
    });
  }
};

const check_ssoToken = async (req, res, next) => {
  try {
    const ssoToken = req.body.ssoToken;
    console.log(">>>> user: ", req.user);

    // check ssoToken
    if (req.user && req.user.code && req.user.code === ssoToken) {
      const refreshToken = uuidv4();

      // update refreshToken in user
      await authService.updateUserRefreshToken(req.user.email, refreshToken);

      // create access_Token -> sửa res.DT(service) trong lần check thứ 1
      let payload = {
        email: req.user.email,
        userName: req.user.userName,
        pathOfRole: req.user.pathOfRole,
        roleID: req.user.roleID, // chức vụ
      };
      let token = createJwt(payload);

      // set cookie
      res.cookie("access_Token", token, {
        httpOnly: true, // chỉ cho phép server đọc cookie, không cho client
        secure: false,
        maxAge: +process.env.MAX_AGE_ACCESS_TOKEN, // 15P
      });
      res.cookie("refresh_Token", refreshToken, {
        httpOnly: true, // chỉ cho phép server đọc cookie, không cho client
        secure: false,
        maxAge: +process.env.MAX_AGE_REFRESH_TOKEN, // 1 days
      });

      //destroy column session -> giống logout
      let beforeSession = {
        email: req.user.email,
        userName: req.user.userName,
        pathOfRole: req.user.pathOfRole,
        roleID: req.user.roleID, // chức vụ
        access_Token: token,
        refresh_Token: refreshToken,
      };

      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) return reject(err);
          res.clearCookie("connect.sid", {
            httpOnly: true,
            secure: false,
          });
          resolve();
        });
      });

      return res.status(200).json({
        EM: "ok",
        EC: 0,
        DT: beforeSession,
      });
    } else {
      return res.status(401).json({
        EM: "ssoToken is invalid",
        EC: 1,
        DT: "",
      });
    }
  } catch {
    console.log("err check ssoToken: ", error);
    return res.status(500).json({
      EM: "error from sever", //error message
      EC: -1, //error code
      DT: "", // data
    });
  }
};

const getUserAccount = async (req, res) => {
  setTimeout(() => {
    try {
      // req lấy từ jwtAction.js
      return res.status(200).json({
        EM: "ok fetch context",
        EC: 0,
        DT: {
          access_Token: req.access_Token,
          refresh_Token: req.refresh_Token,
          pathOfRole: req.user.pathOfRole,
          email: req.user.email,
          userName: req.user.userName,
        },
      });
    } catch (error) {
      console.log("err get user account: ", error);
      return res.status(500).json({
        EM: "error from sever", //error message
        EC: 2, //error code
        DT: "", // data
      });
    }
  }, 1000);
};

// config passport google auth2
const handleLoginWithGoogle = () => {
  try {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_APP_CLIENT_ID,
          clientSecret: process.env.GOOGLE_APP_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_APP_REDIRECT_LOGIN,
        },
        async function (accessToken, refreshToken, profile, done) {
          const typeAccount = "google";

          // thông tin khi login google
          let rawData = {
            userName: profile.displayName,
            email:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : profile.id,
            googleId: profile.id,
          };

          // check user DB(create + update)
          let data = await authService.upsertUserSocialMedia(
            typeAccount,
            rawData
          );

          if (data && +data.EC === 0) {
            return done(null, data.DT);
          } else {
            return done(null, false, { message: data.EM });
          }
        }
      )
    );
  } catch (error) {
    console.log("err control login: ", error);
  }
};

// config passport facebook
const handleLoginWithFacebook = () => {
  try {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FB_APP_CLIENT_ID,
          clientSecret: process.env.FB_APP_CLIENT_SECRET,
          callbackURL: process.env.FB_APP_REDIRECT_LOGIN,
          profileFields: ["id", "emails", "displayName"], // Đảm bảo bạn yêu cầu đúng trường
        },
        async function (accessToken, refreshToken, profile, done) {
          const typeAccount = "facebook";

          // thông tin khi login facebook
          let rawData = {
            userName: profile.displayName,
            email:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : profile.id,
            facebookId: profile.id,
          };

          // check user DB(create + update)
          let data = await authService.upsertUserSocialMedia(
            typeAccount,
            rawData
          );

          if (data && +data.EC === 0) {
            return done(null, data.DT);
          } else {
            return done(null, false, { message: data.EM });
          }
        }
      )
    );
  } catch (error) {
    console.log("err control login: ", error);
  }
};

const sendCode = async (req, res) => {
  try {
    let email = req.body.email;

    // check email -> phải là local (kh nhận google, facebook)
    let checkEmailLocal = await authService.checkEmailLocal(req.body.email);
    
    if (checkEmailLocal.EC !== 0) {
      return res.status(401).json({
        EM: checkEmailLocal.EM,
        EC: checkEmailLocal.EC,
        DT: "",
      });
    }

    let code = await emailService.sendSimpleEmail(email); // gửi mail -> lấy code
    let updateCode = await authService.updateCode(email, code); // khi nhận đc mail lập tức update code vào DB

    return res.status(200).json({
      EM: "ok",
      EC: 0,
      DT: { email: email },
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      EM: "error from server",
      EC: -1,
      DT: "",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    let email = req.body.email;
    let code = req.body.code;
    let password = req.body.password;

    let user = await authService.updatePassword(email, password, code);
    if (user.EC !== 0) {
      return res.status(401).json({
        EM: user.EM,
        EC: user.EC,
        DT: "",
      });
    }

    return res.status(200).json({
      EM: "ok",
      EC: 0,
      DT: "",
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      EM: "error from server",
      EC: -1,
      DT: "",
    });
  }
};

module.exports = {
  handleRegister,
  handleLogin,
  handleLogout,
  check_ssoToken,
  getUserAccount,
  handleLoginWithGoogle,
  handleLoginWithFacebook,
  sendCode,
  resetPassword,
};
