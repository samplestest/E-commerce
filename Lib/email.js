const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { result } = require("@hapi/joi/lib/base");

const CLIENT_ID = '567102389294-j6qo3407f2vj5jcla3dt3pi0h9t5u8va.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
// const REFRESH_TOKEN = '1//04k1_zyZwFZ6gCgYIARAAGAQSNwF-L9IrIu9Y9gDz7B-hs8LKl8DngFLHOpTmoovZ4WmoXeuG2OpmT1b9s7Vr_zjALw3VysiOTFg';
const REFRESH_TOKEN = '1//04_83wjwp9ThDCgYIARAAGAQSNwF-L9IraPPWETKsHXLXiwawbwW722vr0QO-fS-X10eTfbO5tcxesJPuu8pUoC_pEwVmhqPhDkI';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

exports.sendMail = async function (email, subject, content, attachment) {
    try {
        const accessToken = await oAuth2Client.getAccessToken()

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'darshini.surbhiinfotech@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: 'darshini.surbhiinfotech@gmail.com',
            to: email,
            subject: subject,
            text: 'Sending Gmail',
            html: content,
        };

        if (attachment)
            mailOptions.attachment = attachment

        const result = await transport.sendMail(mailOptions)
        return result;
    } catch (error) {
        return error
    }
}



