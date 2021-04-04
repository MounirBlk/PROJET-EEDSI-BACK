import fs from 'fs';
import Jimp from 'jimp'
import firebase from 'firebase';
import path from "path";
import { deleteCurrentFolderStorage, uploadFirebaseStorage } from './firebase';
import ProductModel from '../models/ProductModel';
//const Jimp = require('jimp');

/**
 *  Generate les images avec les couleurs de la spécification du produit/composant
 *  @param {string} racinePath 
 *  @param {string} filePath 
 *  @param {string} idProduct 
 *  @param {Array<string>} colors 
 */ 
export const generateAllImagesColors = async (racinePath: string, filePath: string, idProduct: string, imgObj: any, selectionColors: Array<string>, isEdit: boolean = false): Promise<void> => {
    if(!fs.existsSync(racinePath + '/temp/')) fs.mkdirSync(racinePath + '/temp/');//add temp folder
    let destPath: string = racinePath + `/temp/${idProduct}/`;// process.cwd()
    if(!fs.existsSync(destPath)){
        fs.mkdirSync(destPath);//add destPath folder in temp
    }

    let allColors = [//TODO GET COLORS FROM DB
        { selected: "rouge", color: 'red', hue: 0}, 
        { selected: "orange", color: 'red', hue: 25}, 
        { selected: "jaune", color: 'red', hue: 50}, 
        { selected: "chartreuse", color: 'red', hue: 75}, 
        { selected: "vert", color: 'green', hue: 0}, 
        { selected: "turquoise", color: 'green', hue: 25}, 
        { selected: "cyan", color: 'green', hue: 50}, 
        { selected: "outremer", color: 'green', hue: 75}, 
        { selected: "bleu", color: 'blue', hue: 0}, 
        { selected: "violet", color: 'blue', hue: 25}, 
        { selected: "magenta", color: 'blue', hue: 50}, 
        { selected: "carmin", color: 'blue', hue: 75}
    ]

    let tabColorSelected: Array<any> = [] 
    allColors.forEach((item: any) => {
        selectionColors.forEach((el: string) => {
            if(item.selected === el){
                tabColorSelected.push(item)
            }
        })
    });
    await resizeFile(filePath);
    await generateImgs(idProduct, filePath, destPath, tabColorSelected).then(async() => {
        console.log('OK')
        fs.copyFileSync(filePath, destPath + imgObj.imgName);
        if(isEdit){
            await deleteCurrentFolderStorage(idProduct);
        }
        let tabImgLinks: Array<string> = []
        for await (const file of fs.readdirSync(destPath)) {
            tabImgLinks.push(await uploadFirebaseStorage(file, idProduct, destPath))
        }
        await ProductModel.findByIdAndUpdate(idProduct, { tabImgLinks: tabImgLinks }, null, async(err: any, resp: any) => {
            if(err){
                throw err;
            } 
            //fs.existsSync(destPath) ? fs.rmdirSync(path.join(destPath), { recursive: true }) : null;//delete folder img temp
            let contentTemp: any = await getFiles(racinePath + '/temp/');
            cleanTempFolder(racinePath, contentTemp)
        });
    }).catch((err) => {
        throw err;
    })
};

/**
 *  Generate images
 */ 
const generateImgs = async (idProduct: string, filePath: string, destPath: string, tabColorSelected: any): Promise<void> => {
    return new Promise(async(resolve, reject) => {
        await Jimp.read(filePath, async(err: any, resp: any) => {
            if (err) reject(err);
            else{
                tabColorSelected.forEach(async(element: any) => {
                    await resp
                        .resize(400, 350) // resize
                        .quality(60) // set JPEG quality
                        .color([{ apply: element.color, params: [100] }, { apply: 'hue', params: [element.hue] }])
                        .write(destPath + 'img_' + element.selected + '.jpg'); // save
                });
                resolve()
            }
        });
    });
}

/**
 * Recuperation des fichiers d'un dossier promise
 */
const getFiles = (folderPath: string) => {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.log(err);
                reject(err);
            } else
                resolve(files);
        });
    });
};

/**
 * Redimensionne le fichier
 */
const resizeFile = async(filePath: string) => {
    return new Promise(async(resolve, reject) => {
        await Jimp.read(filePath, async(err: any, resp: any) => {
            if(err){
                reject(err);
            }else{
                resolve(await resp
                    .resize(400, 350) // resize
                    .quality(60) // set JPEG quality
                    //.greyscale()
                    .write(filePath)); // save
            }
        });
    });
};

/**
 * Clean le dossier temp
 */
const cleanTempFolder = (racinePath: string, contentTemp: Array<any>) => {
    contentTemp.forEach((element: string) => {
        fs.rmdirSync(path.join(racinePath + '/temp/' + element), { recursive: true })
    });
}