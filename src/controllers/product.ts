import { Application, Request, Response, NextFunction, Errback } from 'express';
import { dataResponse, dateFormatEn, dateFormatFr, deleteMapper, emailFormat, exist, existTab, firstLetterMaj, floatFormat, getJwtPayload, isEmptyObject, isValidLength, numberFormat, passwordFormat, randChars, randomNumber, tabFormat, textFormat } from '../middlewares';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import ProductModel from '../models/ProductModel';
import ProductInterface from '../interfaces/ProductInterface';
import Jimp from 'jimp'
import { addProductStripe, deleteProductStripe, updatePriceStripe, updateProductStripe } from '../middlewares/stripe';
import { AxiosError, AxiosResponse } from 'axios';
import firebase from 'firebase';
import { generateAllImagesColors } from '../middlewares/generate';
//const Jimp = require('jimp');

/**
 *  Route new produit
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const addProduct = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const data = req.body;
            if(isEmptyObject(data) || !exist(data.nom) || !exist(data.type) || !exist(data.poids) || !exist(data.longueur) || 
            !exist(data.largeur) || !exist(data.profondeur) || !exist(data.prix) || !exist(data.taxe) || !exist(data.quantite) ||
            !existTab(data.matieres) || !existTab(data.couleurs)){
                return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' });
            }else{
                let isError = exist(data.sousType) ? textFormat(data.sousType) ? false : true : false;
                isError = existTab(data.composants) ? tabFormat(data.composants) ? false : true : false;
                isError = existTab(data.description) ? isValidLength(data.description, 1, 300) ? false : true : false;
                if(isError || !textFormat(data.nom) || !textFormat(data.type) || !numberFormat(data.poids) || !numberFormat(data.longueur) || !numberFormat(data.largeur) || 
                !numberFormat(data.profondeur) || !floatFormat(data.prix) || !floatFormat(data.taxe) || !numberFormat(data.quantite) || !tabFormat(data.matieres) || !tabFormat(data.couleurs)){
                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"});
                }else{
                    if(await ProductModel.countDocuments({ nom: data.nom.trim()}) !== 0){// nom already exist
                        return dataResponse(res, 409, { error: true, message: "Ce produit est déjà enregistré" });
                    }else{
                        let toInsert = {
                            "refID": uuidv4(),// Unique ID
                            "nom": data.nom,
                            "description": data.description !== null && data.description !== undefined ? data.description : null,
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
                            "composants": data.composants !== null && data.composants !== undefined ? data.composants : [],// [composants]
                            "idStripeProduct": null,
                            "idStripePrice": null,
                            "imgLink": null
                        };
                        let imgFile = fs.readFileSync(process.cwd() + '/public/canape.jpg'/*, { encoding: "base64"}*/);//import img from form/data
                        const imgObj = {//import img from form/data
                            imgFile: imgFile,
                            imgName: 'canape.jpg'
                        }
                        //const imgObj = null; //ne pas ajouter d'img
                        await addProductStripe('[PRODUIT] - ' + toInsert.nom, toInsert.description, toInsert.prix, false, 'eur', imgObj).then(async(resp: any) => {// ajout du produit sur stripe
                            toInsert.idStripeProduct = !resp.hasOwnProperty('idStripeProduct') || !exist(resp.idStripeProduct) ? null : resp.idStripeProduct;
                            toInsert.idStripePrice = !resp.hasOwnProperty('idStripePrice') || !exist(resp.idStripePrice) ? null : resp.idStripePrice;
                            toInsert.imgLink = !resp.hasOwnProperty('imgLink') || !exist(resp.imgLink) ? null : resp.imgLink;
                            let product: ProductInterface = new ProductModel(toInsert);
                            await product.save().then(async(produit: ProductInterface) => {
                                await generateAllImagesColors(process.cwd() + '/public/canape.jpg' , produit.get("_id"), data.couleurs)
                                return dataResponse(res, 201, { error: false, message: "Le produit a bien été créé avec succès" });
                            }).catch(() => {
                                return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                            });
                        }).catch((err: AxiosError) => {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête pour l'ajout du produit !" });
                        });
                    }
                }
            }
        }
    });
}


