import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { dataResponse, exist, existTab, getJwtPayload, isObjectIdValid, isValidLength, numberFormat, tabFormat, textFormat } from '../middlewares';
import { Application, Request, Response, NextFunction, Errback } from 'express';
import PanierModel from '../models/PanierModel';
import PanierInterface from '../interfaces/PanierInterface';
import ProductSelectedModel from '../models/ProductSelectedModel';
import ProduitSelectedInterface from '../interfaces/ProductSelectedInterface';
import ProductModel from '../models/ProductModel';
import UserModel from '../models/UserModel';
import UserInterface from '../interfaces/UserInterface';

/**
 *  Route add article panier
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const addArticle = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const data = req.body;
            await UserModel.findOne({ _id: payload.id }, async(err: Error, user: UserInterface) => {
                if (err || user === undefined || user === null) {
                    return dataResponse(res, 500, {
                        error: true,
                        message: "Erreur dans la requête !"
                    });
                }else{
                    if (user) {
                        if(!exist(data.idProduct) || !exist(data.matiere) || !exist(data.couleur) || !exist(data.quantite) || !existTab(data.listeComposantsSelected)){
                            return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
                        }else{
                            if((!isObjectIdValid(data.idProduct) || await ProductModel.countDocuments({ _id: data.idProduct}) === 0) || 
                            !textFormat(data.matiere) || !textFormat(data.couleur) || !numberFormat(data.quantite) || !tabFormat(data.listeComposantsSelected)){
                                return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                            }else{
                                let toInsert = {
                                    "refID": uuidv4(),
                                    "idProduct": data.idProduct,
                                    "matiere": data.matiere,
                                    "couleur": data.couleur,
                                    "quantite": data.quantite,
                                    "listeComposantsSelected": data.listeComposantsSelected//idComposantSelected
                                };
                                let productSelected: ProduitSelectedInterface = new ProductSelectedModel(toInsert);
                                const productSelectedSaved: ProduitSelectedInterface = await productSelected.save();
                                await PanierModel.findOne({ _id: user.idPanier }, async(err: Error, response: PanierInterface) => {
                                    if (err) {
                                        return dataResponse(res, 500, {
                                            error: true,
                                            message: "Erreur dans la requête !"
                                        });
                                    }else if (response === undefined || response === null){// Si le resultat n'existe pas
                                        return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                                    } else {
                                        if (response) {
                                            let panier: Array<string> = response.articles;
                                            panier.push(productSelectedSaved.get('_id'))
                                            await PanierModel.findByIdAndUpdate(user.idPanier, { articles: panier }, null, (err: Error, resp: any) => {
                                                if (err) {
                                                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                                                } else {
                                                    return dataResponse(res, 201, { error: false, message: 'L\'article a bien été ajouté au panier' });
                                                }
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
                }
            });
        }
    });
};

/**
 *  Route retire article panier
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {

};

/**
 *  Route get one article panier
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getArticle = async (req: Request, res: Response): Promise<void> => {

};

/**
 *  Route all articles panier
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllArticles = async (req: Request, res: Response): Promise<void> => {

};

/**
 *  Route update article panier
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const updateArticle = async (req: Request, res: Response): Promise<void> => {

};