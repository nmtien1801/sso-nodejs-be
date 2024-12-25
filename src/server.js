import express from "express";
import configViewEngine from "./config/viewEngine";
import initAuthRoutes from "./routes/authRoute";
import viewRoutes from "./routes/viewRoute";
import configCORS from "./config/cors";
import bodyParser from "body-parser"; // lấy params, query /user?id=7
require("dotenv").config();
// import connection from "./config/connectDB";
import cookieParser from "cookie-parser";
import {handleLogin} from "./controller/authController";
import configSession from './config/session';
const app = express();
// config viewEngine
configViewEngine(app);

//-------------------------------------------------------------------------------------
// config body parser
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// -> fix bug lưu img : request entity too large react
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//-------------------------------------------------------------------------------------
//test connection sequelize
// connection();

//-------------------------------------------------------------------------------------
// share localHost BE & FE
configCORS(app);

//config cookie-parser
app.use(cookieParser());

//-----------------session : tạo table DB để lưu session (giống model)------------------
configSession(app);

//-------------------------------------------------------------------------------------
initAuthRoutes(app);
viewRoutes(app);


// đây là midleware(chạy từ trên xuống và xoay hoài nếu không có next)
// nếu đúng authenticate thì trang web hiện (bởi next) thường đặt ở giữa
// Cannot get/(link...) -> 404 not found
app.use((req, res) => {
  return res.send("404 not found");
});

// ----------------------------- dùng passport sso ---------------------------
handleLogin();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`>>> sso backend is running on the port ${PORT}`);
});
