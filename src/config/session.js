import  session from 'express-session';

app.use(session({
  secret: 'your-secret-key', // Chuỗi bí mật dùng để mã hóa session
  resave: false, // Không lưu lại session nếu không thay đổi
  saveUninitialized: true, // Lưu session mới, ngay cả khi chưa được khởi tạo
  cookie: { secure: false } // Đặt `true` nếu dùng HTTPS
}));