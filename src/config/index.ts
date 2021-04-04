
import express, { Application, Request, Response, NextFunction, Errback } from 'express';
import fs from "fs";
import multer from "multer";

/**
 *  INIT MULTER
 */ 
export const initUpload = (): any => {
    return { 
        storage: multer.diskStorage({        
            destination: (req, file, next) => { //specify destination
                if(!fs.existsSync(process.cwd() + '/temp/')){
                    fs.mkdirSync(process.cwd() + '/temp/')
                }
                next(null, process.cwd() + '/temp/');
            },
            filename: (req, file, next) => { //specify the filename to be unique
                next(null, file.originalname);
            }
        }),//multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
        },
        /*fileFilter: (req: any, file: any, next: any) => { // filter out and prevent non-image files.
            next(null, true);
        }*/
    };
}

/**
 *  FIREBASE serviceAccountKey
 */ 
export const serviceAccountKey = (): any => {
    return { 
        "type": "service_account",
        "project_id": String(process.env.FIREBASE_PROJECT_ID).trim(),
        "private_key_id": String(process.env.FIREBASE_PRIVATE_KEY_ID).trim(),
        "private_key": String(process.env.FIREBASE_PRIVATE_KEY).trim().replace(/\\n/g, '\n'),
        "client_email": String(process.env.FIREBASE_CLIENT_EMAIL).trim(),
        "client_id": String(process.env.FIREBASE_CLIENT_ID).trim(),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": String(process.env.FIREBASE_CLIENT_CERT_URL).trim()
    };
}