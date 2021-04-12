import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { dataResponse, dateHourMinuFormatEn, deleteMapper, exist, existTab, getJwtPayload, isEmptyObject, isObjectIdValid, isValidLength, numberFormat, renameKey, tabFormat, textFormat } from '../middlewares';
import { Application, Request, Response, NextFunction, Errback } from 'express';
import { CallbackError, Schema } from 'mongoose';
import UserModel from '../models/UserModel';
import UserInterface from '../interfaces/UserInterface';
import CommandeInterface from '../interfaces/CommandeInterface';
import CommandeModel from '../models/CommandeModel';
import ProductSelectedModel from '../models/ProductSelectedModel';
import ProduitSelectedInterface from '../interfaces/ProductSelectedInterface';

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
                if(!dateHourMinuFormatEn(data.dateLivraison) || !textFormat(data.adresseLivraison)){
                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                }else if(new Date(data.dateLivraison).getTime() < new Date().getTime() + (7 * 24 * 60 * 60000)){// 7 jours d'écart minimum
                    return dataResponse(res, 400, { error: true, message: "La date de livraison est indisponible (7 jours d'écart minimum)"}) 
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
                                                let toInsert = {
                                                    "refID": uuidv4(),
                                                    "clientID": payload.id,
                                                    "livreurID": null,
                                                    "dateLivraison": data.dateLivraison, // YYYY-MM-DD hh:mm
                                                    "adresseLivraison": data.adresseLivraison,
                                                    "statut": "Attente",
                                                    "articles": articles,
                                                    "prixTotal": prixTotal
                                                }
                                                let commande: CommandeInterface = new CommandeModel(toInsert);
                                                await commande.save();
                                                //TODO UPDATE QUANTITE DU PRODUIT/COMPOSANT AND SEND MAIL CLIENT
                                                return dataResponse(res, 201, { error: false, message: "La commande a bien été ajouté" });
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
export const deleteCommande = async (req: Request, res: Response): Promise<void> => {}

/**
 *  Route get one commande
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getCommande = async (req: Request, res: Response): Promise<void> => {}

/**
 *  Route all commandes par le statut
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllCommandesByStatut = async (req: Request, res: Response): Promise<void> => {}

/**
 *  Route get all commande from user
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllCommandesByUser = async (req: Request, res: Response): Promise<void> => {}

/**
 *  Route update commande
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const updateCommande = async (req: Request, res: Response): Promise<void> => {}