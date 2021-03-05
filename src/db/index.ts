import mongoose from 'mongoose';
import bluebird from 'bluebird';
//const mongoose = require("mongoose")

const mongooseConnect = () => {
    const uri: string = process.env.ENV === "PROD" || process.env.ENV === "DEV" ? String(process.env.MONGO_URL) : String(process.env.MONGO_URL_LOCAL);// ENV: PROD / DEV / TEST

    //Perform promise in node
    mongoose.Promise = bluebird;

    //connect to mangodb
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }).then(() => { 
        console.log("Connected !");
    }).catch((err: Error) => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    });
}

export default mongooseConnect;