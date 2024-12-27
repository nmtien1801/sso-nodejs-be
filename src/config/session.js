import session from "express-session";
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { Sequelize } = require("sequelize");
require("dotenv").config();
import passport from "passport";

const configSession = (app) => {
  // Khởi tạo Sequelize
  const sequelize = new Sequelize(
    process.env.DB_DATABASE_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT, // hoặc 'mariadb', 'postgres', v.v.
      timezone: '+07:00', // Đặt múi giờ theo chuẩn ISO (+07:00 cho Việt Nam)
      logging: false,  // Tắt log SQL
    },
  );

  // Cấu hình store
  const store = new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 12 * 60 * 60 * 1000, // Kiểm tra session hết hạn mỗi 10 phút
    expiration: 12 * 60 * 60 * 1000, // Session tồn tại 12 giờ - db
  });

  app.use(
    session({
      secret: "your-secret-key", // Chuỗi bí mật cho session
      store: store, // Sử dụng Sequelize Store
      resave: false, // Không lưu lại session nếu không thay đổi
      saveUninitialized: false, // Không lưu session trống
      proxy: true, // Đặt true nếu sử dụng reverse proxy
      cookie: {
        secure: false, // Đặt true nếu dùng HTTPS
        maxAge: 12 * 60 * 60 * 1000, // Session tồn tại 12h - cookie
      },

    })
  );

  // Đồng bộ bảng session với cơ sở dữ liệu
  store.sync();

  // Sử dụng Passport kết nối session
  app.use(passport.authenticate("session"));

  // mã hóa: chuyển theo 1 format nào đó -> lưu vào cookie
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      //   cb(null, { id: user.id, username: user.username });
      cb(null, user);
    });
  });

  // giải mã: lấy từ cookie -> chuyển về dạng ban đầu
  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
};

export default configSession;
