import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { dataResponse, dateHourMinuFormatEn, deleteMapper, exist, existTab, firstLetterMaj, getCurrentDate, getCurrentDateNextMonth, getJwtPayload, isEmptyObject, isObjectIdValid, isValidLength, numberFormat, payloadTokenInterface, renameKey, tabFormat, textFormat } from '../middlewares';
import { Application, Request, Response, NextFunction, Errback } from 'express';
import { CallbackError, FilterQuery, Schema } from 'mongoose';
import CommandeModel from '../models/CommandeModel';
import { mailInvoice } from '../middlewares/sendMail';
import { generateInvoice, getInvoiceData } from '../middlewares/invoice';
import ProduitSelectedInterface from '../interfaces/ProductSelectedInterface';
import PanierModel from '../models/PanierModel';
import ProductModel from '../models/ProductModel';
import ProductSelectedModel from '../models/ProductSelectedModel';
import UserModel from '../models/UserModel';
import CommandeInterface from '../interfaces/CommandeInterface';

/**
 *  Route envoie devis par mail
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const generateDevisMail = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload: payloadTokenInterface | null) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            if(payload.role !== "Administrateur" && payload.role !== "Commercial") return dataResponse(res, 401, { error: true, message: 'Vous n\'avez pas l\'autorisation d\'effectuer cette action' });
            const id = req.params.id;//idUSER
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await UserModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    const data = req.body;
                    if(!exist(data.idProduct) || !exist(data.matiere) || !exist(data.couleur) || !exist(data.quantite)){
                        return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
                    }else{
                        if((!isObjectIdValid(data.idProduct) || await ProductModel.countDocuments({ _id: data.idProduct}) === 0) || 
                        !textFormat(data.matiere) || !textFormat(data.couleur) || !numberFormat(data.quantite)){
                            return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                        }else{
                            let toInsert = {
                                "refID": uuidv4(),
                                "idProduct": data.idProduct,
                                "matiere": data.matiere,
                                "couleur": data.couleur,
                                "quantite": data.quantite,
                                "listeComposantsSelected": [],//
                                "isCommande": false
                            };
                            let productSelected: ProduitSelectedInterface = new ProductSelectedModel(toInsert);
                            const productSelectedSaved: ProduitSelectedInterface = await productSelected.save();
                            UserModel.findOne({ _id: id }).populate('idPanier').exec(async(err: CallbackError, user: any) => {
                                if (err) {
                                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                                }else if (user === undefined || user === null){// Si le resultat n'existe pas
                                    return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                                }else{
                                    if (user) {
                                        let panier: Array<ProduitSelectedInterface> = user.idPanier.articles;
                                        panier.push(productSelectedSaved.get('_id'))
                                        await PanierModel.findByIdAndUpdate(user.idPanier, { articles: panier }, null, async(err: Error, resp: any) => {
                                            if (err) {
                                                return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                                            } else {
                                                let userInfos: any = await UserModel.findOne({ _id: id }).populate('idEntreprise').populate('idPanier');
                                                ProductSelectedModel.find({ '_id': { $in: userInfos.idPanier.articles }}).populate('idProduct').populate('listeComposantsSelected.idComposant').exec(async(err: CallbackError, articles: any) => {
                                                    if(err){
                                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                                                    }else{
                                                        if (articles) {
                                                            let prixTotal: number = 0;
                                                            articles.forEach((article: any) => {
                                                                prixTotal = prixTotal + parseInt(article.quantite) * parseFloat(article.idProduct.prix);
                                                                article.listeComposantsSelected.forEach((composant: any) => {
                                                                    prixTotal = prixTotal + (parseInt(article.quantite) * (parseInt(composant.quantite) * parseFloat(composant.idComposant.prix)));
                                                                });
                                                            });
                                                            prixTotal = prixTotal + 10 + (prixTotal * 0.05) //Frais de livraison de 10 € + 5% du total (taxe/impôt)
                                                            let commandeToInsert = {
                                                                "refID": uuidv4(),
                                                                "clientID": id,
                                                                "livreurID": null,
                                                                "dateLivraison": getCurrentDateNextMonth(), // YYYY-MM-DD hh:mm
                                                                "adresseLivraison": "70 Rue Marius Aufan, 92300 Levallois-Perret",
                                                                "statut": "Attente",
                                                                "articles": articles,
                                                                "prixTotal": prixTotal.toFixed(2)
                                                            }
                                                            let commande: CommandeInterface = new CommandeModel(commandeToInsert);
                                                            await commande.save().then(async(commandeSaved: CommandeInterface) => {
                                                                CommandeModel.findOne({ _id: commandeSaved.get('_id')}).populate('clientID').populate('livreurID').populate('articles.idProduct').populate('articles.listeComposantsSelected.idComposant').exec(async(err: CallbackError, response: any) => {
                                                                    if (err) {
                                                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                                                                    }else if (response === undefined || response === null){// Si le resultat n'existe pas
                                                                        return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                                                                    }else{
                                                                        await PanierModel.findByIdAndUpdate(user.idPanier, { articles: [] });
                                                                        if(String(process.env.ENV).trim().toLowerCase() !== "test"){
                                                                            await generateInvoice(getInvoiceData(response), response.refID);
                                                                            await mailInvoice(response.clientID.email, `${response.clientID.firstname} ${response.clientID.lastname}`, response.refID);
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
                                        });
                                    }
                                }
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