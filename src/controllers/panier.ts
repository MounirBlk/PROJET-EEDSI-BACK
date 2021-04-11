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
import { CallbackError, Schema } from 'mongoose';

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
                        let produit: any = await ProductModel.findOne({ _id: data.idProduct })
                        data.listeComposantsSelected.forEach(async(el: any) => {
                            if(!exist(el.idComposant) || !exist(el.matiere) || !exist(el.couleur) || !exist(el.quantite)){
                                isComposantErrorExist = true;
                            }else{
                                //produit.composants.some((item: any) => { el.idComposant === item.toString() })
                                let isComposantNotAvailable: boolean = false;
                                produit.composants.forEach((item: any) => { 
                                    isComposantNotAvailable = el.idComposant !== item.toString() ? true : isComposantNotAvailable
                                })
                                if(!isObjectIdValid(el.idComposant) || !textFormat(el.matiere) || !numberFormat(el.quantite) || !textFormat(el.couleur) || isComposantNotAvailable){
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
                        UserModel.findOne({ _id: payload.id }).populate('idPanier').exec(async(err: CallbackError, user: any) => {
                            if (err) {
                                return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                            }else if (user === undefined || user === null){// Si le resultat n'existe pas
                                return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                            }else{
                                if (user) {
                                    let panier: Array<ProduitSelectedInterface> = user.idPanier.articles;
                                    panier.push(productSelectedSaved.get('_id'))
                                    await PanierModel.findByIdAndUpdate(user.idPanier, { articles: panier }, null, (err: Error, resp: any) => {
                                        if (err) {
                                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                                        } else {
                                            return dataResponse(res, 201, { error: false, message: 'L\'article a bien été ajouté au panier' });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            }
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
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await ProductSelectedModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    UserModel.findOne({ _id: payload.id }).populate('idPanier').exec(async(err: CallbackError, user: any) => {
                        if (err) {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                        }else if (user === undefined || user === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        }else{
                            user.idPanier.articles = user.idPanier.articles.filter((item: string) => item.toString() !== id)
                            await PanierModel.findByIdAndUpdate(user.idPanier._id, { articles: user.idPanier.articles }, null, (err: Error, resp: any) => {
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
                        }
                    });
                }
            }

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
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await ProductSelectedModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    ProductSelectedModel.findOne({ _id: id }).populate('idProduct').populate('listeComposantsSelected.idComposant').exec((err: CallbackError, article: any) => {
                        if (err) {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                        } else if (article === undefined || article === null){// Si le resultat n'existe pas
                            return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                        } else {
                            if (article) {
                                article.idProduct = article.idProduct !== null && article.idProduct !== undefined ? deleteMapper(article.idProduct) : article.idProduct;
                                article.listeComposantsSelected.forEach((el:any) => {
                                    el.idComposant = el.idComposant !== null && el.idComposant !== undefined ? el.idComposant = deleteMapper(el.idComposant) : el.idComposant
                                });
                                return dataResponse(res, 200, {
                                    error: false,
                                    message: "Les informations ont bien été récupéré",
                                    article: deleteMapper(article, "getArticle"),
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
};


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
            UserModel.findOne({ _id: payload.id }).populate('idPanier').exec(async(err: CallbackError, user: any) => {
                if (err) {
                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                } else if (user === undefined || user === null){// Si le resultat n'existe pas
                    return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                } else{
                    if (user) {
                        ProductSelectedModel.find({ '_id': { $in: user.idPanier.articles }}).populate('idProduct').populate('listeComposantsSelected.idComposant').exec((err: CallbackError, articles: ProduitSelectedInterface[]) => {
                            if (err) {
                                return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                            } else if (articles === undefined || articles === null){// Si le resultat n'existe pas
                                return dataResponse(res, 400, { error: true, message: "Aucun résultat pour la requête" });
                            } else {
                                if (articles) {
                                    articles.forEach((article: any) => {
                                        article.idProduct = article.idProduct !== null && article.idProduct !== undefined ? deleteMapper(article.idProduct) : article.idProduct;
                                        article.listeComposantsSelected.forEach((el:any) => {
                                            el.idComposant = el.idComposant !== null && el.idComposant !== undefined ? el.idComposant = deleteMapper(el.idComposant) : el.idComposant
                                        });
                                        article = article !== null && article !== undefined ? deleteMapper(article) : article;
                                    })
                                    return dataResponse(res, 200, {
                                        error: false,
                                        message: "Les articles ont bien été récupéré",
                                        articles: deleteMapper(articles)
                                    });
                                } else {
                                    return dataResponse(res, 401, {
                                        error: true,
                                        message: "La requête en base de donnée n'a pas fonctionné"
                                    });
                                }
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
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await ProductSelectedModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    const data = req.body;
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
                                let produit: any = await ProductModel.findOne({ _id: data.idProduct })
                                data.listeComposantsSelected.forEach(async(el: any) => {
                                    if(!exist(el.idComposant) || !exist(el.matiere) || !exist(el.couleur) || !exist(el.quantite)){
                                        isComposantErrorExist = true;
                                    }else{
                                        //produit.composants.some((item: any) => { el.idComposant === item.toString() })
                                        let isComposantNotAvailable: boolean = false;
                                        produit.composants.forEach((item: any) => { 
                                            isComposantNotAvailable = el.idComposant !== item.toString() ? true : isComposantNotAvailable
                                        })
                                        if(!isObjectIdValid(el.idComposant) || !textFormat(el.matiere) || !numberFormat(el.quantite) || !textFormat(el.couleur) || isComposantNotAvailable){
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
                                let toUpdate = {
                                    "idProduct": data.idProduct,
                                    "matiere": data.matiere,
                                    "couleur": data.couleur,
                                    "quantite": data.quantite,
                                    "listeComposantsSelected": data.listeComposantsSelected,//idComposantSelected
                                };
                                await ProductSelectedModel.findByIdAndUpdate(id, toUpdate, null, (err: any, resp: ProduitSelectedInterface | null) => {
                                    if (err) {
                                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                                    } else {
                                        return dataResponse(res, 200, { error: false, message: "L'article a bien été mise à jour" })
                                    }
                                })
                            }
                        }
                    }
                }
            }
        }
    });
};