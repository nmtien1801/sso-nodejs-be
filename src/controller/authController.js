import authService from "../service/authService";
import { verifyToken } from "../middleware/jwtAction";
import passport from "passport";
import LocalStrategy from "passport-local";
import flash from 'connect-flash';

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
    passport.use(new LocalStrategy(
      {
      },
      async function(username, password, done) {
        let rawData ={
          username: username,
          password: password
        }
        let data = await authService.handleUserLogin(rawData);
        if(data && +data.EC === 0){
          return done(null, data.DT);
        }else{
          return done(null, false, { message: data.EM }); 
        }
      }
    ));

  } catch (error) {
    console.log("err control login: ", error);
  }
};

const handleLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);  // Nếu có lỗi khi xóa session, chuyển lỗi cho middleware tiếp theo
    }
    // Xóa cookie của session
    res.clearCookie('connect.sid'); // Xóa cookie 'connect.sid' hoặc cookie bạn cấu hình
    // Chuyển hướng người dùng về trang chủ (hoặc trang đăng nhập)
    res.redirect('/');
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

module.exports = {
  handleRegister,
  handleLogin,
  handleLogout,
};
