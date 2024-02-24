const nodemailer = require('nodemailer');
const templateEmail = require('../utils/template');



async function sendMail(template, opts) {
    try {
        if (!template) return { errCode: 1, errMsg: 'Invalid template' };

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        // create reusable transporter object using the default SMTP transport

        let getTemplate = templateEmail[template]?.(opts);

        if (!getTemplate){
            return { errCode: 1, errMsg: 'Get template failed' };
        }else if (getTemplate.errCode != 0) {
            return getTemplate;
        }

        let transporter = nodemailer.createTransport({
            // config mail server
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_SECRET, // generated ethereal user
                pass: process.env.SECRET_PASSWORD, // generated ethereal password
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
            },
        });

        // send mail with defined transport object
        const result = await transporter.sendMail(getTemplate.body);

        return result;
    } catch (err) {
        console.error(err);
        return { errCode: 1, errMsg: 'System Error!' };
    }
}

module.exports = sendMail;