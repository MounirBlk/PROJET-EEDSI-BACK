import { Application, Request, Response, NextFunction, Errback } from 'express';
import { dataResponse, dateFormatEn, dateFormatFr, deleteMapper, emailFormat, exist, existTab, firstLetterMaj, floatFormat, getJwtPayload, isEmptyObject, isObjectIdValid, isValidLength, numberFormat, passwordFormat, randChars, randomNumber, setFormDataTab, tabFormat, textFormat } from '../middlewares';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import ComposantModel from '../models/ComposantModel';
import ComposantInterface from '../interfaces/ComposantInterface';
import { addProductStripe, deleteProductStripe, updatePriceStripe, updateProductStripe } from '../middlewares/stripe';
import { AxiosError, AxiosResponse } from 'axios';
import firebase from 'firebase';
import { generateAllImagesColors } from '../middlewares/generate';
import { deleteCurrentFolderStorage } from '../middlewares/firebase';
import ProductSelectedModel from '../models/ProductSelectedModel';
import ProduitSelectedInterface from '../interfaces/ProductSelectedInterface';
import ComposantSelectedInterface from '../interfaces/ComposantSelectedInterface';
import { CallbackError } from 'mongoose';

/**
 *  Route new composant
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const addComposant = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            let data = req.body;      
            if(String(process.env.ENV).trim().toLowerCase() !== "test") data = setFormDataTab(data);
            if(isEmptyObject(data) || !exist(data.nom) || !exist(data.type) || !exist(data.poids) || !exist(data.longueur) || 
            !exist(data.largeur) || !exist(data.profondeur) || !exist(data.prix) || !exist(data.quantite) ||
            !existTab(data.matieres) || !existTab(data.couleurs)){
                return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' });
            }else{
                let isError = existTab(data.description) ? isValidLength(data.description, 1, 300) ? false : true : false;
                if(isError || !textFormat(data.nom) || !textFormat(data.type) || !numberFormat(data.poids) || !numberFormat(data.longueur) || !numberFormat(data.largeur) || 
                !numberFormat(data.profondeur) || !floatFormat(data.prix) || !numberFormat(data.quantite) || !tabFormat(data.matieres) || !tabFormat(data.couleurs)){
                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"});
                }else{
                    if(await ComposantModel.countDocuments({ nom: data.nom.trim()}) !== 0){// nom already exist
                        return dataResponse(res, 409, { error: true, message: "Ce composant est déjà enregistré" });
                    }else{
                        let toInsert = {
                            "refID": uuidv4(),// Unique ID
                            "nom": data.nom,
                            "description": data.description !== null && data.description !== undefined ? data.description : null,
                            "type": firstLetterMaj(data.type),
                            "matieres": data.matieres.map((el: string) => firstLetterMaj(el)),// [matieres]
                            "couleurs": data.couleurs,// [colors]
                            "poids": data.poids, // gramme
                            "longueur": data.longueur,// centimetre
                            "largeur": data.largeur,// centimetre
                            "profondeur": data.profondeur,// centimetre
                            "prix": parseFloat(data.prix).toFixed(2),// xx.xx (€)
                            "quantite": data.quantite < 1 ? 1 : data.quantite,// xxx
                            "idStripeProduct": null,
                            "idStripePrice": null,
                            "imgLink": null
                        };
                        let imgObj: any = null;
                        if (!req.files || Object.keys(req.files).length === 0) {
                            imgObj = null;
                        }else{
                            let files: any = req.files;
                            let imgFile = fs.readFileSync(process.cwd() + '/temp/' + files[0].originalname/*, { encoding: "base64"}*/);//import img from form/data
                            imgObj = {//import img from form/data
                                imgFile: imgFile,
                                imgName: files[0].originalname
                            }
                        }
                        await addProductStripe('[COMPOSANT] - ' + toInsert.nom, toInsert.description, parseFloat(toInsert.prix), false, 'eur', imgObj).then(async(resp: any) => {// ajout du composant sur stripe
                            toInsert.idStripeProduct = !resp.hasOwnProperty('idStripeProduct') || !exist(resp.idStripeProduct) ? null : resp.idStripeProduct;
                            toInsert.idStripePrice = !resp.hasOwnProperty('idStripePrice') || !exist(resp.idStripePrice) ? null : resp.idStripePrice;
                            toInsert.imgLink = !resp.hasOwnProperty('imgLink') || !exist(resp.imgLink) ? null : resp.imgLink;
                            let composant: ComposantInterface = new ComposantModel(toInsert);
                            await composant.save().then(async(respComp: ComposantInterface) => {
                                if(imgObj !== null && imgObj !== undefined){
                                    await generateAllImagesColors(process.cwd(), process.cwd() + '/temp/' + imgObj.imgName, respComp.get("_id"), imgObj, data.couleurs, false)
                                }
                                return dataResponse(res, 201, { error: false, message: "Le composant a bien été créé avec succès" });
                            }).catch(() => {
                                return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                            });
                        }).catch((err: AxiosError) => {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête pour l'ajout du composant !" });
                        });
                    }
                }
            }
        }
    });
}

