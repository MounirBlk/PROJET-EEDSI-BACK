import { Application, Request, Response, NextFunction, Errback } from 'express';
import { dataResponse, dateFormatFr, deleteMapper, emailFormat, dateFormatEn, exist, getJwtPayload, isEmptyObject, isValidLength, numberFormat, passwordFormat, randChars, randomNumber, textFormat, isObjectIdValid } from '../middlewares';
import EntrepriseInterface from '../interfaces/EntrepriseInterface';
import EntrepriseModel from '../models/EntrepriseModel';
import axios, { AxiosResponse, Method } from "axios"
//const axios = require('axios').default;

/**
 *  Route ajout entreprise manuelle
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const newEntreprise = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const data = req.body;
            if(isEmptyObject(data) || !exist(data.nom) || !exist(data.adresse) || !exist(data.categorieEntreprise) || 
            !exist(data.etatAdministratif) || !exist(data.siret) || !exist(data.categorieJuridique)){
                return dataResponse(res, 400, { error: true, message: 'Une ou plusieurs données obligatoire sont manquantes' })
            }else{
                if(isEmptyObject(data) || !textFormat(data.nom)  || !textFormat(data.categorieEntreprise) || !isValidLength(data.siret.trim(), 14, 14) || data.siret.trim().match(/^[0-9]*$/gm) == null ||
                data.etatAdministratif.toLowerCase() !== 'actif' && data.etatAdministratif.toLowerCase() !== 'ferme' || !isValidLength(data.adresse, 1, 50) || !numberFormat(data.categorieJuridique)){
                    return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                }else{
                    if(await EntrepriseModel.countDocuments({ siret: data.siret.trim()}) !== 0){// Email already exist
                        return dataResponse(res, 409, { error: true, message: "Cette entreprise est déjà enregistré" });
                    }else{
                        const toInsert = {
                            siret: data.siret,
                            nom: data.nom,
                            adresse: data.adresse,
                            categorieEntreprise : data.categorieEntreprise,
                            etatAdministratif: data.etatAdministratif,
                            categorieJuridique: data.categorieJuridique
                        }
                        let entreprise: EntrepriseInterface = new EntrepriseModel(toInsert);
                        await entreprise.save().then(async(entreprise: EntrepriseInterface) => {
                            return dataResponse(res, 201, { error: false, message: "L'entreprise a bien été ajoutée avec succès" });
                        }).catch(() => {
                            return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                        });
                    }
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route ajout entreprise automatique
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const newEntrepriseAuto = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const data = req.body;
            if(isEmptyObject(data) || !exist(data.siret)){
                return dataResponse(res, 400, { error: true, message: 'Le siret ne peut pas être vide' })
            }else{
                if(!isValidLength(data.siret.trim(), 14, 14) || data.siret.trim().match(/^[0-9]*$/gm) == null){
                    return dataResponse(res, 409, { error: true, message: "Le siret n'est pas valide" })
                }else{
                    if(await EntrepriseModel.countDocuments({ siret: data.siret.trim()}) !== 0){// Email already exist
                        return dataResponse(res, 409, { error: true, message: "Cette entreprise est déjà enregistré" });
                    }else{
                        await getInfosEntrepriseOnline(res, data.siret.trim()).then(async(resp: Response) => {
                            let entreprise: EntrepriseInterface = new EntrepriseModel(resp);
                            await entreprise.save().then(async(entreprise: EntrepriseInterface) => {
                                return dataResponse(res, 201, { error: false, message: "L'entreprise a bien été ajoutée avec succès" });
                            }).catch(() => {
                                return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" });
                            });
                        }).catch((error: Error) => {
                            //throw error;
                            dataResponse(res, 409, { error: true, message: "Le siret n'est pas valide" })
                        });
                    }
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route update entreprise
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const updateEntreprise = async (req: Request, res: Response): Promise<void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            const data = req.body;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await EntrepriseModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    const entreprise: EntrepriseInterface | null = await EntrepriseModel.findById(id);
                    if(entreprise === null || entreprise === undefined){
                        return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !"})
                    }else{
                        let isOnError: boolean = false;
                        let toUpdate = {
                            nom: exist(data.nom) ? textFormat(data.nom) ? data.nom : (isOnError = true) : entreprise.nom,
                            adresse: exist(data.adresse) ? isValidLength(data.adresse, 1, 50) ? data.adresse : (isOnError = true) : entreprise.adresse,
                            telephone: exist(data.telephone) ? isValidLength(data.telephone, 1, 25) ? data.telephone : (isOnError = true) : entreprise.telephone,
                            categorieEntreprise: exist(data.categorieEntreprise) ? textFormat(data.categorieEntreprise) ? data.categorieEntreprise : (isOnError = true) : entreprise.categorieEntreprise,
                            categorieJuridique: exist(data.categorieJuridique) ? numberFormat(data.categorieJuridique) ? data.categorieJuridique : (isOnError = true) : entreprise.categorieJuridique,
                            dateCreation: exist(data.dateCreation) ? dateFormatEn(data.dateCreation) ? data.dateCreation : (isOnError = true) : entreprise.dateCreation,
                            etatAdministratif: exist(data.etatAdministratif) ? data.etatAdministratif.toLowerCase() === 'actif' || data.etatAdministratif.toLowerCase() === 'ferme' ? data.etatAdministratif : (isOnError = true) : entreprise.etatAdministratif,
                            numeroTvaIntra: exist(data.numeroTvaIntra) ? textFormat(data.numeroTvaIntra) ? data.numeroTvaIntra : (isOnError = true) : entreprise.numeroTvaIntra,
                        }
                        if(isOnError){
                            return dataResponse(res, 409, { error: true, message: "Une ou plusieurs données sont erronées"}) 
                        }else{
                            await EntrepriseModel.findByIdAndUpdate(id, toUpdate, null, (err: Error, resp: any) => {
                                if (err) {
                                    return dataResponse(res, 500, { error: true, message: "Erreur dans la requête !" })
                                } else {
                                    return dataResponse(res, 200, { error: false, message: "L'entreprise a bien été mise à jour" })
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

/**
 *  Route delete entreprise
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const deleteEntreprise = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await EntrepriseModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    await EntrepriseModel.findOneAndDelete({ _id : id });
                    return dataResponse(res, 200, { error: false, message: 'L\'entreprise a été supprimé avec succès' })
                }
            }
        }
    }).catch((error) => {
        throw error;
    });
}

/**
 *  Route recuperation d'une entreprise
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getEntreprise = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            const id = req.params.id;
            if(!exist(id)){
                return dataResponse(res, 400, { error: true, message: "L'id est manquant !" })
            }else{
                if(!isObjectIdValid(id) || await EntrepriseModel.countDocuments({ _id: id}) === 0){
                    return dataResponse(res, 409, { error: true, message: "L'id n'est pas valide !" })
                }else{
                    await EntrepriseModel.findOne({ _id: id }, (err: Error, results: Response) => {
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
                                    message: "Les informations de l'entreprise ont bien été récupéré",
                                    entreprise: deleteMapper(results, 'getEntreprise') 
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
 *  Route recuperation des entreprises
 *  @param {Request} req 
 *  @param {Response} res 
 */ 
