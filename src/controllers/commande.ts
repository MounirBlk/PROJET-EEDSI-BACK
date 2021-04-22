import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { dataResponse, dateHourMinuFormatEn, deleteMapper, exist, existTab, firstLetterMaj, getJwtPayload, isEmptyObject, isObjectIdValid, isValidLength, numberFormat, renameKey, tabFormat, textFormat } from '../middlewares';
import { Application, Request, Response, NextFunction, Errback } from 'express';
import { CallbackError, FilterQuery, Schema } from 'mongoose';
import UserModel from '../models/UserModel';
import UserInterface from '../interfaces/UserInterface';
import CommandeInterface from '../interfaces/CommandeInterface';
import CommandeModel from '../models/CommandeModel';
import ProductSelectedModel from '../models/ProductSelectedModel';
import ProduitSelectedInterface from '../interfaces/ProductSelectedInterface';
import { roleTypes } from '../types/roleTypes';
import { statutCommandeTypes } from '../types/statutCommandeTypes';
import { getInvoiceData, generateInvoice } from '../middlewares/invoice';
import { mailInvoice } from '../middlewares/sendMail';
import { uploadFirebaseStorage } from '../middlewares/firebase';
import PanierModel from '../models/PanierModel';

/**
 *  Route new commande
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const addCommande = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const data = req.body;
            if(isEmptyObject(data) || !exist(data.dateLivraison) || !exist(data.adresseLivraison)){
                return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
            }else{
                if(!dateHourMinuFormatEn(data.dateLivraison) || !isValidLength(data.adresseLivraison, 1, 100)){
                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                }else if(new Date(data.dateLivraison).getTime() < new Date().getTime() + (7 * 24 * 60 * 60000)){// 7 jours d'écart minimum
                    return dataResponse(res, 400, { error: true, message: "La date de livraison est indisponible (7 jours d'écart minimum)" }) 
                }else{
                    UserModel.findOne({ _id: payload.id }).populate('idEntreprise').populate('idPanier').exec(async(err: CallbackError, user: any) => {
                        if (err) {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                        }else if (user === undefined || user === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        } else {
                            if (user) {
                                ProductSelectedModel.find({ '_id': { $in: user.idPanier.articles }}).populate('idProduct').populate('listeComposantsSelected.idComposant').exec(async(err: CallbackError, articles: any) => {
                                    if (err) {
                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                                    }else if (articles === undefined || articles === null){// Si le resultat n'existe pas
                                        return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                                    } else {
                                        if (articles) {
                                            let prixTotal: number = 0;
                                            articles.forEach((article: any) => {
                                                prixTotal = prixTotal + parseInt(article.quantite) * parseFloat(article.idProduct.prix);
                                                article.listeComposantsSelected.forEach((composant: any) => {
                                                    prixTotal = prixTotal + (parseInt(article.quantite) * (parseInt(composant.quantite) * parseFloat(composant.idComposant.prix)));
                                                });
                                            });
                                            prixTotal = prixTotal + 10 + (prixTotal * 0.05) //Frais de livraison de 10 € + 5% du total (taxe/impôt)
                                            let toInsert = {
                                                "refID": uuidv4(),
                                                "clientID": payload.id,
                                                "livreurID": null,
                                                "dateLivraison": data.dateLivraison, // YYYY-MM-DD hh:mm
                                                "adresseLivraison": data.adresseLivraison,
                                                "statut": "Attente",
                                                "articles": articles,
                                                "prixTotal": prixTotal.toFixed(2)
                                            }
                                            let commande: CommandeInterface = new CommandeModel(toInsert);
                                            await commande.save().then(async(commandeSaved: CommandeInterface) => {
                                                CommandeModel.findOne({ _id: commandeSaved.get('_id')}).populate('clientID').populate('livreurID').populate('articles.idProduct').populate('articles.listeComposantsSelected.idComposant').exec(async(err: CallbackError, data: any) => {
                                                    if (err) {
                                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                                                    }else if (data === undefined || data === null){// Si le resultat n'existe pas
                                                        return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                                                    }else{
                                                        await PanierModel.findByIdAndUpdate(user.idPanier, { articles: [] });
                                                        if(String(process.env.ENV).trim().toLowerCase() !== "test"){
                                                            await generateInvoice(getInvoiceData(data), data.refID);// TO FIX INVOICE BUG ATTACHMENT MAIL
                                                            //await uploadFirebaseStorage();
                                                            await mailInvoice(data.clientID.email, `${data.clientID.firstname} ${data.clientID.lastname}`, data.refID);
                                                            //TODO UPDATE QUANTITE DU PRODUIT/COMPOSANT AND PAYMENT CARD/CUSTOMER STRIPE AND GENERATE INVOICE AND STORE TO FIREBASE AND SEND MAIL CLIENT INVOICE
                                                        }
                                                        return dataResponse(res, 201, { error: false, message: "La commande a bien été ajouté" });
                                                    }
                                                });
                                            }).catch((err: any) => {
                                                throw err;
                                            });
                                        }
                                    }
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
 *  Route delete commande
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const deleteCommande = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await CommandeModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    await CommandeModel.findOne({ _id: id }, async(err: Error, results: CommandeInterface) => {
                        if (err) {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                        }else if (results === undefined || results === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        } else {
                            if (results) {
                                await CommandeModel.findOneAndDelete({ _id : id });
                                //TODO SEND MAIL TO INFORM CLIENT/LIVREUR IF NEEDED
                                return dataResponse(res, 200, { error: false, message: 'La commande a été supprimé avec succès' })
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
 *  Route get one commande
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getCommande = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await CommandeModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    CommandeModel.findOne({ _id: id }).populate('clientID').populate('livreurID').populate('articles.idProduct').populate('articles.listeComposantsSelected.idComposant').exec(async(err: CallbackError, commande: any) => {
                        if (err) {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                        }else if (commande === undefined || commande === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        }else{
                            if(commande){
                                commande.articles.forEach((article: any) => {
                                    article.idProduct = article.idProduct !== null && article.idProduct !== undefined ? deleteMapper(article.idProduct) : article.idProduct;
                                    article.listeComposantsSelected.forEach((el: any) => {
                                        el.idComposant = el.idComposant !== null && el.idComposant !== undefined ? el.idComposant = deleteMapper(el.idComposant) : el.idComposant
                                    });
                                    article = article !== null && article !== undefined ? deleteMapper(article) : article;
                                })
                                commande.clientID = commande.clientID !== null && commande.clientID !== undefined ? deleteMapper(commande.clientID) : commande.clientID;
                                commande.livreurID = commande.livreurID !== null && commande.livreurID !== undefined ? deleteMapper(commande.livreurID) : commande.livreurID;
                                return dataResponse(res, 200, {
                                    error: false,
                                    message: "Les informations ont bien été récupéré",
                                    commande: deleteMapper(commande),
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
 *  Route all commandes par le statut
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllCommandesByStatut = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const statut: statutCommandeTypes = <statutCommandeTypes>firstLetterMaj(req.params.statut);
            if(!exist(statut)){
                return dataResponse(res, 400, { error: true, message: "Le statut est manquant !" })
            }else{
                if(!textFormat(statut) || (statut.trim().toLowerCase() !== "attente" && statut.trim().toLowerCase() !== "livraison" 
                && statut.trim().toLowerCase() !== "signalement" && statut.trim().toLowerCase() !== "termine" && statut.trim().toLowerCase() !== "all")){
                    return dataResponse(res, 409, { error: true, message: "Le statut n'est pas valide !" })
                }else{
                    const filterFind: FilterQuery<CommandeInterface> = statut.trim().toLowerCase() === "all" ? { } : { statut: statut };
                    CommandeModel.find(filterFind).populate('clientID').populate('livreurID').populate('articles.idProduct').populate('articles.listeComposantsSelected.idComposant').exec(async(err: CallbackError, commandes: any[]) => {
                        if (err) {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                        }else if (commandes === undefined || commandes === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        }else{
                            if(commandes){
                                if(commandes.length > 0){
                                    commandes.forEach((commande: any) => {
                                        commande.articles.forEach((article: any) => {
                                            article.idProduct = article.idProduct !== null && article.idProduct !== undefined ? deleteMapper(article.idProduct) : article.idProduct;
                                            article.listeComposantsSelected.forEach((el: any) => {
                                                el.idComposant = el.idComposant !== null && el.idComposant !== undefined ? el.idComposant = deleteMapper(el.idComposant) : el.idComposant
                                            });
                                            article = article !== null && article !== undefined ? deleteMapper(article) : article;
                                        })
                                        commande.clientID = commande.clientID !== null && commande.clientID !== undefined ? deleteMapper(commande.clientID) : commande.clientID;
                                        commande.livreurID = commande.livreurID !== null && commande.livreurID !== undefined ? deleteMapper(commande.livreurID) : commande.livreurID;
                                    });
                                }
                                return dataResponse(res, 200, {
                                    error: false,
                                    message: `Les commandes liées en mode ${statut.trim().toLowerCase()} ont bien été récupéré`,
                                    commandes: commandes.map((item: any) => deleteMapper(item)),
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
 *  Route get all commandes from user /commande/user/:role/:id
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllCommandesByUser = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id: string = req.params.id;
            const role: roleTypes = <roleTypes>firstLetterMaj(req.params.role);
            if(!exist(id) || !exist(role)){
                return dataResponse(res, 400, { error: true, message: "L'id ou le role est manquant !" })
            }else{
                if(role.trim().toLowerCase() !== 'livreur' && role.trim().toLowerCase() !== 'client' && role.trim().toLowerCase() !== 'prospect'){
                    return dataResponse(res, 409, { error: true, message: "Le role n'est pas valide !" })
                }else if(!isObjectIdValid(id)){// condition doit etre teste avant la vérification en base
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else if(await UserModel.countDocuments({ $and: [{ _id: id }, { role: role }] } ) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    const filterFind: FilterQuery<CommandeInterface> = role.trim().toLowerCase() === "livreur" ? { livreurID: id } : { clientID: id };
                    CommandeModel.find(filterFind).populate('clientID').populate('livreurID').populate('articles.idProduct').populate('articles.listeComposantsSelected.idComposant').exec(async(err: CallbackError, commandes: any[]) => {
                        if (err) {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                        }else if (commandes === undefined || commandes === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        }else{
                            if(commandes){
                                if(commandes.length > 0){
                                    commandes.forEach((commande: any) => {
                                        commande.articles.forEach((article: any) => {
                                            article.idProduct = article.idProduct !== null && article.idProduct !== undefined ? deleteMapper(article.idProduct) : article.idProduct;
                                            article.listeComposantsSelected.forEach((el: any) => {
                                                el.idComposant = el.idComposant !== null && el.idComposant !== undefined ? el.idComposant = deleteMapper(el.idComposant) : el.idComposant
                                            });
                                            article = article !== null && article !== undefined ? deleteMapper(article) : article;
                                        })
                                        commande.clientID = commande.clientID !== null && commande.clientID !== undefined ? deleteMapper(commande.clientID) : commande.clientID;
                                        commande.livreurID = commande.livreurID !== null && commande.livreurID !== undefined ? deleteMapper(commande.livreurID) : commande.livreurID;
                                    });
                                }
                                return dataResponse(res, 200, {
                                    error: false,
                                    message: `Les commandes liées au ${role.trim().toLowerCase()} ont bien été récupéré`,
                                    commandes: commandes.map((item: any) => deleteMapper(item)),
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
 *  Route update commande
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const updateCommande = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            const data = req.body;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await CommandeModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    if(isEmptyObject(data) || (!exist(data.statut) && !exist(data.livreurID) && !exist(data.dateLivraison) && !exist(data.adresseLivraison))){
                        return dataResponse(res, 200, { error: false, message: "Vos données sont déjà à jour" })
                    }else{
                        const commande: CommandeInterface | null = await CommandeModel.findById(id);
                        if(commande === null || commande === undefined){
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !"})
                        }else{
                            let isError: boolean = false;
                            let isValidStatut: boolean = exist(data.statut) ? data.statut.trim().toLowerCase() === "attente" || data.statut.trim().toLowerCase() === "livraison" || data.statut.trim().toLowerCase() === "signalement" || data.statut.trim().toLowerCase() === "termine" ? true : false : false;
                            let isVerifLivreur: boolean = await UserModel.countDocuments({ $and: [{ _id: data.livreurID }, { role: "Livreur" }] } ) === 0 ? false : true; 
                            let toUpdate = {
                                livreurID: exist(data.livreurID) ? isObjectIdValid(data.livreurID) && isVerifLivreur ? data.livreurID : (isError = true) : commande.livreurID,
                                dateLivraison: exist(data.dateLivraison) ? dateHourMinuFormatEn(data.dateLivraison) ? data.dateLivraison : (isError = true) : commande.dateLivraison,
                                adresseLivraison: exist(data.adresseLivraison) ? isValidLength(data.adresseLivraison,1,100) ? data.adresseLivraison : (isError = true) : commande.adresseLivraison,
                                statut: exist(data.statut) ? textFormat(data.statut) && isValidStatut ? firstLetterMaj(data.statut) : (isError = true) : commande.statut,
                                objetSignalement: exist(data.objetSignalement) ? isValidLength(data.objetSignalement,1,200) && isValidStatut ? data.objetSignalement : (isError = true) : commande.objetSignalement,
                                typeSignalement: exist(data.typeSignalement) ? textFormat(data.typeSignalement) && isValidStatut ? data.typeSignalement : (isError = true) : commande.typeSignalement,
                                cheminSignature: exist(data.cheminSignature) ? isValidLength(data.cheminSignature, 1, 500) && isValidStatut ? data.cheminSignature : (isError = true) : commande.cheminSignature,
                            }
                            //TODO SEND MAIL IF DATELIVRAISON/ADRESSELIVRAISON/LIVREURDID/STATUT UPDATED
                            if(isError){
                                return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                            }else{
                                //toUpdate.statut = commande.statut.trim().toLowerCase() === "attente" && isObjectIdValid(data.livreurID) && isVerifLivreur ? "Livraison" : toUpdate.statut;
                                //toUpdate.statut = commande.statut.trim().toLowerCase() === "termine" ? commande.statut : toUpdate.statut;
                                await CommandeModel.findByIdAndUpdate(id, toUpdate, null, (err: any, resp: CommandeInterface | null) => {
                                    if (err) {
                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                                    } else {
                                        return dataResponse(res, 200, { error: false, message: "La commande a bien été mise à jour" })
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}