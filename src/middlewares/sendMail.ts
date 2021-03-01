import nodemailer from 'nodemailer';
import ejs from 'ejs';
import Mail from 'nodemailer/lib/mailer';
import path from 'path';

/**
 * SEND MAIL template register
 * @param {string} email 
 * @param {string} name 
 */
export const mailRegister = async (email: string, name: string): Promise<void> => {
    await templateRenderFile(__dirname + '/templates/register.ejs', {
        email: email,
        name: name
    }).then((data: unknown) => {
        let transporter = getTransporterInfos();
        transporter.sendMail({
            from: process.env.GMAIL_EMAIL, // sender address
            to: email, // list of receivers
            subject: "Inscription à la plateforme", // Subject line
            html: String(data)
        }, (error, response) => {
            error ? console.log(error) : null;
            return transporter.close();
        });
    }).catch((error: Error) => {
        console.log(error);
        throw error;
    });
}

/**
 * SEND MAIL template forgot password
 * @param {string} email 
 * @param {string} password 
 */
export const mailforgotPw = async (email: string, password: string): Promise<void> => {
    await templateRenderFile(__dirname + '/templates/forgotPassword.ejs', {
        email: email,
        name: password
    }).then((data: unknown) => {
        let transporter = getTransporterInfos();
        transporter.sendMail({
            from: String(process.env.GMAIL_EMAIL), // sender address
            to: email, // list of receivers
            subject: "Mot de passe oublié", // Subject line
            //text: '',
            html: String(data)
        });
    }).catch((error: Error) => {
        console.log(error);
        throw error;
    });
}

/**
 * INFORMATIONS TRANSPORTER
 */
const getTransporterInfos = (): Mail => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",// (cmd: nslookup smtp.gmail.com)
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: String(process.env.GMAIL_EMAIL), // email
            pass: String(process.env.GMAIL_PWD), // password
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    return transporter;
}

/**
 * RENDER FILE EJS
 */
const templateRenderFile = async(filePath: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        ejs.renderFile(filePath, data, (err, result) => {
            if (err) {
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}