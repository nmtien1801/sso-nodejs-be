
# SSO PROJECT BE 

## Người thực hiện 
- người thực hiện: Nguyễn Minh Tiến

## Công nghệ sử dụng
- FE: react 
- BE: express, nodejs

## link Github
- [FE](https://github.com/nmtien1801/sso-react-fe.git)
- [BE](https://github.com/nmtien1801/sso-nodejs-be.git)


##  Mô tả
- giúp người dùng đăng nhập bằng email, google, facebook. áp dụng statefull + stateless để đăng nhập nhằm tăng tính bảo mật. chức năng quên mật khẩu, đăng ký....

- tại FE: http://localhost:3000 
- chuyển đến BE để login: http://localhost:8080/login?serviceURL=http://localhost:3000
- bấm login về lại FE: http://localhost:3000/code?ssoToken=123456
- verify token 123456 lưu trong db, nếu đúng trả về FE jwt
- FE sẽ decode jwt để thực hiện các chức năng khác ....


## Screenshots
*Hình 1: Màn hình Đăng nhập và Đăng ký với giao diện đơn giản, thân thiện.*

![App Screenshot](https://res.cloudinary.com/dv6qgkaj4/image/upload/v1734138120/login-register_mgxmkz.png)



