require("dotenv").config(); // dùng env
import nodemailer from "nodemailer";

let getBodyHTMLEmail = (receiverEmail, code) => {
  return `
        <h3> Xin chào ${receiverEmail}!</h3>
        <p> Veryfication code của bạn là </p>
        <h3> ${code} </h3>
  
        <p> Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.Nếu bạn có bất kì vấn đề nào, 
        vui lòng liên hệ với bộ phận hỗ trợ!</p>
  
        <div> <b>Trân trọng!</b> </div>
      `;
};

// search : nodemailer
let sendSimpleEmail = async (receiverEmail) => {
  try {
    // fortmat email chủ -> nơi gửi email đến patient
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    let code = Math.floor(100000 + Math.random() * 900000); // random code

    // gửi mail tới đối tượng chủ transporter
    const info = await transporter.sendMail({
      from: `"tên fake email👻" <${process.env.SEND_EMAIL}>`, // sender address
      to: receiverEmail, // email của patient -> "a@example.com, b@example.com"
      subject: "Tiêu đề -  Veryfication code", // Subject line
      html: getBodyHTMLEmail(receiverEmail, code), // html body -> lưu theo ngôn ngữ
    });
    return code;
  } catch (error) {
    console.log("check Err send email: ", error);
    return null;
  }
};

// let getBodyHTMLEmailRemedy = (dataSend) => {
//   let result = "";
//   if (dataSend.language === "vi") {
//     result = `
//       <h3> Xin chào ${dataSend.patientName}!</h3>
//       <p> Bạn đã nhận được email này vì đã đặt lịch khám bệnh online thành công tại phòng khám chúng tôi</p>
//       <p> Thông tin đơn thuốc/ hoá đơn được gửi trong file đính kèm sau: </p>

//       <div> <b>Xin chân thành cảm ơn!</b> </div>
//     `;
//   }
//   if (dataSend.language === "en") {
//     result = `
//     <h3> Dear ${dataSend.patientName}!</h3>
//     <p> You are receiving this email because you have successfully booked an online medical examination appointment at our clinic </p>
//     <p> Prescription / invoice information is sent in the attached file below: </p>

//     <div> <b>Thank you very much!</b> </div>
//   `;
//   }
//   return result;
// };

// gửi tệp kèm theo (ảnh / video) tới email
// search: How to send email attachments using nodemailer
let sendAttachmentEmail = async (dataSend) => {
  // fortmat email chủ -> nơi gửi email đến patient
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // gửi mail tới đối tượng chủ transporter
  const info = await transporter.sendMail({
    from: '"tên fake 2 email👻" <tiennguyenminh1801@gmail.com>', // sender address
    to: dataSend.email, // email của patient -> "a@example.com, b@example.com"
    subject: "KẾT QUẢ ĐẶT LỊCH KHÁM BỆNH", // Subject line
    html: getBodyHTMLEmailRemedy(dataSend), // html body -> lưu theo ngôn ngữ
    // search: nodejs send image base64 as attachment
    attachments: [
      {
        filename: `remedy-${dataSend.patientID}-${new Date().getTime()}.png`, // file khi được lưu vào email có dạng này
        content: dataSend.imgBase64.split("base64,")[1], // lấy đường dẫn từ FE gửi xuống
        encoding: "base64",
      },
    ],
  });
};

module.exports = { sendSimpleEmail, sendAttachmentEmail };
