import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { dataResponse, deleteMapper, exist, existTab, getJwtPayload, isObjectIdValid, isValidLength, numberFormat, renameKey, tabFormat, textFormat } from '../middlewares';
import { Application, Request, Response, NextFunction, Errback } from 'express';
import PanierModel from '../models/PanierModel';
import PanierInterface from '../interfaces/PanierInterface';
import ProductSelectedModel from '../models/ProductSelectedModel';
import ProduitSelectedInterface from '../interfaces/ProductSelectedInterface';
import ProductModel from '../models/ProductModel';
import UserModel from '../models/UserModel';
import UserInterface from '../interfaces/UserInterface';
import ComposantSelectedInterface from '../interfaces/ComposantSelectedInterface';
import ComposantModel from '../models/ComposantModel';
import ProductInterface from '../interfaces/ProductInterface';

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
                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                }else{
                    if (user) {
                        if(!exist(data.idProduct) || !exist(data.matiere) || !exist(data.couleur) || !exist(data.quantite) || !existTab(data.listeComposantsSelected)){
                            return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
                        }else{
                            if((!isObjectIdValid(data.idProduct) || await ProductModel.countDocuments({ _id: data.idProduct}) === 0) || 
                            !textFormat(data.matiere) || !textFormat(data.couleur) || !numberFormat(data.quantite) || !tabFormat(data.listeComposantsSelected)){
                                return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                            }else{
                                let isComposantErrorExist: boolean = false;
                                let isComposantErrorInvalide: boolean = false;
                                if(data.listeComposantsSelected.length > 0){
                                    data.listeComposantsSelected.forEach(async(el: any) => {
                                        if(!exist(el.idComposant) || !exist(el.matiere) || !exist(el.couleur) || !exist(el.quantite)){
                                            isComposantErrorExist = true;
                                        }else{
                                            if(!isObjectIdValid(el.idComposant) || !textFormat(el.matiere) || !numberFormat(el.quantite) || !textFormat(el.couleur) || await ComposantModel.countDocuments({ _id: el.idComposant}) === 0){
                                                isComposantErrorInvalide = true;
                                            }
                                        }
                                    });
                                }
                                if(isComposantErrorExist){
                                    return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
                                }else if(isComposantErrorInvalide){
                                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                                }else{
                                    let toInsert = {
                                        "refID": uuidv4(),
                                        "idProduct": data.idProduct,
                                        "matiere": data.matiere,
                                        "couleur": data.couleur,
                                        "quantite": data.quantite,
                                        "listeComposantsSelected": data.listeComposantsSelected,//idComposantSelected
                                        "isCommande": false
                                    };
                                    let productSelected: ProduitSelectedInterface = new ProductSelectedModel(toInsert);
                                    const productSelectedSaved: ProduitSelectedInterface = await productSelected.save();
                                    await PanierModel.findOne({ _id: user.idPanier }, async(err: Error, response: PanierInterface) => {
                                        if (err) {
                                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
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
                }
            });
        }
    }).catch((error) => {
        throw error;
    });
};

/**
 *  Route retire article panier
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            await UserModel.findOne({ _id: payload.id }, async(err: Error, user: UserInterface) => {
                if (err || user === undefined || user === null) {
                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                }else{
                    if (user) {
                        const id = req.params.id;
                        if(!exist(id)){
                            return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
                        }else{
                            if(!isObjectIdValid(id) || await ProductSelectedModel.countDocuments({ _id: id}) === 0){
                                return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                            }else{
                                await PanierModel.findOne({ _id: user.idPanier }, async(err: Error, response: PanierInterface) => {
                                    if (err) {
                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                                    }else if (response === undefined || response === null){// Si le resultat n'existe pas
                                        return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                                    } else {
                                        if (response) {
                                            let panier: Array<string> = response.articles;
                                            panier = panier.filter((item: string) => item !== id)
                                            await PanierModel.findByIdAndUpdate(user.idPanier, { articles: panier }, null, (err: Error, resp: any) => {
                                                if (err) {
                                                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                                                } else {
                                                    ProductSelectedModel.findOne({ _id: id }, async(err: Error, productSelected: ProduitSelectedInterface) => {
                                                        if(err){
                                                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                                                        }else{
                                                            if(!productSelected.isCommande){
                                                                await ProductSelectedModel.findOneAndDelete({ _id : id });
                                                            }
                                                            return dataResponse(res, 201, { error: false, message: 'L\'article a bien été retiré du panier' });
                                                        }
                                                    })
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
    }).catch((error) => {
        throw error;
    });
};

/**
 *  Route get one article panier
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getArticle = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            await UserModel.findOne({ _id: payload.id }, async(err: Error, user: UserInterface) => {
                if (err || user === undefined || user === null) {
                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                }else{
                    if (user) {
                        const id = req.params.id;
                        if(!exist(id)){
                            return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
                        }else{
                            if(!isObjectIdValid(id) || await ProductSelectedModel.countDocuments({ _id: id}) === 0){
                                return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                            }else{
                                await ProductSelectedModel.findOne({ _id: id }, async(err: Error, response: ProduitSelectedInterface) => {
                                    if (err) {
                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                                    }else if (response === undefined || response === null){// Si le resultat n'existe pas
                                        return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                                    } else {
                                        if (response) {
                                            await ProductModel.findOne({ _id: response.idProduct }, async(err: Error, produit: ProductInterface) => {
                                                if (err) {
                                                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                                                }else if (response === undefined || response === null){// Si le resultat n'existe pas
                                                    return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                                                } else{
                                                    let infosArticle = getInfosArticle(produit, true);
                                                    return dataResponse(res, 200, {
                                                        error: false,
                                                        message: "Les informations ont bien été récupéré",
                                                        article: deleteMapper(response, "getArticle"),//TODO OBJECT ASSIGN
                                                        produit: infosArticle//TODO OBJECT ASSIGN
                                                    });
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
    }).catch((error) => {
        throw error;
    });
};

const getInfosArticle = (article: any, isProduit: boolean): any => {
    article.idStripeProduct = undefined;
    article.idStripePrice = undefined;
    article.imgLink = undefined;
    article.createdAt = undefined;
    article.updateAt = undefined;
    article._id = null;//
    article.composants = undefined;
    article.matieres = undefined;
    article.couleurs = undefined;
    isProduit ? article.quantite = undefined : null;
    article.updatedAt = undefined;
    article.__v = undefined;
    article.refID = undefined;
    return article;
}

/**
 *  Route all articles panier
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllArticles = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            await UserModel.findOne({ _id: payload.id }, async(err: Error, user: UserInterface) => {
                if (err || user === undefined || user === null) {
                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                }else{
                    if (user) {
                        await PanierModel.findOne({ _id: user.idPanier }, async(err: Error, response: PanierInterface) => {
                            if (err) {
                                return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                            }else if (response === undefined || response === null){// Si le resultat n'existe pas
                                return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                            } else {
                                if (response) {
                                    let toReturn: Array<any>;//TODO
                                    return dataResponse(res, 200, {
                                        error: false,
                                        message: "Les articles ont bien été récupéré",
                                        articles: deleteMapper(response.articles) //TODO response.articles.map((item: string) => {})
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
            });
        }
    }).catch((error) => {
        throw error;
    });
};

/**
 *  Route update article panier
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
    //TODO
};