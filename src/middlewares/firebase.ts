import fs from 'fs';
import Jimp from 'jimp'
import admin from 'firebase-admin';
import path from "path";
//import firebase from 'firebase';
//import { Storage } from "@google-cloud/storage";
import mime from "mime-types";
import { serviceAccountKey } from '../config';

const FirebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey()),
    databaseURL: String(process.env.FIREBASE_DATABASE_URL),
});
const bucket = FirebaseApp.storage().bucket(process.env.FIREBASE_BUCKET);

/**
 * Upload file to Firebase STORAGE
 */ 
export const uploadFirebaseStorage = async(file: any, idProduct: string, pathFolderImg: string): Promise<string> => {
    return new Promise(async(resolve, reject) => {
            let localFilePath = `${pathFolderImg}${file}`;
            bucket.upload(localFilePath, {
                destination: `${idProduct}/${file}`,
                public: true,
                predefinedAcl: 'publicRead',
                metadata: { contentType: mime.lookup(localFilePath), cacheControl: "public, max-age=300" }
            }, (err, resp) => {
                if (err) {                   
                    console.log(err);
                    reject(err)
                }
                resolve(`http://storage.googleapis.com/${bucket.name}/${idProduct}/${encodeURIComponent(file)}`) ;
            });
    });
}

/**
 * DELETE FOLDER Firebase STORAGE
 */ 
export const deleteCurrentFolderStorage = async(idProduct: string): Promise<void> => {
    return new Promise(async(resolve, reject) => {
        bucket.deleteFiles({
            prefix: `${idProduct}/`
        }, (err) => {
            if (err) {
                console.log(err);
                reject(err)
            } else {
                resolve()
            }
        });     
    });
}