export const getAllEntreprises = async (req: Request, res: Response) : Promise <void> => {
    await getJwtPayload(req.headers.authorization).then(async (payload) => {
        if(payload === null || payload === undefined){
            return dataResponse(res, 401, { error: true, message: 'Votre token n\'est pas correct' })
        }else{
            await EntrepriseModel.find({}, (err: Error, results: Array<EntrepriseInterface>) => {
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
                            message: "Les entreprises ont bien été récupéré",
                            entreprises: results.map((item: EntrepriseInterface) => deleteMapper(item, 'getEntreprises'))
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
 *  Route get infos entreprise online
 *  @param {Response} res 
 *  @param {number} siret 
 */ 
const getInfosEntrepriseOnline = async (res: Response, siret: number): Promise<any> => {
    return new Promise(async(resolve, reject) => {
        await axios(getConfigAxios(`https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siret}`,'get'))
            .then(({ data: response } : AxiosResponse) => {//CIRCULAR JSON (RETURN response)
                //fs.writeFileSync('log.json', JSON.stringify(response))
                if(response !== undefined && response !== null){
                    let dataToReturn = {
                        siret: siret,
                        nom: exist(response.etablissement.unite_legale.denomination) ? response.etablissement.unite_legale.denomination : null,
                        adresse: exist(response.etablissement.geo_adresse) ? response.etablissement.geo_adresse : null,
                        telephone: null,
                        siren: exist(response.etablissement.siren) ? response.etablissement.siren : null,
                        categorieEntreprise: exist(response.etablissement.unite_legale.categorie_entreprise) ? response.etablissement.unite_legale.categorie_entreprise : null,
                        categorieJuridique: exist(response.etablissement.unite_legale.categorie_juridique) ? response.etablissement.unite_legale.categorie_juridique : null,
                        dateCreation: exist(response.etablissement.unite_legale.date_creation) ? response.etablissement.unite_legale.date_creation : null,
                        etatAdministratif: exist(response.etablissement.unite_legale.etat_administratif) ? response.etablissement.unite_legale.etat_administratif : null,
                        numeroTvaIntra: exist(response.etablissement.unite_legale.numero_tva_intra) ? response.etablissement.unite_legale.numero_tva_intra : null,
                    }
                    dataToReturn.etatAdministratif = dataToReturn.etatAdministratif.toLowerCase() === 'a' ? 'Actif' : 'Ferme'
                    resolve(dataToReturn)
                }else{
                    reject(dataResponse(res, 409, { error: true, message: "Le siret n'est pas valide" }))
                }
            }).catch((error: any) => {
                console.log(error)
                reject(error)
            })
    });
}

/**
 *  Request config 
 *  @param url url
 *  @param methodReq post / get / put / delete ...
 *  @param dataBody? data from body
 */ 
const getConfigAxios = (url: string, methodReq: Method, dataBody: any = null) => {
    const configaxios = {
        url: url.trim(),
        method: methodReq,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        data: dataBody
    };
    dataBody === null ? delete configaxios.data : null;
    return configaxios;
}