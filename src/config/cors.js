require("dotenv").config();

// CORS : chặn api khi host lạ truy cập => phải đùng port (3000) mới lấy đc API
const configCORS = (app) => {
  // Add headers before the routes are defined
  app.use(function (req, res, next) {
    // console.log(">>>check bug don't status(FE): ", req.method);
    // FE connect đến BE
    const origin = req.headers.origin;
    const allowedOrigins = process.env.REACT_URL.split(',');
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Request methods bạn muốn cho phép
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    // Request tiêu đề bạn muốn cho phép
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type, Authorization" //Search: How to extract token string from Bearer token?
    );
    // Đặt thành true nếu bạn cần trang web đưa cookie vào các requests được gửi
    // tới API (ví dụ: trong trường hợp bạn sử dụng phiên)
    res.setHeader("Access-Control-Allow-Credentials", true);

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    // Chuyển sang lớp middleware tiếp theo
    next();
  });
};

export default configCORS;
