import nodemailer from 'nodemailer';
import ejs from 'ejs';
import Mail from 'nodemailer/lib/mailer';
import path from 'path';
import fs from 'fs';
import mime from "mime-types";

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
 * SEND MAIL template invoice
 * @param {string} email 
 * @param {string} name 
 * @param {string} refID 
 */
export const mailInvoice = async (email: string, name: string, refID: string): Promise<void> => {
    await templateRenderFile(__dirname + '/templates/invoice.ejs', {
        refID: refID,
        name: name
    }).then((data: unknown) => {
        let transporter: Mail = getTransporterInfos();
        //console.log(fs.lstatSync(`${process.cwd()}/tmp/${refID}.pdf`))
        transporter.sendMail({
            from: process.env.GMAIL_EMAIL, // sender address
            to: email, // list of receivers
            subject: "Facture de la commande", // Subject line
            html: String(data),
            attachments: [{
                filename: 'CGV.pdf',
                path: __dirname + '/templates/CGV.pdf',
                cid: 'CGV',
            }, {
                filename: `${refID}.pdf`,
                path: `${process.cwd()}/tmp/${refID}.pdf`,
                cid: 'facture',
            }]
        }, (error, response) => {
            error ? console.log(error) : null;//console.log(response)
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
        password: password
    }).then((data: unknown) => {
        let transporter = getTransporterInfos();
        transporter.sendMail({
            from: String(process.env.GMAIL_EMAIL), // sender address
            to: email, // list of receivers
            subject: "Réinitialisation du mot de passe", // Subject line
            //text: '',
            html: String(data)
        });
    }).catch((error: Error) => {
        console.log(error);
        throw error;
    });
}

/**
 * SEND MAIL template checkmail
 * @param {Object} checkData 
 */
export const mailCheckEmail = async (checkData: any): Promise<void> => {
    await templateRenderFile(__dirname + '/templates/checkMail.ejs', {
        email: checkData.email,
        fullName: checkData.fullName,
        url: checkData.url
    }).then((data: unknown) => {
        let transporter = getTransporterInfos();
        transporter.sendMail({
            from: process.env.GMAIL_EMAIL, // sender address
            to: checkData.email, // list of receivers
            subject: "Vérification de l'email", // Subject line
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