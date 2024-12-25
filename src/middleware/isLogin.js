const IsLogin = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.path === '/login') {
            return res.redirect('/'); // Nếu đã đăng nhập, chuyển hướng về trang chủ
        }
        return next(); // Nếu đã đăng nhập và không phải `/login`, cho phép tiếp tục
    }

    else if (req.path === '/login') {
        return next(); // Cho phép truy cập trang login nếu chưa đăng nhập
    }

    return res.redirect('/login'); // Nếu chưa đăng nhập và cố truy cập trang khác, chuyển đến login
};

export default IsLogin;