/**
 *  Route delete/archive composant
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const deleteComposant = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await ComposantModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    /*let isCommande: boolean = false;//TODO
                    if(isCommande){
                        return dataResponse(res, 400, { error: true, message: "Erreur, une commande est en cours !" });
                    }*/
                    await ComposantModel.findOne({ _id: id }, async(err: Error, results: ComposantInterface) => {
                        let ttPromise: Array<any> = []
                        ttPromise.push(await updatePriceStripe(results.idStripePrice, true));
                        ttPromise.push(await updateProductStripe(results.idStripeProduct, '[COMPOSANT] - ' +  results.nom, results.description, true));
                        ttPromise.push(await ComposantModel.findOneAndUpdate({ _id : id }, { archive: true }));
                        ttPromise.push(await deleteCurrentFolderStorage(id));
                        Promise.all(ttPromise).then((data) => {
                            return dataResponse(res, 200, { error: false, message: 'Le composant a été supprimé avec succès' })
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
 *  Route get one composant
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getComposant = async (req: Request, res: Response) : Promise <void> => {
    const id = req.params.id;
    if(!exist(id)){
        return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
    }else{
        if(!isObjectIdValid(id) || await ComposantModel.countDocuments({ _id: id}) === 0){
            return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
        }else{
            await ComposantModel.findOne({ _id: id }, (err: Error, results: Response) => {
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
                            message: "Les informations du composant ont bien été récupéré",
                            composant: deleteMapper(results) 
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

/**
 *  Route get all composants
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllComposants = async (req: Request, res: Response) : Promise <void> => {
    await ComposantModel.find({}, (err: Error, results: any) => {
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
                    message: "Les composants ont bien été récupéré",
                    composants: results.map((item: ComposantInterface) => deleteMapper(item, 'getAllComposants'))
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

/**
 *  Route update composant
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const updateComposant = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            let data = req.body;      
            if(String(process.env.ENV).trim().toLowerCase() !== "test") data = setFormDataTab(data);
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await ComposantModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    const composant: ComposantInterface | null = await ComposantModel.findById(id);
                    if(composant === null || composant === undefined){
                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !"})
                    }else{
                        let isOnError: boolean = false;
                        let toUpdate: any = {
                            "nom": exist(data.nom) ? textFormat(data.nom) ? data.nom : (isOnError = true) : composant.nom,
                            "description": exist(data.description) ? isValidLength(data.description, 1, 300) ? data.description : (isOnError = true) : composant.description,
                            "type": exist(data.type) ? textFormat(data.type) ? firstLetterMaj(data.type) : (isOnError = true) : composant.type,
                            "matieres": existTab(data.matieres) ? tabFormat(data.matieres) ? data.matieres.map((el: string) => firstLetterMaj(el)) : (isOnError = true) : composant.matieres,
                            "couleurs": existTab(data.couleurs) ? tabFormat(data.couleurs) ? data.couleurs : (isOnError = true) : composant.couleurs,
                            "poids":  exist(data.poids) ? numberFormat(data.poids) ? data.poids : (isOnError = true) : composant.poids,
                            "longueur": exist(data.longueur) ? numberFormat(data.longueur) ? data.longueur : (isOnError = true) : composant.longueur,
                            "largeur": exist(data.largeur) ? numberFormat(data.largeur) ? data.largeur : (isOnError = true) : composant.largeur,
                            "profondeur": exist(data.profondeur) ? numberFormat(data.profondeur) ? data.profondeur : (isOnError = true) : composant.profondeur,
                            "prix": exist(data.prix) ? floatFormat(data.prix) ? parseFloat(data.prix).toFixed(2) : (isOnError = true) : composant.prix,
                            "quantite": exist(data.quantite) ? numberFormat(data.quantite) ? data.quantite > 0 ? data.quantite : 1 : (isOnError = true) : composant.quantite
                        }
                        if(isOnError){
                            return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                        }else{
                            let imgObj: any = null;
                            if (!req.files || Object.keys(req.files).length === 0) {
                                imgObj = null;
                            }else{
                                let files: any = req.files;
                                let imgFile = fs.readFileSync(process.cwd() + '/temp/' + files[0].originalname/*, { encoding: "base64"}*/);//import img from form/data
                                imgObj = {//import img from form/data
                                    imgFile: imgFile,
                                    imgName: files[0].originalname
                                }
                            }
                            await updateProductStripe(composant.idStripeProduct, '[COMPOSANT] - ' + toUpdate.nom, toUpdate.description, false, imgObj).then(async(resp: any) => {// update composant stripe
                                toUpdate.imgLink = !resp.hasOwnProperty('imgLink') || !exist(resp.imgLink) ? composant.imgLink : resp.imgLink;
                                await ComposantModel.findByIdAndUpdate(id, toUpdate, null, async(err: Error, resp: any) => {
                                    if (err) {
                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                                    } else {
                                        if(imgObj !== null && imgObj !== undefined){
                                            await generateAllImagesColors(process.cwd(), process.cwd() + '/temp/' + imgObj.imgName, composant.get("_id"), imgObj, data.couleurs, true)
                                        }
                                        return dataResponse(res, 200, { error: false, message: "Le composant a bien été mise à jour" })
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

