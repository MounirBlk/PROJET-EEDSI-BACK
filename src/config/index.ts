
import express, { Application, Request, Response, NextFunction, Errback } from 'express';
import fs from "fs";
import fileUpload from "express-fileupload";

/**
 *  INIT EXPRESS-UPLOAD
 */ 
export const initUpload = async(app: Application) => {
    console.log('Upload OK !')
    if(!fs.existsSync(process.cwd() + '/temp/')){//INIT TEMP FOLDER
        fs.mkdirSync(process.cwd() + '/temp/')
    }
    app.use(fileUpload({
        useTempFiles : true,
        tempFileDir : process.cwd() + '/temp/',
        limits: { fileSize: 50 * 1024 * 1024 },
    }));
}