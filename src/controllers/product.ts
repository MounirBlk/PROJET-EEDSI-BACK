import { Application, Request, Response, NextFunction, Errback } from 'express';
import { dataResponse, dateFormatEn, dateFormatFr, deleteMapper, emailFormat, exist, existTab, firstLetterMaj, floatFormat, getJwtPayload, isEmptyObject, isValidLength, numberFormat, passwordFormat, randChars, randomNumber, tabFormat, textFormat } from '../middlewares';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import ProductModel from '../models/ProductModel';
import ProductInterface from '../interfaces/ProductInterface';
import Jimp from 'jimp'
//const Jimp = require('jimp');

/**
 *  Route new produit
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const addProduct = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 498, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const data = req.body;
            if(isEmptyObject(data) || !exist(data.nom) || !exist(data.type) || !exist(data.poids) || !exist(data.longueur) || 
            !exist(data.largeur) || !exist(data.profondeur) || !exist(data.prix) || !exist(data.taxe) || !exist(data.quantite) ||
            !existTab(data.matieres) || !existTab(data.couleurs)){
                return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' });
            }else{
                let isError = exist(data.sousType) ? textFormat(data.sousType) ? false : true : false;
                isError = existTab(data.composants) ? tabFormat(data.composants) ? false : true : false;
                if(isError || !textFormat(data.nom) || !textFormat(data.type) || !numberFormat(data.poids) || !numberFormat(data.longueur) || !numberFormat(data.largeur) || 
                !numberFormat(data.profondeur) || !floatFormat(data.prix) || !floatFormat(data.taxe) || !numberFormat(data.quantite) || !tabFormat(data.matieres) || !tabFormat(data.couleurs)){
                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"});
                }else{
                    let toInsert = {
                        "refID": uuidv4(),// Unique ID
                        "nom": firstLetterMaj(data.nom),
                        "type": firstLetterMaj(data.type),
                        "sousType": data.sousType !== null && data.sousType !== undefined ? firstLetterMaj(data.sousType) : null,
                        "matieres": data.matieres.map((el: string) => firstLetterMaj(el)),// [matieres]
                        "couleurs": data.couleurs.map((color: string) => firstLetterMaj(color)),// [colors]
                        "poids": data.poids, // gramme
                        "longueur": data.longueur,// centimetre
                        "largeur": data.largeur,// centimetre
                        "profondeur": data.profondeur,// centimetre
                        "prix": data.prix,// xx.xx (€)
                        "taxe": data.taxe,// x.xx (1 = 100%)
                        "quantite": data.quantite,// xxx
                        "composants": data.composants !== null && data.composants !== undefined ? data.composants : []// [composants]
                    };
                    let product: ProductInterface = new ProductModel(toInsert);
                    await product.save().then(async(product: ProductInterface) => {
                        await generateAllImagesColors(process.cwd() + '/public/canape.jpg' , product.get("_id"), data.couleurs);
                        return dataResponse(res, 201, { error: false, message: "Le produit a bien été créé avec succès" });
                    }).catch(() => {
                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                    });
                }
            }
        }
    });
}

/**
 *  Generate les images avec les couleurs de la spécification du produit
 *  @param {string} filePath 
 *  @param {string} idProduct 
 *  @param {Array<string>} colors 
 */ 
const generateAllImagesColors = async (filePath: string, idProduct: string, selectionColors: Array<string>): Promise<void> => {
    if(!fs.existsSync('./temp/')) fs.mkdirSync('./temp/');//add temp folder
    let destPath: string = process.cwd() + `/temp/${idProduct}/`;// process.cwd()
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
    let ttPromise: Array<any> = []
    tabColorSelected.forEach(async(element) => {
        ttPromise.push(await generateImg(filePath, destPath, element))
    });
    Promise.all(ttPromise).then((data) => {
        console.log('OK')
        //fs.existsSync(pathDest) ? fs.rmdirSync(pathDest, { recursive: true }) : null;//delete folder temp
    }).catch((err) => {
        throw err
    })
};

/**
 *  Generate image
 */ 
const generateImg = async (filePath: string, destPath: string, element: any): Promise<void> => {
    return new Promise(async(resolve, reject) => {
        await Jimp.read(filePath, async(err: any, resp: any) => {
            if (err) reject(err);
            else{
                resolve(await resp
                    .resize(400, 350) // resize
                    .quality(60) // set JPEG quality
                    .color([{ apply: element.color, params: [100] }, { apply: 'hue', params: [element.hue] }])
                    .write(destPath + 'product-' + element.selected + '.jpg')); // save
            }
        });
    });
}