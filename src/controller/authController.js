import authService from "../service/authService";
import { verifyToken } from "../middleware/jwtAction";
import passport from "passport";
import LocalStrategy from "passport-local";
import flash from "connect-flash";
import { v4 as uuidv4 } from "uuid";
import { createJwt, refreshToken } from "../middleware/jwtAction";
import "dotenv/config";

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

const handleLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err); // Nếu có lỗi khi xóa session, chuyển lỗi cho middleware tiếp theo
    }
    // Xóa cookie của session
    res.clearCookie("connect.sid"); // Xóa cookie 'connect.sid' hoặc cookie bạn cấu hình
    // Chuyển hướng người dùng về trang chủ (hoặc trang đăng nhập)
    res.redirect("/");
  });
};

const getRefreshToken = (req) => {
  let cookies = req.cookies;
  if (cookies && cookies.refreshToken) {
    return cookies.refreshToken;
  } else {
    return res.status(401).json({
      EM: "you are not authenticated", //error message
      EC: 2, //error code
      DT: "", // data
    });
    verifyToken(cookies.refreshToken);
  }
};

const check_ssoToken = async (req, res, next) => {
  try {
    const ssoToken = req.body.ssoToken;

    // check ssoToken
    if (req.user && req.user.code && req.user.code === ssoToken) {
      const refreshToken = uuidv4();

      // update refreshToken in user
      await authService.updateUserRefreshToken(req.user.email, refreshToken);

      // create access_Token -> sửa res.DT(service) trong lần check thứ 1
      let payload = {
        email: req.user.email,
        userName: req.user.userName,
        // groupWithRole: req.user.groupWithRole,
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
        // groupWithRole: req.user.groupWithRole,
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

module.exports = {
  handleRegister,
  handleLogin,
  handleLogout,
  check_ssoToken,
};