/**
 *  Route delete/archive product
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const deleteProduct = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isValidLength(id, 24, 24) || !textFormat(id) || await ProductModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    await ProductModel.findOne({ _id: id }, async(err: Error, results: ProductInterface) => {
                        let ttPromise: Array<any> = []
                        ttPromise.push(await updatePriceStripe(results.idStripePrice, true));
                        ttPromise.push(await updateProductStripe(results.idStripeProduct,'[PRODUIT] - ' + results.nom, results.description, true));
                        //ttPromise.push(await deleteProductStripe(results.idStripeProduct));
                        ttPromise.push(await ProductModel.findOneAndDelete({ _id : id })); 
                        Promise.all(ttPromise).then((data) => {
                            return dataResponse(res, 200, { error: false, message: 'Le produit a été supprimé avec succès' })
                        }).catch((err) => {
                            throw err;
                        })
                    });
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route get one product
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getProduct = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isValidLength(id, 24, 24) || !textFormat(id) || await ProductModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    await ProductModel.findOne({ _id: id }, (err: Error, results: Response) => {
                        if (err) {
                            return dataResponse(res, 500, {
                                error: true,
                                message: "Erreur dans la requête !"
                            });
                        }else if (results === undefined || results === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        } else {
                            if (results) {
                                return dataResponse(res, 200, {
                                    error: false,
                                    message: "Les informations du produit ont bien été récupéré",
                                    product: deleteMapper(results) 
                                });
                            } else {
                                return dataResponse(res, 401, {
                                    error: true,
                                    message: "La requête en base de donnée n'a pas fonctionné"
                                });
                            }
                        }
                    });
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route get all products
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllProducts = async (req: Request, res: Response) : Promise <void> => {
        await getJwtPayload(req.headers.authorization).then(async (payload) => {
            if(payload === null || payload === undefined){
                return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
            }else{
                await ProductModel.find({}, (err: Error, results: any) => {
                    if (err) {
                        return dataResponse(res, 500, {
                            error: true,
                            message: "Erreur dans la requête !"
                        });
                    }else if (results === undefined || results === null){// Si le resultat n'existe pas
                        return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                    } else {
                        if (results) {
                            return dataResponse(res, 200, {
                                error: false,
                                message: "Les produits ont bien été récupéré",
                                products: results.map((item: ProductInterface) => deleteMapper(item, 'getAllProducts'))
                            });
                        } else {
                            return dataResponse(res, 401, {
                                error: true,
                                message: "La requête en base de donnée n'a pas fonctionné"
                            });
                        }
                    }
                });
            }
        }).catch((error) => {
            throw error;
        });
}

/**
 *  Route update product
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            const data = req.body;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isValidLength(id, 24, 24) || await ProductModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    const product: ProductInterface | null = await ProductModel.findById(id);
                    if(product === null || product === undefined){
                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !"})
                    }else{
                        let isOnError: boolean = false;
                        let toUpdate: any = {
                            "nom": exist(data.nom) ? textFormat(data.nom) ? data.nom : (isOnError = true) : product.nom,
                            "description": exist(data.description) ? isValidLength(data.description, 1, 300) ? data.description : (isOnError = true) : product.description,
                            "type": exist(data.type) ? textFormat(data.type) ? firstLetterMaj(data.type) : (isOnError = true) : product.type,
                            "sousType": exist(data.sousType) ? textFormat(data.sousType) ? firstLetterMaj(data.sousType) : (isOnError = true) : product.sousType,
                            "matieres": existTab(data.matieres) ? tabFormat(data.matieres) ? data.matieres.map((el: string) => firstLetterMaj(el)) : (isOnError = true) : product.matieres,
                            "couleurs": existTab(data.couleurs) ? tabFormat(data.couleurs) ? data.couleurs.map((el: string) => firstLetterMaj(el)) : (isOnError = true) : product.couleurs,
                            "poids":  exist(data.poids) ? numberFormat(data.poids) ? data.poids : (isOnError = true) : product.poids,
                            "longueur": exist(data.longueur) ? numberFormat(data.longueur) ? data.longueur : (isOnError = true) : product.longueur,
                            "largeur": exist(data.largeur) ? numberFormat(data.largeur) ? data.largeur : (isOnError = true) : product.largeur,
                            "profondeur": exist(data.profondeur) ? numberFormat(data.profondeur) ? data.profondeur : (isOnError = true) : product.profondeur,
                            "prix": exist(data.prix) ? floatFormat(data.prix) ? data.prix : (isOnError = true) : product.prix,
                            "taxe": exist(data.taxe) ? floatFormat(data.taxe) ? data.taxe : (isOnError = true) : product.taxe,
                            "quantite": exist(data.quantite) ? numberFormat(data.quantite) ? data.quantite : (isOnError = true) : product.quantite,
                            "composants": existTab(data.composants) ? tabFormat(data.composants) ? data.composants : (isOnError = true) : product.composants,
                        }
                        if(isOnError){
                            return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                        }else{
                            let imgFile = fs.readFileSync(process.cwd() + '/public/canape.jpg'/*, { encoding: "base64"}*/);//import img from form/data
                            /*const imgObj = {//import img from form/data
                                imgFile: imgFile,
                                imgName: 'canape.jpg'
                            }*/
                            const imgObj = null; //ne pas update l'img
                            await updateProductStripe(product.idStripeProduct, '[PRODUIT] - ' + toUpdate.nom, toUpdate.description, false, imgObj).then(async(resp: any) => {// update produit stripe
                                toUpdate.imgLink = !resp.hasOwnProperty('imgLink') || !exist(resp.imgLink) ? product.imgLink : resp.imgLink;
                                await ProductModel.findByIdAndUpdate(id, toUpdate, null, async(err: Error, resp: any) => {
                                    if (err) {
                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                                    } else {
                                        await generateAllImagesColors(process.cwd() + '/public/canape.jpg' , product.get("_id"), data.couleurs)
                                        return dataResponse(res, 200, { error: false, message: "Le produit a bien été mise à jour" })
                                    }
                                });
                            });
                        }
                    }
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}