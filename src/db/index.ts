import mongoose from 'mongoose';
import bluebird from 'bluebird';
import fs from 'fs';
import { Application } from 'express';
//const mongoose = require("mongoose")

const mongooseConnect = async(app: Application) => {
    //const uri: string = String(process.env.ENV).trim() === "PROD" || String(process.env.ENV).trim() === "DEV" || String(process.env.ENV).trim() === "TEST" ? String(process.env.MONGO_URL) : String(process.env.MONGO_URL_LOCAL);// ENV: PROD / DEV / TEST
    const uri: string = String(process.env.MONGO_URL);
    //Perform promise in node
    mongoose.Promise = bluebird;

    //connect to mangodb
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }).then(() => { 
        console.log("MongoDB OK !");
        app.listen(app.get("port"), () => {
            console.log(`App is running on http://localhost:${app.get("port")}/ in ${String(process.env.ENV).trim() || 'DEV'} mode`);
        });
    }).catch((err: Error) => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    });
}

export default mongooseConnect;