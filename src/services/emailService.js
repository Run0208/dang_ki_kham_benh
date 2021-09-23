require('dotenv').config();
import nodemailer from 'nodemailer';

let sendSimpleEmail = async (dataSend) => {
     // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP, // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Đường Đăng Đức 👻" <duongdangduc02082000@gmail.com', // sender address
        to: dataSend.reciverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh ✔", // Subject line
        html: getBodyHTMLEmail(dataSend),
    });
}

let getBodyHTMLEmail = (dataSend) => {
    let result = '';
    if(dataSend.language === 'vi') {
        result = 
            `
                <h3>Xin chào ${dataSend.patientName} !</h3>
                <p>Bạn nhận được email vì đã đặt lịch trên hệ thống đặt lịch khám bệnh</p>
                <p>Thông tin đặt lịch khám bệnh:</p>
                <div><b>Thời gian: ${dataSend.time}</b></div>
                <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>
                <p>Vui lòng click đường link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.</p>
                <div>
                    <a href=${dataSend.redirectLink} target="_blank">Click here</a>
                </div>
                <div>Thanks !</div>
            `;
    }
    if(dataSend.language === 'en') {
        result = 
            `
                <h3>Dear ${dataSend.patientName} !</h3>
                <p>You received the email because it was set up on the appointment booking system.</p>
                <p>Information to schedule an appointment:</p>
                <div><b>Time: ${dataSend.time}</b></div>
                <div><b>Doctor: ${dataSend.doctorName}</b></div>
                <p>Please click on the link below to confirm and complete the appointment booking procedure.</p>
                <div>
                    <a href=${dataSend.redirectLink} target="_blank">Click here</a>
                </div>
                <div>Thanks !</div>
            `;
    }

    return result;
}

module.exports = {
    sendSimpleEmail: sendSimpleEmail
}