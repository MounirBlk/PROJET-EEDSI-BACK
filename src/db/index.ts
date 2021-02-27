import mongoose from 'mongoose';
import bluebird from 'bluebird';
//const mongoose = require("mongoose")

const mongooseConnect = () => {
    const uri: string = String(process.env.MONGO_URL);

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